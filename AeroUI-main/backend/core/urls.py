from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleStateViewSet, MediaStateViewSet

router = DefaultRouter()
router.register(r'vehicle-state', VehicleStateViewSet, basename='vehicle-state')
router.register(r'media-state', MediaStateViewSet, basename='media-state')

urlpatterns = [
    path('', include(router.urls)),
]
