# Generated by Django 5.0 on 2023-12-08 07:22

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Parts17G',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('part_number', models.CharField(editable=False, max_length=100)),
                ('part_name', models.CharField(max_length=200)),
                ('quantity', models.IntegerField()),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Parts333G',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('part_number', models.CharField(editable=False, max_length=100)),
                ('part_name', models.CharField(max_length=200)),
                ('quantity', models.IntegerField()),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
    ]
