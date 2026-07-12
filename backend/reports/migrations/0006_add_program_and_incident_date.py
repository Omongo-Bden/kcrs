from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0005_audioguideconfig_english_audio_file_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='program',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='incident_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
