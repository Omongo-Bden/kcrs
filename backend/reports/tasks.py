from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Report

@shared_task
def process_report_submission(report_pk):
    try:
        report = Report.objects.get(pk=report_pk)
        # Send confirmation email to admins
        send_mail(
            subject=f"[CRS Alert] New Report Submitted: {report.tracking_id}",
            message=f"A new report has been submitted.\n\nType: {report.report_type}\nLocation: {report.location}\n\nPlease review immediately in the admin portal.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
        return f"Successfully processed report {report.tracking_id}"
    except Report.DoesNotExist:
        return "Report does not exist"
    except Exception as e:
        return f"Error processing report: {str(e)}"
