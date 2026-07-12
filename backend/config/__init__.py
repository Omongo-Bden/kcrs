# Celery is loaded lazily to avoid crashing Django if kombu/celery deps are missing
try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    pass  # Celery not fully installed; run: pip install celery kombu
