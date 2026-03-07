from drf_spectacular.openapi import OpenApiAuthenticationExtension


class JWTAuthenticationScheme(OpenApiAuthenticationExtension):
    """Расширение для отображения JWT авторизации в Swagger."""
    target_class = 'er_generator.authentication.JWTAuthentication'
    name = 'bearerAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
            'description': 'JWT авторизация. Получите токен через /api/auth/dev-login/ или /api/auth/github/',
        }
