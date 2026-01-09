from rest_framework import serializers
from .models import VehicleState, MediaState

class VehicleStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleState
        fields = '__all__'

class MediaStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaState
        fields = '__all__'
