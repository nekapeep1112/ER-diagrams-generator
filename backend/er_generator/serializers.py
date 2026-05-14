from django.contrib.auth import get_user_model
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Chat, Message, SavedSchema, SchemaTemplate, Tag, TableNote

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


class UserMiniSerializer(serializers.ModelSerializer):
    """Совместим с TS-интерфейсом User: {id, email, username, avatar_url, plan}."""

    plan = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'avatar_url', 'plan']

    @extend_schema_field(str)
    def get_plan(self, obj) -> str:
        return 'pro' if obj.groups.filter(name='pro_user').exists() else 'free'


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


# --- Tag serializers ---

class TagSerializer(serializers.ModelSerializer):
    """Полный сериализатор для управления тегами пользователя."""

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


class TemplateTagSerializer(serializers.ModelSerializer):
    """Минимальный сериализатор тегов для вложений в схемы/шаблоны.
    Совместим с TS-интерфейсом Tag: {id, name, color}.
    """

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']


# --- TableNote serializers ---

class TableNoteSerializer(serializers.ModelSerializer):
    """Совместим с TS TableNote: {id, type, table_name?, body, created_at}."""

    class Meta:
        model = TableNote
        fields = ['id', 'type', 'table_name', 'body', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TableNoteCreateSerializer(serializers.ModelSerializer):
    """Создание/частичное обновление заметки."""

    class Meta:
        model = TableNote
        fields = ['type', 'table_name', 'body']


# --- SavedSchema serializers ---

class SavedSchemaSerializer(serializers.ModelSerializer):
    """Сериализатор для сохранённых схем."""

    tags = TemplateTagSerializer(many=True, read_only=True)
    notes = serializers.SerializerMethodField()

    class Meta:
        model = SavedSchema
        fields = [
            'id', 'name', 'description', 'er_data', 'sql', 'sql_dialect',
            'tags', 'is_published', 'fork_count', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_published', 'fork_count', 'created_at', 'updated_at']

    @extend_schema_field(TableNoteSerializer(many=True))
    def get_notes(self, obj):
        return TableNoteSerializer(obj.notes.all(), many=True).data


class SavedSchemaCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания сохранённой схемы."""

    tag_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, write_only=True
    )

    class Meta:
        model = SavedSchema
        fields = ['name', 'description', 'er_data', 'sql', 'sql_dialect', 'tag_ids']


# --- SchemaTemplate serializers ---

class TemplateListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка шаблонов (карточки на /templates)."""

    author = UserMiniSerializer(read_only=True)
    tags = TemplateTagSerializer(many=True, read_only=True)

    class Meta:
        model = SchemaTemplate
        fields = [
            'id', 'name', 'description', 'category', 'er_data', 'sql',
            'tags', 'author', 'fork_count', 'created_at',
        ]


class TemplateDetailSerializer(serializers.ModelSerializer):
    """Полный сериализатор шаблона со всеми заметками."""

    author = UserMiniSerializer(read_only=True)
    tags = TemplateTagSerializer(many=True, read_only=True)
    notes = serializers.SerializerMethodField()

    class Meta:
        model = SchemaTemplate
        fields = [
            'id', 'name', 'description', 'category', 'er_data', 'sql',
            'sql_dialect', 'tags', 'author', 'fork_count',
            'created_at', 'updated_at', 'notes',
        ]

    @extend_schema_field(TableNoteSerializer(many=True))
    def get_notes(self, obj):
        return TableNoteSerializer(obj.notes.all(), many=True).data


class SchemaPublishSerializer(serializers.Serializer):
    """Запрос на публикацию SavedSchema → SchemaTemplate."""

    name = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.ChoiceField(choices=SchemaTemplate.CATEGORY_CHOICES)
