# Generated by Django 5.0 on 2023-12-10 13:03

import tinymce.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parts17g',
            name='description',
            field=tinymce.models.HTMLField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='parts333g',
            name='description',
            field=tinymce.models.HTMLField(blank=True, null=True),
        ),
    ]
