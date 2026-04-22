import datetime
import uuid
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.utils import timezone
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


def set_auth_cookie(response, token):
    """Ставит JWT в httpOnly cookie. secure=True вне DEBUG."""
    response.set_cookie(
        'access_token',
        token,
        max_age=settings.JWT_EXPIRATION_HOURS * 3600,
        httponly=True,
        samesite='Lax',
        secure=not settings.DEBUG,
        path='/',
    )
    return response


def user_payload(user):
    """Унифицированный ответ о пользователе (используется в login/register/me)."""
    return {
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'avatar_url': getattr(user, 'avatar_url', ''),
        'groups': list(user.groups.values_list('name', flat=True)),
        'is_email_verified': user.is_email_verified,
    }


def send_verification_email(user):
    """Генерирует токен и шлёт письмо со ссылкой на подтверждение."""
    user.email_verification_token = uuid.uuid4()
    user.email_verification_sent_at = timezone.now()
    user.save(update_fields=['email_verification_token', 'email_verification_sent_at'])

    link = f"{settings.FRONTEND_URL}/verify-email?token={user.email_verification_token}"
    send_mail(
        subject='Подтверждение регистрации в ER Database Generator',
        message=(
            f'Здравствуйте, {user.username}!\n\n'
            f'Для подтверждения email перейдите по ссылке:\n{link}\n\n'
            f'Ссылка действительна 24 часа.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


class RegisterView(APIView):
    """Регистрация нового пользователя."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Регистрация",
        description="Создаёт нового пользователя по email и паролю, отправляет письмо подтверждения",
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

        # Добавляем в дефолтную группу free_user
        try:
            free_group = Group.objects.get(name='free_user')
            user.groups.add(free_group)
        except Group.DoesNotExist:
            pass

        send_verification_email(user)

        token = generate_jwt_token(user)
        response = Response({
            'token': token,
            'user': user_payload(user),
            'need_verification': True,
            'message': f'Письмо с подтверждением отправлено на {user.email}',
        }, status=status.HTTP_201_CREATED)
        return set_auth_cookie(response, token)


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

        if not user.is_email_verified:
            return Response(
                {
                    'error': 'Email не подтверждён. Проверьте почту или запросите новую ссылку.',
                    'need_verification': True,
                    'email': user.email,
                },
                status=status.HTTP_403_FORBIDDEN
            )

        token = generate_jwt_token(user)
        response = Response({
            'token': token,
            'user': user_payload(user),
        })
        return set_auth_cookie(response, token)


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
        data = user_payload(request.user)
        data.update({
            'bio': profile.bio,
            'default_sql_dialect': profile.default_sql_dialect,
        })
        return Response(data)

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

        result = user_payload(request.user)
        result.update({
            'bio': profile.bio,
            'default_sql_dialect': profile.default_sql_dialect,
        })
        return Response(result)


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
                'user': user_payload(user),
            })
        except jwt.ExpiredSignatureError:
            return Response({'valid': False, 'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'valid': False, 'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'valid': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class VerifyEmailView(APIView):
    """Подтверждение email по токену из письма."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Подтвердить email",
        request={
            'application/json': {
                'type': 'object',
                'properties': {'token': {'type': 'string', 'format': 'uuid'}},
                'required': ['token'],
            }
        },
        responses={200: dict},
    )
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email_verification_token=token)
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'Неверный или устаревший токен'}, status=status.HTTP_400_BAD_REQUEST)

        if user.email_verification_sent_at:
            age = timezone.now() - user.email_verification_sent_at
            if age > datetime.timedelta(hours=24):
                return Response({'error': 'Срок действия токена истёк. Запросите новое письмо.'},
                                status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.email_verification_token = None
        user.save(update_fields=['is_email_verified', 'email_verification_token'])

        jwt_token = generate_jwt_token(user)
        response = Response({
            'message': 'Email успешно подтверждён',
            'token': jwt_token,
            'user': user_payload(user),
        })
        return set_auth_cookie(response, jwt_token)


class ResendVerificationView(APIView):
    """Повторная отправка письма с подтверждением."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Отправить письмо подтверждения заново",
        request={
            'application/json': {
                'type': 'object',
                'properties': {'email': {'type': 'string', 'format': 'email'}},
                'required': ['email'],
            }
        },
        responses={200: dict},
    )
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Не раскрываем факт существования пользователя
            return Response({'message': 'Если аккаунт существует, письмо отправлено.'})

        if user.is_email_verified:
            return Response({'message': 'Email уже подтверждён.'})

        send_verification_email(user)
        return Response({'message': 'Письмо отправлено повторно.'})


class LogoutView(APIView):
    """Выход: очищает httpOnly cookie с токеном."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="Выход", responses={200: dict})
    def post(self, request):
        response = Response({'message': 'Logged out'})
        response.delete_cookie('access_token', path='/')
        return response
