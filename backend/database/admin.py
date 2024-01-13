from django.contrib import admin
from .models import Parts333G, Parts17G, PartsSK850


@admin.register(Parts333G)
class Parts333GAdmin(admin.ModelAdmin):
    list_display = ['part_number', 'part_name', 'quantity', 'description']
    search_fields = ['part_number', 'part_name']

@admin.register(Parts17G)
class Parts17GAdmin(admin.ModelAdmin):
    list_display = ['part_number', 'part_name', 'quantity', 'description']
    search_fields = ['part_number', 'part_name']

@admin.register(PartsSK850)
class PartsSK850Admin(admin.ModelAdmin):
    list_display = ['part_number', 'part_name', 'quantity', 'description']
    search_fields = ['part_number', 'part_name']