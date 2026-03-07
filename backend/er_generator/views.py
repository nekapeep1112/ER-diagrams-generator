from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from .models import Chat, Message
from .serializers import (
    ChatListSerializer,
    ChatDetailSerializer,
    ChatCreateSerializer,
    ChatUpdateSerializer,
    MessageCreateSerializer,
    MessageSerializer,
)
from .services.openai_service import generate_er_model, generate_chat_title
from .authentication import JWTAuthentication


class ChatListView(APIView):
    """Список чатов и создание нового чата."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Получить список чатов",
        description="Возвращает список чатов текущего пользователя",
        responses={200: ChatListSerializer(many=True)},
    )
    def get(self, request):
        chats = Chat.objects.filter(user=request.user)
        serializer = ChatListSerializer(chats, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Создать новый чат",
        description="Создаёт новый чат для генерации ER-моделей",
        request=ChatCreateSerializer,
        responses={201: ChatDetailSerializer},
    )
    def post(self, request):
        serializer = ChatCreateSerializer(data=request.data)
        if serializer.is_valid():
            chat = serializer.save(user=request.user)
            return Response(
                ChatDetailSerializer(chat).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatDetailView(APIView):
    """Детали чата, обновление и удаление."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Получить детали чата",
        description="Возвращает чат со всеми сообщениями (только свой чат)",
        responses={
            200: ChatDetailSerializer,
            404: OpenApiResponse(description="Чат не найден или не принадлежит пользователю"),
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
        if serializer.is_valid():
            serializer.save()
            return Response(ChatDetailSerializer(chat).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Удалить чат",
        description="Удаляет чат и все его сообщения",
        responses={204: None},
    )
    def delete(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id, user=request.user)
        chat.delete()
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

        # Получаем диалект SQL из запроса
        sql_dialect = serializer.validated_data.get('sql_dialect', 'PostgreSQL')

        # Сохраняем сообщение пользователя
        user_message = Message.objects.create(
            chat=chat,
            role='user',
            content=serializer.validated_data['content']
        )

        # Собираем историю сообщений для контекста
        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in chat.messages.all()
        ]

        try:
            # Вызываем OpenAI с полным контекстом и выбранным диалектом
            result = generate_er_model(chat_history, sql_dialect=sql_dialect)

            # Сохраняем ответ ассистента
            assistant_message = Message.objects.create(
                chat=chat,
                role='assistant',
                content=result['message'],
                er_data=result['er_data'],
                sql=result['sql']
            )

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

            return Response({
                'title': title,
                'chat': ChatDetailSerializer(chat).data,
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
