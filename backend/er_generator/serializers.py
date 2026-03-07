from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    """Сериализатор для сообщений."""

    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'er_data', 'sql', 'created_at']
        read_only_fields = ['id', 'role', 'er_data', 'sql', 'created_at']


class ChatListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка чатов."""

    message_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count']

    @extend_schema_field(int)
    def get_message_count(self, obj) -> int:
        return obj.messages.count()


class ChatDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детального просмотра чата с сообщениями."""

    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'title', 'created_at', 'updated_at', 'messages']


class ChatCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания чата."""

    class Meta:
        model = Chat
        fields = ['title']


class MessageCreateSerializer(serializers.Serializer):
    """Сериализатор для создания сообщения."""

    content = serializers.CharField(max_length=5000)
    sql_dialect = serializers.ChoiceField(
        choices=['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle'],
        required=False,
        default='PostgreSQL',
        help_text='Выбор диалекта SQL для генерации кода'
    )


class ChatUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления чата."""

    class Meta:
        model = Chat
        fields = ['title']
