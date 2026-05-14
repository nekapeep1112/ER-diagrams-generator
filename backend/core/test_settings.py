"""Settings для pytest: SQLite :memory: вместо PostgreSQL."""

from .settings import *  # noqa

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Отключаем кэширование между тестами
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Минимизируем хеширование пароля для скорости
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
