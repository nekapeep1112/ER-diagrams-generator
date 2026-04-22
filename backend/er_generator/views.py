import time
from django.core.cache import cache
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter

from django.conf import settings

from .models import Chat, Message, SavedSchema, Tag
from .serializers import (
    ChatListSerializer,
    ChatDetailSerializer,
    ChatCreateSerializer,
    ChatUpdateSerializer,
    MessageCreateSerializer,
    MessageSerializer,
    SavedSchemaSerializer,
    SavedSchemaCreateSerializer,
    TagSerializer,
)
from .services.openai_service import generate_er_model, generate_chat_title
from .authentication import JWTAuthentication
from .permissions import IsProUser, is_pro


FREE_SCHEMA_LIMIT = 5


def _chats_version_key(user_id):
    return f'chats_version:{user_id}'


def _schemas_version_key(user_id):
    return f'schemas_version:{user_id}'


def _get_version(key):
    ver = cache.get(key)
    if ver is None:
        ver = int(time.time() * 1000)
        cache.set(key, ver, None)
    return ver


def _bump_version(key):
    """Ставит уникальную версию (timestamp ms), чтобы все старые cache_key стали невалидными."""
    cache.set(key, int(time.time() * 1000), None)


def _private_cache_headers(response, max_age):
    response['Cache-Control'] = f'private, max-age={max_age}'
    return response


class ChatListView(APIView):
    """Список чатов и создание нового чата."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Получить список чатов",
        description="Возвращает список чатов текущего пользователя. Поддерживает ?search=<q> по title и содержимому сообщений.",
        parameters=[OpenApiParameter('search', str, required=False, description='Поиск по названию и сообщениям')],
        responses={200: ChatListSerializer(many=True)},
    )
    def get(self, request):
        search = (request.query_params.get('search') or '').strip()
        version = _get_version(_chats_version_key(request.user.id))
        cache_key = f'chats:{request.user.id}:v{version}:{search.lower()}'

        data = cache.get(cache_key)
        if data is None:
            qs = Chat.objects.filter(user=request.user)
            if search:
                qs = qs.filter(
                    Q(title__icontains=search) | Q(messages__content__icontains=search)
                ).distinct()
            data = ChatListSerializer(qs, many=True).data
            cache.set(cache_key, data, settings.CACHE_TTL_CHATS)

        response = Response(data)
        return _private_cache_headers(response, settings.CACHE_TTL_CHATS)

    @extend_schema(
        summary="Создать новый чат",
        description="Создаёт новый чат для генерации ER-моделей",
        request=ChatCreateSerializer,
        responses={201: ChatDetailSerializer},
    )
    def post(self, request):
        serializer = ChatCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        title = serializer.validated_data.get('title', 'Новый чат')
        chat = Chat.objects.create(user=request.user, title=title)
        _bump_version(_chats_version_key(request.user.id))
        return Response(ChatDetailSerializer(chat).data, status=status.HTTP_201_CREATED)


class ChatDetailView(APIView):
    """Детали чата, обновление и удаление."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Получить детали чата",
        description="Возвращает чат со всеми сообщениями (только свой чат)",
        responses={
            200: ChatDetailSerializer,
            404: OpenApiResponse(description="Чат не найден"),
        },
    )
    def get(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id, user=request.user)
        serializer = ChatDetailSerializer(chat)
        return Response(serializer.data)

    @extend_schema(
        summary="Обновить название чата",
        description="Переименовывает чат",
        request=ChatUpdateSerializer,
        responses={200: ChatDetailSerializer},
    )
    def patch(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id, user=request.user)
        serializer = ChatUpdateSerializer(chat, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        _bump_version(_chats_version_key(request.user.id))
        return Response(ChatDetailSerializer(chat).data)

    @extend_schema(
        summary="Удалить чат",
        description="Удаляет чат и все его сообщения",
        responses={204: None},
    )
    def delete(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id, user=request.user)
        chat.delete()
        _bump_version(_chats_version_key(request.user.id))
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageView(APIView):
    """Отправка сообщения в чат."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Отправить сообщение в чат",
        description="Отправляет сообщение пользователя и возвращает сгенерированную ER-модель и SQL код",
        request=MessageCreateSerializer,
        responses={201: dict},
    )
    def post(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id, user=request.user)

        serializer = MessageCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        sql_dialect = serializer.validated_data.get('sql_dialect', 'PostgreSQL')

        user_message = Message.objects.create(
            chat=chat,
            role='user',
            content=serializer.validated_data['content']
        )

        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in chat.messages.all()
        ]

        try:
            result = generate_er_model(chat_history, sql_dialect=sql_dialect)

            assistant_message = Message.objects.create(
                chat=chat,
                role='assistant',
                content=result['message'],
                er_data=result['er_data'],
                sql=result['sql']
            )

            _bump_version(_chats_version_key(request.user.id))

            return Response({
                'user_message': MessageSerializer(user_message).data,
                'assistant_message': MessageSerializer(assistant_message).data,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateTitleView(APIView):
    """Генерация названия для чата на основе промпта."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Сгенерировать название чата",
        description="Генерирует краткое название для чата на основе промпта пользователя",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'prompt': {'type': 'string', 'description': 'Промпт пользователя'},
                },
                'required': ['prompt'],
            }
        },
        responses={200: dict},
    )
    def post(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id, user=request.user)

        prompt = request.data.get('prompt')
        if not prompt:
            return Response(
                {'error': 'Prompt is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            title = generate_chat_title(prompt)
            chat.title = title
            chat.save(update_fields=['title'])
            _bump_version(_chats_version_key(request.user.id))

            return Response({
                'title': title,
                'chat': ChatDetailSerializer(chat).data,
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SavedSchemaListView(APIView):
    """Список сохранённых схем и создание новой. Поддерживает поиск и фильтр по тегам."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Список сохранённых схем",
        parameters=[
            OpenApiParameter('search', str, required=False, description='Поиск по name/sql'),
            OpenApiParameter('tags', str, required=False, description='UUID тегов через запятую'),
        ],
        responses={200: SavedSchemaSerializer(many=True)},
    )
    def get(self, request):
        search = (request.query_params.get('search') or '').strip()
        tags_param = (request.query_params.get('tags') or '').strip()

        version = _get_version(_schemas_version_key(request.user.id))
        cache_key = f'schemas:{request.user.id}:v{version}:{search.lower()}:{tags_param}'
        data = cache.get(cache_key)

        if data is None:
            qs = SavedSchema.objects.filter(user=request.user).prefetch_related('tags')
            if search:
                qs = qs.filter(Q(name__icontains=search) | Q(sql__icontains=search))
            if tags_param:
                tag_ids = [t for t in tags_param.split(',') if t]
                if tag_ids:
                    qs = qs.filter(tags__id__in=tag_ids).distinct()
            data = SavedSchemaSerializer(qs, many=True).data
            cache.set(cache_key, data, settings.CACHE_TTL_SCHEMAS)

        response = Response(data)
        return _private_cache_headers(response, settings.CACHE_TTL_SCHEMAS)

    @extend_schema(
        summary="Сохранить схему",
        request=SavedSchemaCreateSerializer,
        responses={201: SavedSchemaSerializer},
    )
    def post(self, request):
        # Лимит для free-пользователей
        if not is_pro(request.user):
            count = SavedSchema.objects.filter(user=request.user).count()
            if count >= FREE_SCHEMA_LIMIT:
                return Response(
                    {
                        'error': f'Лимит {FREE_SCHEMA_LIMIT} схем для free плана. Обновитесь до Pro.',
                        'limit': FREE_SCHEMA_LIMIT,
                        'current': count,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = SavedSchemaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tag_ids = serializer.validated_data.pop('tag_ids', [])
        schema = SavedSchema.objects.create(user=request.user, **serializer.validated_data)
        if tag_ids:
            schema.tags.set(Tag.objects.filter(user=request.user, id__in=tag_ids))
        _bump_version(_schemas_version_key(request.user.id))
        return Response(SavedSchemaSerializer(schema).data, status=status.HTTP_201_CREATED)


class SavedSchemaDetailView(APIView):
    """Управление конкретной сохранённой схемой."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="Обновить схему (название/теги)", responses={200: SavedSchemaSerializer})
    def patch(self, request, schema_id):
        schema = get_object_or_404(SavedSchema, id=schema_id, user=request.user)
        if 'name' in request.data:
            schema.name = request.data['name']
            schema.save(update_fields=['name'])
        if 'tag_ids' in request.data:
            tag_ids = request.data.get('tag_ids') or []
            valid_tags = Tag.objects.filter(user=request.user, id__in=tag_ids)
            schema.tags.set(valid_tags)
        _bump_version(_schemas_version_key(request.user.id))
        fresh = SavedSchema.objects.prefetch_related('tags').get(id=schema.id)
        return Response(SavedSchemaSerializer(fresh).data)

    @extend_schema(
        summary="Удалить сохранённую схему",
        responses={204: None},
    )
    def delete(self, request, schema_id):
        schema = get_object_or_404(SavedSchema, id=schema_id, user=request.user)
        schema.delete()
        _bump_version(_schemas_version_key(request.user.id))
        return Response(status=status.HTTP_204_NO_CONTENT)


class SavedSchemaExportView(APIView):
    """Экспорт SQL сохранённой схемы в виде файла. Только для Pro."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsProUser]

    @extend_schema(summary="Экспорт SQL схемы (Pro)", responses={200: OpenApiResponse(description='text/plain')})
    def get(self, request, schema_id):
        schema = get_object_or_404(SavedSchema, id=schema_id, user=request.user)
        response = HttpResponse(schema.sql or '-- empty schema', content_type='text/plain; charset=utf-8')
        filename = f'{schema.name or "schema"}.sql'.replace('"', '_')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class TagListView(APIView):
    """Список тегов и создание нового."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="Список тегов", responses={200: TagSerializer(many=True)})
    def get(self, request):
        tags = Tag.objects.filter(user=request.user)
        return Response(TagSerializer(tags, many=True).data)

    @extend_schema(summary="Создать тег", request=TagSerializer, responses={201: TagSerializer})
    def post(self, request):
        serializer = TagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tag, _ = Tag.objects.get_or_create(
            user=request.user,
            name=serializer.validated_data['name'],
            defaults={'color': serializer.validated_data.get('color', '#8b5cf6')},
        )
        _bump_version(_schemas_version_key(request.user.id))
        return Response(TagSerializer(tag).data, status=status.HTTP_201_CREATED)


class TagDetailView(APIView):
    """Удаление тега."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="Удалить тег", responses={204: None})
    def delete(self, request, tag_id):
        tag = get_object_or_404(Tag, id=tag_id, user=request.user)
        tag.delete()
        _bump_version(_schemas_version_key(request.user.id))
        return Response(status=status.HTTP_204_NO_CONTENT)
