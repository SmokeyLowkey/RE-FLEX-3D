from rest_framework import serializers
from .models import Parts333G, Parts17G, PartsSK850, GLBFile333G

class GLBFile333GSerializer(serializers.ModelSerializer):
    class Meta:
        model = GLBFile333G
        fields = ['id', 'file']


class Parts333GSerializer(serializers.ModelSerializer):
    glb_file = GLBFile333GSerializer()
    
    class Meta:
        model = Parts333G
        fields = ['id', 'part_number', 'part_name', 'quantity', 'description', 'glb_file']

class Parts17GSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parts17G
        fields = ['id', 'part_number', 'part_name', 'quantity', 'description']

class PartsSK850Serializer(serializers.ModelSerializer):
    class Meta:
        model = PartsSK850
        fields = ['id', 'part_number', 'part_name', 'quantity', 'description']