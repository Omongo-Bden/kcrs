import os
from pathlib import Path
from datetime import timedelta

# Try importing django-environ (installed), fall back gracefully
try:
    import environ
    env = environ.Env(DEBUG=(bool, True))
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
except ImportError:
    BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Core settings — read from .env if available, with safe defaults for local dev
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-kole-district-secret-key-2024')
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY', 'bVzZtY0gK8b1xJ3eR5uP4nC7vB9mX2sQ5wA1cD4eF6g=') # Fallback key for dev
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = [host.strip() for host in os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',') if host.strip()]
if os.environ.get('RENDER_EXTERNAL_HOSTNAME'):
    ALLOWED_HOSTS.append(os.environ.get('RENDER_EXTERNAL_HOSTNAME'))

# Check which optional packages are installed
import importlib.util

HAS_DRF_SPECTACULAR = importlib.util.find_spec('drf_spectacular') is not None
HAS_CSP = importlib.util.find_spec('csp') is not None and importlib.util.find_spec('packaging') is not None

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local
    'reports',
]

# Add optional apps only if installed
if HAS_DRF_SPECTACULAR:
    INSTALLED_APPS.append('drf_spectacular')
if HAS_CSP:
    INSTALLED_APPS.append('csp')

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Add CSP middleware only if installed
if HAS_CSP:
    MIDDLEWARE.insert(2, 'csp.middleware.CSPMiddleware')

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database - PostgreSQL preferred, resilient fallback to SQLite
try:
    import dj_database_url
    if os.environ.get('DATABASE_URL'):
        DATABASES = {'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'), conn_max_age=600)}
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('DB_NAME', 'crs_db'),
                'USER': os.environ.get('DB_USER', 'crs_user'),
                'PASSWORD': os.environ.get('DB_PASSWORD', 'crs_password'),
                'HOST': os.environ.get('DB_HOST', 'localhost'),
                'PORT': os.environ.get('DB_PORT', '5432'),
            }
        }
except ImportError:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'crs_db'),
            'USER': os.environ.get('DB_USER', 'crs_user'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'crs_password'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }

# Development fallback: use SQLite only when DEBUG is enabled and Postgres is unavailable locally.
if DEBUG:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as _s:
        _s.settimeout(0.5)
        if _s.connect_ex((DATABASES['default']['HOST'], int(DATABASES['default']['PORT']))) != 0:
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': BASE_DIR / 'backend' / 'db.sqlite3',
                }
            }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# WhiteNoise for Static Files Compression & Caching
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    }
}

# AWS S3 External Cloud Storage
if os.environ.get('AWS_ACCESS_KEY_ID') and os.environ.get('AWS_SECRET_ACCESS_KEY'):
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_DEFAULT_ACL = 'public-read'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    
    # Update default storage
    STORAGES["default"]["BACKEND"] = "storages.backends.s3boto3.S3Boto3Storage"
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework — with rate limiting and optional OpenAPI schema
_drf_schema = 'drf_spectacular.openapi.AutoSchema' if HAS_DRF_SPECTACULAR else 'rest_framework.schemas.openapi.AutoSchema'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': _drf_schema,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10000/day',
        'user': '100000/day',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
        "KEY_PREFIX": "kole_crs"
    }
}

# Fallback to local memory cache if Redis is not available in environment
if not os.environ.get('REDIS_URL'):
    CACHES["default"] = {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for local development.
else:
    CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if origin.strip()]

# Security hardening headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Production-only security (active if DEBUG is False)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000 # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_REFERRER_POLICY = 'same-origin'

# CSP headers (only if django-csp is installed with packaging)
if HAS_CSP:
    CONTENT_SECURITY_POLICY = {
        'DIRECTIVES': {
            'default-src': ("'self'",),
            'style-src': ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com"),
            'font-src': ("'self'", "https://fonts.gstatic.com"),
            'img-src': ("'self'", "data:"),
        }
    }

# Scalability: Celery & Redis for async task processing
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'

if DEBUG or not os.environ.get('REDIS_URL'):
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

# Interoperability: OpenAPI 3 documentation settings
if HAS_DRF_SPECTACULAR:
    SPECTACULAR_SETTINGS = {
        'TITLE': 'Kole District Corruption Reporting API',
        'DESCRIPTION': 'Public and internal investigative API for transparency and accountability in Kole District, Uganda.',
        'VERSION': '1.0.0',
        'SERVE_INCLUDE_SCHEMA': False,
    }
# Communication: Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'Kole District CRS <noreply@koledistrict.go.ug>'
