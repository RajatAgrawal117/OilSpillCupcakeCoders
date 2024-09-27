from django.apps import AppConfig

def ready(self):
    import yourapp.signals

class DetectionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'detection'
