import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Кастомная модель пользователя с email-авторизацией."""

    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(null=True, blank=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    """Профиль пользователя с дополнительными настройками."""

    SQL_DIALECT_CHOICES = [
        ('PostgreSQL', 'PostgreSQL'),
        ('MySQL', 'MySQL'),
        ('SQLite', 'SQLite'),
        ('SQL Server', 'SQL Server'),
        ('Oracle', 'Oracle'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    bio = models.TextField(blank=True)
    default_sql_dialect = models.CharField(
        max_length=20,
        choices=SQL_DIALECT_CHOICES,
        default='PostgreSQL'
    )

    def __str__(self):
        return f"Профиль {self.user.email}"


class Chat(models.Model):
    """Модель чата для хранения истории диалога с нейросетью."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chats',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255, default='Новый чат')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.id})"


class Message(models.Model):
    """Модель сообщения в чате."""

    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    er_data = models.JSONField(null=True, blank=True)
    sql = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class Tag(models.Model):
    """Тег для группировки схем. user=None — системный тег (общий)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags',
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#8b5cf6')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_tag_per_user'),
        ]

    def __str__(self):
        owner = self.user.email if self.user_id else 'system'
        return f"{self.name} ({owner})"


class SavedSchema(models.Model):
    """Сохранённая ER-схема пользователя."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_schemas'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    er_data = models.JSONField()
    sql = models.TextField(blank=True)
    sql_dialect = models.CharField(
        max_length=20,
        choices=UserProfile.SQL_DIALECT_CHOICES,
        default='PostgreSQL',
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='schemas')
    is_published = models.BooleanField(default=False)
    fork_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('can_export_schema', 'Can export SQL schema to file'),
        ]

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class SchemaTemplate(models.Model):
    """Публичный шаблон схемы, опубликованный из SavedSchema или создан в seed."""

    CATEGORY_CHOICES = [
        ('E-commerce', 'E-commerce'),
        ('SaaS', 'SaaS'),
        ('CMS', 'CMS'),
        ('Education', 'Education'),
        ('Finance', 'Finance'),
        ('Social', 'Social'),
        ('Analytics', 'Analytics'),
        ('IoT', 'IoT'),
        ('Healthcare', 'Healthcare'),
        ('Other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='templates',
    )
    source_schema = models.OneToOneField(
        SavedSchema,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='published_template',
    )
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    er_data = models.JSONField()
    sql = models.TextField()
    sql_dialect = models.CharField(max_length=20, default='PostgreSQL')
    tags = models.ManyToManyField(Tag, blank=True, related_name='templates')
    fork_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fork_count']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['-fork_count']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category})"


class TableNote(models.Model):
    """Заметка пользователя к таблице в схеме или к схеме целиком.
    XOR: принадлежит либо SavedSchema, либо SchemaTemplate.
    """

    TYPE_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('idea', 'Idea'),
        ('todo', 'TODO'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schema = models.ForeignKey(
        SavedSchema,
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True,
    )
    template = models.ForeignKey(
        SchemaTemplate,
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True,
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='table_notes',
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info')
    table_name = models.CharField(max_length=100, blank=True)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(schema__isnull=False, template__isnull=True) |
                    models.Q(schema__isnull=True, template__isnull=False)
                ),
                name='note_belongs_to_either_schema_or_template',
            ),
        ]
        indexes = [
            models.Index(fields=['schema', 'table_name']),
            models.Index(fields=['template', 'table_name']),
        ]

    def __str__(self):
        if self.schema_id:
            target = self.schema.name
        elif self.template_id:
            target = self.template.name
        else:
            target = 'orphan'
        return f"[{self.type}] {target} / {self.table_name or 'general'}"
