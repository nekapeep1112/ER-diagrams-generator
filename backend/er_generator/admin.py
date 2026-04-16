from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, Chat, Message, SavedSchema


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'is_staff', 'date_joined']
    search_fields = ['email', 'username']
    ordering = ['-date_joined']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительно', {'fields': ('avatar_url',)}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'default_sql_dialect']
    search_fields = ['user__email', 'user__username']


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['title', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'chat', 'role', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content', 'chat__title']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['chat']


@admin.register(SavedSchema)
class SavedSchemaAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
