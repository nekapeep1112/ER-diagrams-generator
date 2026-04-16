from django.contrib.auth import get_user_model
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Chat, Message, SavedSchema

User = get_user_model()


# --- Auth serializers ---

class RegisterSerializer(serializers.Serializer):
    """Сериализатор для регистрации."""

    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Это имя пользователя уже занято')
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Пароли не совпадают'})
        return data


class LoginSerializer(serializers.Serializer):
    """Сериализатор для входа."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserProfileUpdateSerializer(serializers.Serializer):
    """Сериализатор для обновления профиля."""

    username = serializers.CharField(max_length=150, required=False)
    avatar_url = serializers.URLField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    default_sql_dialect = serializers.ChoiceField(
        choices=['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle'],
        required=False
    )


# --- Chat serializers ---

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


class ChatUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления чата."""

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


# --- SavedSchema serializers ---

class SavedSchemaSerializer(serializers.ModelSerializer):
    """Сериализатор для сохранённых схем."""

    class Meta:
        model = SavedSchema
        fields = ['id', 'name', 'er_data', 'sql', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SavedSchemaCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания сохранённой схемы."""

    class Meta:
        model = SavedSchema
        fields = ['name', 'er_data', 'sql']
