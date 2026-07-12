from django.contrib import admin
from .models import Report, Message, AuditLog, SuccessStory, ReportEvidence, FAQ, AudioGuideConfig

class ReportEvidenceInline(admin.TabularInline):
    model = ReportEvidence
    extra = 1

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ('created_at',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('tracking_id', 'report_type', 'location', 'status', 'is_priority', 'is_escalated', 'created_at')
    list_filter = ('status', 'is_priority', 'is_escalated', 'report_type', 'created_at')
    search_fields = ('tracking_id', 'location', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('tracking_id', 'created_at')
    inlines = [ReportEvidenceInline, MessageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('tracking_id', 'report_type', 'location', 'description', 'evidence', 'created_at')
        }),
        ('Status & Triage', {
            'fields': ('status', 'is_priority', 'is_escalated', 'admin_note')
        }),
    )

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('report', 'sender_type', 'channel', 'is_encrypted', 'created_at')
    list_filter = ('channel', 'sender_type', 'is_encrypted')
    search_fields = ('report__tracking_id', 'text')
    readonly_fields = ('created_at',)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('report', 'action', 'user', 'ip_address', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('report__tracking_id', 'action', 'details', 'ip_address')
    readonly_fields = ('report', 'user', 'action', 'details', 'ip_address', 'timestamp')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

@admin.register(SuccessStory)
class SuccessStoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'impact_amount', 'created_at')
    search_fields = ('title', 'location', 'description')
    list_filter = ('created_at',)

@admin.register(ReportEvidence)
class ReportEvidenceAdmin(admin.ModelAdmin):
    list_display = ('report', 'uploaded_at')
    search_fields = ('report__tracking_id',)

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'order', 'created_at')
    list_editable = ('order',)
    ordering = ('order',)
    search_fields = ('question', 'answer')

@admin.register(AudioGuideConfig)
class AudioGuideConfigAdmin(admin.ModelAdmin):
    list_display = ('key', 'updated_at')
    search_fields = ('key', 'english_text', 'luo_text')