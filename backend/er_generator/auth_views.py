import jwt
import requests
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema

from .authentication import JWTAuthentication


def generate_jwt_token(user):
    """Генерирует JWT токен для пользователя."""
    payload = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token


class GitHubLoginView(APIView):
    """Авторизация через GitHub OAuth."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Авторизация через GitHub",
        description="Обменивает code на access token GitHub и создаёт/находит пользователя",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'code': {'type': 'string', 'description': 'Authorization code от GitHub'},
                },
                'required': ['code'],
            }
        },
        responses={200: dict},
    )
    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'Code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Обмен code на access token
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            headers={'Accept': 'application/json'},
            data={
                'client_id': settings.GITHUB_CLIENT_ID,
                'client_secret': settings.GITHUB_CLIENT_SECRET,
                'code': code,
            }
        )

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            return Response(
                {'error': 'Failed to get access token', 'details': token_data},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Получение информации о пользователе
        user_response = requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json',
            }
        )

        user_data = user_response.json()
        github_id = user_data.get('id')
        username = user_data.get('login')
        email = user_data.get('email') or f'{username}@github.local'
        avatar_url = user_data.get('avatar_url')

        if not github_id:
            return Response(
                {'error': 'Failed to get user info'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создание или получение пользователя
        user, created = User.objects.get_or_create(
            username=f'github_{github_id}',
            defaults={
                'email': email,
                'first_name': user_data.get('name', '') or username,
            }
        )

        # Генерация JWT токена
        jwt_token = generate_jwt_token(user)

        return Response({
            'token': jwt_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'avatar_url': avatar_url,
            }
        })


class UserProfileView(APIView):
    """Профиль текущего пользователя."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Получить профиль пользователя",
        responses={200: dict},
    )
    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
        })


class VerifyTokenView(APIView):
    """Проверка валидности JWT токена."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Проверить JWT токен",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'token': {'type': 'string'},
                },
                'required': ['token'],
            }
        },
        responses={200: dict},
    )
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            user = User.objects.get(id=payload['user_id'])
            return Response({
                'valid': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            })
        except jwt.ExpiredSignatureError:
            return Response({'valid': False, 'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'valid': False, 'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'valid': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class DevLoginView(APIView):
    """Временный endpoint для тестирования (только в DEBUG режиме)."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Тестовая авторизация (только для разработки)",
        description="Создаёт тестового пользователя и возвращает токен. Работает только при DEBUG=True",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'username': {'type': 'string', 'default': 'testuser'},
                },
            }
        },
        responses={200: dict},
    )
    def post(self, request):
        if not settings.DEBUG:
            return Response(
                {'error': 'This endpoint is only available in DEBUG mode'},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get('username', 'testuser')

        # Создаём или получаем тестового пользователя
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@test.local',
                'first_name': 'Test',
            }
        )

        # Генерация JWT токена
        jwt_token = generate_jwt_token(user)

        return Response({
            'token': jwt_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })
