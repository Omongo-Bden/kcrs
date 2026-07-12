from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.db import connection
from django.utils import timezone

def health_check(request):
    """Availability: Health check endpoint verifying database connectivity."""
    db_ok = True
    try:
        connection.cursor()
    except Exception:
        db_ok = False
        
    status_code = 200 if db_ok else 503
    return JsonResponse({
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "service": "kole-crs-api",
        "timestamp": timezone.now().isoformat(),
    }, status=status_code)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('reports.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),   # JWT Login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT Refresh
    path('health/', health_check),  # Availability monitoring endpoint
    
    # Password Reset
    path('api/password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('api/password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('api/password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]

# Interoperability: Add OpenAPI docs only if drf-spectacular is installed
try:
    from drf_spectacular.views import (
        SpectacularAPIView,
        SpectacularSwaggerView,
        SpectacularRedocView,
    )
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]
except ImportError:
    pass  # API docs not available; install drf-spectacular to enable

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
