from rest_framework.permissions import BasePermission


class IsProUser(BasePermission):
    """Разрешает доступ только пользователям группы pro_user (или с кастомным permission)."""

    message = 'Доступно только пользователям Pro. Обновите тариф.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if user.groups.filter(name='pro_user').exists():
            return True
        return user.has_perm('er_generator.can_export_schema')


def is_pro(user) -> bool:
    """Вспомогательная функция — проверка Pro-статуса для бизнес-логики."""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name='pro_user').exists()
