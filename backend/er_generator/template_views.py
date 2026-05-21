"""Views для публичных шаблонов, публикации и заметок."""

from django.db.models import F
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import generics, permissions, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import JWTAuthentication
from .models import SavedSchema, SchemaTemplate, Tag, TableNote
from .permissions import is_pro
from .serializers import (
    SavedSchemaSerializer,
    SchemaPublishSerializer,
    TableNoteCreateSerializer,
    TableNoteSerializer,
    TemplateDetailSerializer,
    TemplateListSerializer,
)
from .views import FREE_SCHEMA_LIMIT, _bump_version, _schemas_version_key


class _QSearchFilter(SearchFilter):
    """SearchFilter, принимающий ?q= вместо ?search= (под фронтовый параметр)."""

    search_param = 'q'


class TemplateListView(generics.ListAPIView):
    """Публичный список шаблонов с поиском, фильтрами и пагинацией."""

    serializer_class = TemplateListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, _QSearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['category']
    ordering_fields = ['fork_count', 'created_at', 'name']
    ordering = ['-fork_count']

    @extend_schema(
        summary='Список публичных шаблонов',
        description='Поиск ?q=, фильтры ?category=, ?tags=uuid1,uuid2 (OR), сортировка ?sort=popular|recent|name. Пагинация PAGE_SIZE=12.',
        parameters=[
            OpenApiParameter('q', str, required=False, description='Поиск по name/description'),
            OpenApiParameter('category', str, required=False, description='Фильтр по категории'),
            OpenApiParameter('tags', str, required=False, description='Comma-separated UUIDs тегов (OR)'),
            OpenApiParameter('sort', str, required=False, description='popular|recent|name'),
            OpenApiParameter('page', int, required=False, description='Номер страницы'),
        ],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        qs = SchemaTemplate.objects.select_related('author').prefetch_related('tags')
        tags_param = self.request.query_params.get('tags')
        if tags_param:
            tag_ids = [t.strip() for t in tags_param.split(',') if t.strip()]
            if tag_ids:
                qs = qs.filter(tags__id__in=tag_ids).distinct()
        sort = self.request.query_params.get('sort')
        sort_map = {'popular': '-fork_count', 'recent': '-created_at', 'name': 'name'}
        if sort in sort_map:
            qs = qs.order_by(sort_map[sort])
        return qs


class TemplateDetailView(generics.RetrieveAPIView):
    """Деталь публичного шаблона."""

    queryset = SchemaTemplate.objects.select_related('author').prefetch_related('tags', 'notes')
    serializer_class = TemplateDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_url_kwarg = 'template_id'
    lookup_field = 'id'

    @extend_schema(summary='Деталь шаблона')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TemplateForkView(APIView):
    """Форкает шаблон в SavedSchema текущего пользователя."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary='Форк шаблона в библиотеку',
        responses={
            201: SavedSchemaSerializer,
            403: OpenApiResponse(description='Достигнут лимит схем для Free'),
        },
    )
    def post(self, request, template_id):
        template = get_object_or_404(SchemaTemplate, id=template_id)

        if not is_pro(request.user):
            count = SavedSchema.objects.filter(user=request.user).count()
            if count >= FREE_SCHEMA_LIMIT:
                return Response(
                    {
                        'error': 'limit_reached',
                        'limit': FREE_SCHEMA_LIMIT,
                        'detail': f'Достигнут лимит {FREE_SCHEMA_LIMIT} схем для Free.',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        new_schema = SavedSchema.objects.create(
            user=request.user,
            name=f'{template.name} (форк)',
            description=template.description,
            er_data=template.er_data,
            sql=template.sql,
            sql_dialect=template.sql_dialect,
        )
        # копируем только системные теги (приватные автора шаблона не утекают)
        new_schema.tags.set(template.tags.filter(user__isnull=True))

        SchemaTemplate.objects.filter(id=template.id).update(fork_count=F('fork_count') + 1)
        _bump_version(_schemas_version_key(request.user.id))
        # У автора шаблона в его библиотечном списке fork_count считывается
        # из связанного SchemaTemplate — нужно сбросить кэш списка автора,
        # иначе он будет видеть устаревший счётчик.
        if template.author_id and template.author_id != request.user.id:
            _bump_version(_schemas_version_key(template.author_id))

        return Response(SavedSchemaSerializer(new_schema).data, status=status.HTTP_201_CREATED)


class SavedSchemaPublishView(APIView):
    """Публикация / снятие публикации SavedSchema как SchemaTemplate."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary='Опубликовать схему как публичный шаблон',
        request=SchemaPublishSerializer,
        responses={201: TemplateDetailSerializer, 400: OpenApiResponse(description='Уже опубликовано')},
    )
    def post(self, request, schema_id):
        schema = get_object_or_404(SavedSchema, id=schema_id, user=request.user)

        if schema.is_published:
            template_id = schema.published_template.id if hasattr(schema, 'published_template') and schema.published_template else None
            return Response(
                {'error': 'already_published', 'template_id': str(template_id) if template_id else None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ser = SchemaPublishSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        template = SchemaTemplate.objects.create(
            author=request.user,
            source_schema=schema,
            name=ser.validated_data.get('name') or schema.name,
            description=ser.validated_data.get('description') or schema.description,
            category=ser.validated_data['category'],
            er_data=schema.er_data,
            sql=schema.sql,
            sql_dialect=schema.sql_dialect,
        )

        # копируем теги: приватные подменяем системными с тем же именем (если есть)
        for tag in schema.tags.all():
            if tag.user_id is None:
                template.tags.add(tag)
            else:
                sys_tag = Tag.objects.filter(user__isnull=True, name=tag.name).first()
                if sys_tag:
                    template.tags.add(sys_tag)

        schema.is_published = True
        schema.save(update_fields=['is_published'])
        _bump_version(_schemas_version_key(request.user.id))

        return Response(TemplateDetailSerializer(template).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary='Снять публикацию (удалить шаблон)',
        responses={204: OpenApiResponse(description='Снято'), 400: OpenApiResponse(description='Не опубликовано')},
    )
    def delete(self, request, schema_id):
        schema = get_object_or_404(SavedSchema, id=schema_id, user=request.user)
        if not schema.is_published:
            return Response({'error': 'not_published'}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(schema, 'published_template') and schema.published_template:
            schema.published_template.delete()
        schema.is_published = False
        schema.save(update_fields=['is_published'])
        _bump_version(_schemas_version_key(request.user.id))

        return Response(status=status.HTTP_204_NO_CONTENT)


class SchemaNotesView(APIView):
    """Список и создание заметок для SavedSchema (владелец)."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary='Список заметок схемы', responses={200: TableNoteSerializer(many=True)})
    def get(self, request, schema_id):
        schema = get_object_or_404(SavedSchema, id=schema_id, user=request.user)
        return Response(TableNoteSerializer(schema.notes.all(), many=True).data)

    @extend_schema(
        summary='Создать заметку для схемы',
        request=TableNoteCreateSerializer,
        responses={201: TableNoteSerializer},
    )
    def post(self, request, schema_id):
        schema = get_object_or_404(SavedSchema, id=schema_id, user=request.user)
        ser = TableNoteCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        note = TableNote.objects.create(
            schema=schema,
            author=request.user,
            **ser.validated_data,
        )
        _bump_version(_schemas_version_key(request.user.id))
        return Response(TableNoteSerializer(note).data, status=status.HTTP_201_CREATED)


class NoteDetailView(APIView):
    """Редактирование/удаление заметки автором."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary='Обновить заметку', request=TableNoteCreateSerializer, responses={200: TableNoteSerializer})
    def patch(self, request, note_id):
        note = get_object_or_404(TableNote, id=note_id, author=request.user)
        ser = TableNoteCreateSerializer(note, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        if note.schema_id:
            _bump_version(_schemas_version_key(request.user.id))
        return Response(TableNoteSerializer(note).data)

    @extend_schema(summary='Удалить заметку', responses={204: OpenApiResponse(description='Удалено')})
    def delete(self, request, note_id):
        note = get_object_or_404(TableNote, id=note_id, author=request.user)
        schema_user_id = note.schema.user_id if note.schema_id else None
        note.delete()
        if schema_user_id:
            _bump_version(_schemas_version_key(schema_user_id))
        return Response(status=status.HTTP_204_NO_CONTENT)
