from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import Report, Message, AuditLog, ReportEvidence, SuccessStory, FAQ, AudioGuideConfig
from .serializers import (
    ReportSerializer, MessageSerializer, UserSerializer, 
    SuccessStorySerializer, FAQSerializer, AudioGuideConfigSerializer
)
import uuid
from ipware import get_client_ip
from django.utils.crypto import get_random_string

class IsOfficial(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name='Anti Corruption Agency').exists() or 
            request.user.groups.filter(name='District Officials').exists()
        )

class IsDistrictOfficial(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name='District Officials').exists()

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    permission_classes = [IsDistrictOfficial]

    def get_serializer_class(self):
        from .serializers import UserCreateSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def perform_destroy(self, instance):
        # Instead of deleting, we deactivate
        instance.is_active = False
        instance.save()
        AuditLog.objects.create(
            user=self.request.user,
            action="User Deactivated",
            details=f"Deactivated official: {instance.username}",
            ip_address=get_client_ip(self.request)[0]
        )

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_queryset(self):
        user = self.request.user
        
        # If user is not authenticated, we still return all reports 
        # so that the 'retrieve' action (tracking) can find a specific report by ID.
        # The 'list' action is protected by get_permissions (IsOfficial).
        if not user or not user.is_authenticated:
            return Report.objects.all().order_by('-created_at')
            
        is_agency = user.groups.filter(name='Anti Corruption Agency').exists()
        is_district = user.groups.filter(name='District Officials').exists()
        
        if is_agency or is_district:
            # Officials should see all reports in the dashboard.
            return Report.objects.all().order_by('-created_at')
        
        # Fallback for authenticated users who are not in official groups.
        return Report.objects.filter(is_escalated=True).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['create', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsOfficial()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_authenticated and (
            request.user.groups.filter(name='Anti Corruption Agency').exists() or 
            request.user.groups.filter(name='District Officials').exists()
        ):
            AuditLog.objects.create(
                report=instance,
                user=request.user,
                action="Report Viewed",
                details=f"Viewed by {request.user.username}",
                ip_address=get_client_ip(request)[0]
            )
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        while True:
            tracking_id = f"KD-{get_random_string(7, allowed_chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}"
            if not Report.objects.filter(tracking_id=tracking_id).exists():
                break
                
        data = request.data.copy()
        data['tracking_id'] = tracking_id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()

        # Handle multiple evidence files
        files = request.FILES.getlist('additional_evidence')
        for f in files:
            ReportEvidence.objects.create(report=report, file=f)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        old_note = instance.admin_note
        
        response = super().partial_update(request, *args, **kwargs)
        
        # Audit Logging
        new_status = request.data.get('status')
        new_note = request.data.get('admin_note')
        
        changes = []
        if new_status and new_status != old_status:
            changes.append(f"Status changed from {old_status} to {new_status}")
        if new_note and new_note != old_note:
            changes.append("Internal note updated")

        if changes:
            AuditLog.objects.create(
                report=instance,
                user=request.user,
                action="Report Updated",
                details="; ".join(changes),
                ip_address=get_client_ip(request)[0]
            )
            
            # Auto-escalation logic
            if request.data.get('status') == 'ESCALATED':
                instance.is_escalated = True
                instance.save()
            
        return response

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.AllowAny()]
        return [IsOfficial()]

    def create(self, request, *args, **kwargs):
        tracking_id = request.data.get('tracking_id')
        try:
            report = Report.objects.get(tracking_id=tracking_id)
        except Report.DoesNotExist:
            return Response({"detail": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        text = request.data.get('text')
        channel = request.data.get('channel', 'CITIZEN_DISTRICT')

        if not user.is_authenticated:
            # Anonymous citizen message
            sender_type = 'CITIZEN'
            channel = 'CITIZEN_DISTRICT' # Citizens can only use this channel
        else:
            is_agency = user.groups.filter(name='Anti Corruption Agency').exists()
            is_district = user.groups.filter(name='District Officials').exists()
            
            if is_agency:
                sender_type = 'AGENCY'
                channel = 'ADMIN_INTERNAL' # Agency can only use internal channel
            elif is_district:
                sender_type = 'DISTRICT'
                # District can specify channel, default to internal if agency involvement is expected
            else:
                return Response({"detail": "Unauthorized sender"}, status=status.HTTP_403_FORBIDDEN)

        # End-to-End Encryption Simulation replaced with Server-Side Encryption
        from .models import get_fernet
        f = get_fernet()
        encrypted_text = f.encrypt(text.encode('utf-8')).decode('utf-8') if text else None

        msg = Message.objects.create(
            report=report,
            sender=user if user.is_authenticated else None,
            sender_type=sender_type,
            channel=channel,
            text=encrypted_text,
            is_encrypted=True if text else False,
            voice_note=request.FILES.get('voice_note'),
            attachment=request.FILES.get('attachment')
        )
        
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        msg = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            if msg.sender_type != 'CITIZEN':
                return Response({"detail": "Not authorized to edit this message."}, status=status.HTTP_403_FORBIDDEN)
            if request.data.get('tracking_id') != msg.report.tracking_id:
                return Response({"detail": "Invalid tracking ID."}, status=status.HTTP_403_FORBIDDEN)
        else:
            if msg.sender != user:
                return Response({"detail": "You can only edit your own messages."}, status=status.HTTP_403_FORBIDDEN)

        if 'text' in request.data:
            msg.text = request.data['text']
            msg.is_edited = True
            msg.save()
        
        return Response(MessageSerializer(msg).data)

    def destroy(self, request, *args, **kwargs):
        msg = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            if msg.sender_type != 'CITIZEN':
                return Response({"detail": "Not authorized to delete this message."}, status=status.HTTP_403_FORBIDDEN)
            tracking_id = request.data.get('tracking_id') or request.query_params.get('tracking_id')
            if tracking_id != msg.report.tracking_id:
                return Response({"detail": "Invalid tracking ID."}, status=status.HTTP_403_FORBIDDEN)
        else:
            if msg.sender != user:
                return Response({"detail": "You can only delete your own messages."}, status=status.HTTP_403_FORBIDDEN)

        msg.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SuccessStoryViewSet(viewsets.ModelViewSet):
    queryset = SuccessStory.objects.all().order_by('-created_at')
    serializer_class = SuccessStorySerializer

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsOfficial()]

class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all().order_by('order')
    serializer_class = FAQSerializer

    @method_decorator(cache_page(60 * 60)) # Cache FAQs for 1 hour
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsOfficial()]

class StatsView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    
    @method_decorator(cache_page(60 * 5)) # Cache stats for 5 minutes
    def list(self, request):
        total = Report.objects.count()
        resolved = Report.objects.filter(status='RESOLVED').count()
        under_review = Report.objects.filter(status__in=['UNDER_REVIEW', 'ESCALATED', 'SANCTION_PENDING']).count()
        
        # In a real app, these would be calculated from a 'recovered_amount' field
        return Response({
            "total_reports": total,
            "resolved_cases": resolved,
            "under_review": under_review,
            "recovered_funds": "0",
            "accountability_actions": resolved
        })

class UserMeView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    def list(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
class AudioGuideViewSet(viewsets.ModelViewSet):
    queryset = AudioGuideConfig.objects.all()
    serializer_class = AudioGuideConfigSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsDistrictOfficial()]
