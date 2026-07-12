from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, MessageViewSet, SuccessStoryViewSet, UserMeView, FAQViewSet, StatsView, UserManagementViewSet, AudioGuideViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'success-stories', SuccessStoryViewSet, basename='success-story')
router.register(r'faqs', FAQViewSet, basename='faq')
router.register(r'me', UserMeView, basename='me')
router.register(r'stats', StatsView, basename='stats')
router.register(r'users', UserManagementViewSet, basename='users')
router.register(r'audio-guide', AudioGuideViewSet, basename='audio-guide')

urlpatterns = [
    path('', include(router.urls)),
]