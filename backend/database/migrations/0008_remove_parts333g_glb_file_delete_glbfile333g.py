# Generated by Django 5.0 on 2024-01-12 17:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0007_alter_glbfile333g_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='parts333g',
            name='glb_file',
        ),
        migrations.DeleteModel(
            name='GLBFile333G',
        ),
    ]