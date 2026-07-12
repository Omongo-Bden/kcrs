from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender='reports.Report')
def handle_report_submission(sender, instance, created, **kwargs):
    """
    Triggered when a report is saved. Wrap in try/except to prevent
    500 errors if the background worker (Celery/Redis) is offline.
    """
    if created:
        try:
            # Import inside the function to avoid circular imports
            from .tasks import process_report_submission
            
            # Use .delay() to send to background
            process_report_submission.delay(instance.pk)
            print(f"--- [SIGNAL] Task successfully queued for Report {instance.pk} ---")
            
        except Exception as e:
            # This catch-all prevents the 500 error on the frontend
            print(f"--- [SIGNAL ERROR] Database saved, but Celery failed: {e} ---")
            logger.error(f"Celery queue failed: {e}")