# Generated by Django 5.0 on 2024-01-09 05:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0003_partssk850'),
    ]

    operations = [
        migrations.AddField(
            model_name='parts333g',
            name='glb_file',
            field=models.FileField(blank=True, null=True, upload_to='media/'),
        ),
    ]