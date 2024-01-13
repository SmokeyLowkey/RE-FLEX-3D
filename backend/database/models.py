from django.db import models
import os
from tinymce.models import HTMLField #ignore

class Parts333G(models.Model):
    part_number = models.CharField(max_length=100, editable=False)
    part_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    description = HTMLField(blank=True, null=True)
    def __str__(self):
        return self.part_number

class Parts17G(models.Model):
    part_number = models.CharField(max_length=100, editable=False)
    part_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    description = HTMLField(blank=True, null=True)

    def __str__(self):
        return self.part_number
    
class PartsSK850(models.Model):
    part_number = models.CharField(max_length=100, editable=False)
    part_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    description = HTMLField(blank=True, null=True)

    def __str__(self):
        return self.part_number