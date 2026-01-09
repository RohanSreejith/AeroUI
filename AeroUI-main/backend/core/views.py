from rest_framework import viewsets
from rest_framework.response import Response
from .models import VehicleState, MediaState
from .serializers import VehicleStateSerializer, MediaStateSerializer

class VehicleStateViewSet(viewsets.ModelViewSet):
    queryset = VehicleState.objects.all()
    serializer_class = VehicleStateSerializer
    
    def get_object(self):
        return VehicleState.load()

    def list(self, request):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

class MediaStateViewSet(viewsets.ModelViewSet):
    queryset = MediaState.objects.all()
    serializer_class = MediaStateSerializer

    def get_object(self):
        return MediaState.load()
    
    def list(self, request):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)
