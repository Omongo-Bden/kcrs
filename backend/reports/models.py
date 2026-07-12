from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from cryptography.fernet import Fernet
from django.conf import settings
import uuid
from django.utils.crypto import get_random_string

def get_fernet():
    return Fernet(settings.ENCRYPTION_KEY.encode('utf-8'))

class Report(models.Model):
    STATUS_CHOICES = [
        ('PENDING_REVIEW', 'Pending Review'),
        ('UNDER_REVIEW', 'Under Review'),
        ('ESCALATED', 'Escalated to Agency'),
        ('SANCTION_PENDING', 'Agency Sanction Pending'),
        ('LEGAL_REFERRAL', 'Legal Referral / Judiciary'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]

    tracking_id = models.CharField(max_length=10, unique=True, primary_key=True)
    report_type = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    description = models.TextField()
    program = models.CharField(max_length=100, blank=True, null=True)
    incident_date = models.DateField(blank=True, null=True)
    evidence = models.FileField(
        upload_to='evidence/', 
        blank=True, 
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'mp3', 'wav'])]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_REVIEW')
    admin_note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_priority = models.BooleanField(default=False)
    is_escalated = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            self.tracking_id = f"KD-{get_random_string(7, allowed_chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tracking_id} - {self.report_type}"

class Message(models.Model):
    CHANNEL_CHOICES = [
        ('CITIZEN_DISTRICT', 'Citizen & District Official'),
        ('ADMIN_INTERNAL', 'District & Agency Official'),
    ]
    SENDER_TYPE = [
        ('CITIZEN', 'Citizen'),
        ('DISTRICT', 'District Official'),
        ('AGENCY', 'Agency Official'),
    ]

    report = models.ForeignKey(Report, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    sender_type = models.CharField(max_length=20, choices=SENDER_TYPE)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='CITIZEN_DISTRICT')
    
    # Encrypted content (Demonstration of E2EE concept)
    text = models.TextField(blank=True, null=True) 
    voice_note = models.FileField(
        upload_to='chat_audio/', 
        blank=True, 
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp3', 'wav', 'ogg', 'm4a'])]
    )
    attachment = models.FileField(
        upload_to='chat_media/', 
        blank=True, 
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'mp3', 'wav', 'doc', 'docx'])]
    )
    is_encrypted = models.BooleanField(default=True)
    is_edited = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def get_decrypted_text(self):
        if not self.text:
            return None
        if not self.is_encrypted:
            return self.text
        try:
            return get_fernet().decrypt(self.text.encode('utf-8')).decode('utf-8')
        except Exception:
            return self.text

    def __str__(self):
        return f"Msg on {self.report.tracking_id} via {self.channel}"

class AuditLog(models.Model):
    report = models.ForeignKey(Report, related_name='audit_logs', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    details = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class ReportEvidence(models.Model):
    report = models.ForeignKey(Report, related_name='additional_evidence', on_delete=models.CASCADE)
    file = models.FileField(
        upload_to='evidence/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'mp3', 'wav'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

class SuccessStory(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    impact_amount = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class FAQ(models.Model):
    question = models.CharField(max_length=500)
    answer = models.TextField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question
@receiver(post_save, sender=Report)
def notify_admins(sender, instance, created, **kwargs):
    if created or instance.status == 'ESCALATED':
        subject = f'ALERT: New Corruption Report {instance.tracking_id}' if created else f'URGENT: Case {instance.tracking_id} ESCALATED'
        message = f'A report has been filed/updated in {instance.location}.\\nType: {instance.report_type}\\nStatus: {instance.status}\\n\\nView here: http://localhost:5173/admin-login'
        admin_emails = User.objects.filter(is_staff=True, is_active=True).values_list('email', flat=True)
        if admin_emails:
            send_mail(subject, message, 'noreply@koledistrict.go.ug', list(admin_emails), fail_silently=True)

class AudioGuideConfig(models.Model):
    SOURCE_CHOICES = [
        ('text_to_speech', 'System Text-to-Speech'),
        ('uploaded_file', 'Uploaded Audio File'),
        ('url', 'External Audio URL'),
    ]
    key = models.CharField(max_length=50, unique=True, default='main_guide')
    english_text = models.TextField()
    luo_text = models.TextField()
    
    english_source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='text_to_speech')
    luo_source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='text_to_speech')
    
    english_audio_file = models.FileField(upload_to='audio_guides/', blank=True, null=True)
    luo_audio_file = models.FileField(upload_to='audio_guides/', blank=True, null=True)
    
    english_audio_url = models.URLField(blank=True, null=True)
    luo_audio_url = models.URLField(blank=True, null=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Audio Guide Config - {self.key}'
