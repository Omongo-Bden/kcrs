from rest_framework import serializers
from .models import Report, Message, AuditLog, ReportEvidence, SuccessStory, FAQ, AudioGuideConfig
from django.contrib.auth.models import User, Group

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'groups', 'is_active']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    group_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'group_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        group_name = validated_data.pop('group_name')
        
        try:
            group = Group.objects.get(name=group_name)
        except Group.DoesNotExist:
            raise serializers.ValidationError({"group_name": f"Group '{group_name}' does not exist."})
            
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.is_staff = True
        user.save()
        user.groups.add(group)
        
        return user

class MessageSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender_type', 'channel', 'text', 'voice_note', 'attachment', 'is_edited', 'created_at']

    def get_text(self, obj):
        return obj.get_decrypted_text()

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = AuditLog
        fields = ['action', 'details', 'username', 'timestamp']

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportEvidence
        fields = ['file', 'uploaded_at']

class ReportSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    audit_logs = serializers.SerializerMethodField()
    additional_evidence = EvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = '__all__'

    def get_messages(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        qs = obj.messages.all().order_by('created_at')
        
        # FIX: Check if user is authenticated BEFORE checking groups
        if not user or not user.is_authenticated:
            # Anonymous Citizen view: Only see Citizen-District channel
            qs = qs.filter(channel='CITIZEN_DISTRICT')
        else:
            # User is authenticated, now it's safe to check groups
            is_agency = user.groups.filter(name='Anti Corruption Agency').exists()
            is_district = user.groups.filter(name='District Officials').exists()
            
            if is_agency:
                qs = qs.filter(channel='ADMIN_INTERNAL')
            elif is_district:
                # District sees both, so we don't filter
                pass 
            else:
                qs = qs.filter(channel='CITIZEN_DISTRICT')
                
        return MessageSerializer(qs, many=True).data

    def get_audit_logs(self, obj):
        request = self.context.get('request')
        # FIX: Added null-check for request and used is_authenticated
        if request and request.user and request.user.is_authenticated:
            return AuditLogSerializer(obj.audit_logs.all().order_by('-timestamp'), many=True).data
        return []

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # FIX: Safer check for anonymous users
        is_authenticated = request and request.user and request.user.is_authenticated
        
        if not is_authenticated:
            # If unauthenticated (Citizen), remove internal fields
            data.pop('admin_note', None)
            # You might want to pop internal status or other admin fields here too
            
        return data

class SuccessStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuccessStory
        fields = '__all__'

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'

class AudioGuideConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioGuideConfig
        fields = '__all__'