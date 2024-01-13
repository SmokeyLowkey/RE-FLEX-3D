from rest_framework import serializers
from .models import Parts333G, Parts17G, PartsSK850



class Parts333GSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Parts333G
        fields = ['id', 'part_number', 'part_name', 'quantity', 'description']

class Parts17GSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parts17G
        fields = ['id', 'part_number', 'part_name', 'quantity', 'description']

class PartsSK850Serializer(serializers.ModelSerializer):
    class Meta:
        model = PartsSK850
        fields = ['id', 'part_number', 'part_name', 'quantity', 'description']