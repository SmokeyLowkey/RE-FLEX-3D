# Generated by Django 5.0 on 2024-01-09 05:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0006_alter_glbfile333g_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='glbfile333g',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='model333G/'),
        ),
    ]
