from rest_framework import viewsets
from django.http import JsonResponse
import boto3
from django.conf import settings
from .models import Parts333G, Parts17G, PartsSK850
from .serializers import Parts333GSerializer, Parts17GSerializer, PartsSK850Serializer
from rest_framework.exceptions import NotFound
from django.views.decorators.cache import never_cache
@never_cache
def generate_presigned_url(request, model_name):
    s3_client = boto3.client('s3',
                             aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                             region_name=settings.AWS_S3_REGION_NAME)
    # Construct the key for the S3 object
    object_key = f'model{model_name}/{model_name}.glb'
    print("Object Key for S3:", object_key)  # Logging the object key

    presigned_url = s3_client.generate_presigned_url('get_object', Params={
        'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
        'Key': f'model{model_name}/{model_name}.glb'}, ExpiresIn=3600)
    print("Generated Presigned URL:", presigned_url)  # Logging the presigned URL
    return JsonResponse({'url': presigned_url})

class Parts333GViewSet(viewsets.ModelViewSet):
    queryset = Parts333G.objects.all()
    serializer_class = Parts333GSerializer

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())

        # Get the part_number from the URL
        part_number = self.kwargs.get('part_number', None)

        # Modify this to filter based on the part_number
        obj = queryset.filter(part_number=part_number).first()

        # Handle the case where no object is found
        if obj is None:
            raise NotFound()

        return obj

class Parts17GViewSet(viewsets.ModelViewSet):
    queryset = Parts17G.objects.all()
    serializer_class = Parts17GSerializer
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())

        # Get the part_number from the URL
        part_number = self.kwargs.get('part_number', None)

        # Modify this to filter based on the part_number
        obj = queryset.filter(part_number=part_number).first()

        # Handle the case where no object is found
        if obj is None:
            raise NotFound()

        return obj
    
class PartsSK850ViewSet(viewsets.ModelViewSet):
    queryset = PartsSK850.objects.all()
    serializer_class = PartsSK850Serializer
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())

        # Get the part_number from the URL
        part_number = self.kwargs.get('part_number', None)

        # Modify this to filter based on the part_number
        obj = queryset.filter(part_number=part_number).first()

        # Handle the case where no object is found
        if obj is None:
            raise NotFound()

        return obj
