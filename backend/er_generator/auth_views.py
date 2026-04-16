import datetime
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .authentication import JWTAuthentication
from .models import UserProfile
from .serializers import RegisterSerializer, LoginSerializer, UserProfileUpdateSerializer

User = get_user_model()


def generate_jwt_token(user):
    """Генерирует JWT токен с истечением срока действия."""
    payload = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=settings.JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


class RegisterView(APIView):
    """Регистрация нового пользователя."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Регистрация",
        description="Создаёт нового пользователя по email и паролю",
        request=RegisterSerializer,
        responses={201: dict},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        UserProfile.objects.create(user=user)

        token = generate_jwt_token(user)
        return Response({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Вход по email и паролю."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Вход",
        description="Аутентификация по email и паролю, возвращает JWT токен",
        request=LoginSerializer,
        responses={200: dict},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(email=serializer.validated_data['email'])
        except User.DoesNotExist:
            return Response(
                {'error': 'Неверный email или пароль'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(serializer.validated_data['password']):
            return Response(
                {'error': 'Неверный email или пароль'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = generate_jwt_token(user)
        return Response({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
            }
        })


class UserProfileView(APIView):
    """Профиль текущего пользователя."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Получить профиль",
        responses={200: dict},
    )
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response({
            'id': request.user.id,
            'email': request.user.email,
            'username': request.user.username,
            'avatar_url': request.user.avatar_url,
            'bio': profile.bio,
            'default_sql_dialect': profile.default_sql_dialect,
        })

    @extend_schema(
        summary="Обновить профиль",
        request=UserProfileUpdateSerializer,
        responses={200: dict},
    )
    def patch(self, request):
        serializer = UserProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        data = serializer.validated_data

        if 'username' in data:
            request.user.username = data['username']
            request.user.save(update_fields=['username'])
        if 'avatar_url' in data:
            request.user.avatar_url = data['avatar_url']
            request.user.save(update_fields=['avatar_url'])
        if 'bio' in data:
            profile.bio = data['bio']
        if 'default_sql_dialect' in data:
            profile.default_sql_dialect = data['default_sql_dialect']
        profile.save()

        return Response({
            'id': request.user.id,
            'email': request.user.email,
            'username': request.user.username,
            'avatar_url': request.user.avatar_url,
            'bio': profile.bio,
            'default_sql_dialect': profile.default_sql_dialect,
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
                'properties': {'token': {'type': 'string'}},
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
                    'email': user.email,
                    'username': user.username,
                }
            })
        except jwt.ExpiredSignatureError:
            return Response({'valid': False, 'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'valid': False, 'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'valid': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
