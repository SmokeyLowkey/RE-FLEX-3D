from rest_framework import viewsets
from .models import Parts333G, Parts17G, PartsSK850
from .serializers import Parts333GSerializer, Parts17GSerializer, PartsSK850Serializer
from rest_framework.exceptions import NotFound


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
