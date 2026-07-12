import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from reports.models import SuccessStory, Report, AuditLog, FAQ
from django.contrib.auth.models import User

def seed():
    # 1. Clear existing
    SuccessStory.objects.all().delete()
    FAQ.objects.all().delete()

    # 2. Add Success Stories
    SuccessStory.objects.create(
        title="Aboke PDM Recovery",
        description="A citizen report regarding ghost beneficiaries in the Parish Development Model (PDM) program in Aboke sub-county led to a full audit. Over 5M UGX was recovered and redistributed to eligible households.",
        impact_amount="5.2M UGX Recovered",
        location="Aboke Sub-County"
    )

    SuccessStory.objects.create(
        title="Illegal Road Tolls Removed",
        description="Anonymous reports of unauthorized road tolls on the Lira-Kole highway were investigated. Local officials involved were disciplined, and the illegal checkpoints were permanently dismantled.",
        impact_amount="Checkpoints Removed",
        location="Alito Sub-County"
    )

    SuccessStory.objects.create(
        title="Drug Theft Investigation",
        description="Multiple reports about the theft of government-supplied medicines from a local health center led to the arrest of three staff members. Medicine stocks are now tracked via a new digital system.",
        impact_amount="3 Officials Arrested",
        location="Bala Sub-County"
    )

    print("Success Stories seeded successfully!")

    # 3. Add FAQs
    FAQ.objects.create(question="Is my identity really safe?", answer="Yes. We do not collect names, phone numbers, or IP addresses. Your report is fully anonymous by design.", order=1)
    FAQ.objects.create(question="What happens after I report?", answer="Your report is reviewed by district officials within 48 hours. If verified, it is escalated for investigation.", order=2)
    FAQ.objects.create(question="Can I communicate with investigators?", answer="Yes. You can use your Tracking ID to access the secure chat and provide additional evidence or voice notes.", order=3)
    print("FAQs seeded successfully!")

    # 3. Add some initial Audit Logs for existing reports if any
    reports = Report.objects.all()
    admin = User.objects.filter(username='district_admin').first()
    
    if reports.exists() and admin:
        for report in reports:
            if not AuditLog.objects.filter(report=report).exists():
                AuditLog.objects.create(
                    report=report,
                    user=admin,
                    action="Initial Review",
                    details="System initialized tracking for this report."
                )
        print("Audit Logs initialized for existing reports.")

if __name__ == "__main__":
    seed()
