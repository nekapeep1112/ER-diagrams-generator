from django.apps import AppConfig


class ErGeneratorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'er_generator'
    verbose_name = 'ER Generator'

    def ready(self):
        # Импорт расширений для drf-spectacular
        try:
            import er_generator.extensions  # noqa
        except ImportError:
            pass
