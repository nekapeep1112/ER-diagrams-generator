import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Кастомная модель пользователя с email-авторизацией."""

    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True)

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


class SavedSchema(models.Model):
    """Сохранённая ER-схема пользователя."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_schemas'
    )
    name = models.CharField(max_length=255)
    er_data = models.JSONField()
    sql = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"
