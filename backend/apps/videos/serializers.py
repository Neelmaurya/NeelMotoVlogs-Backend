from rest_framework import serializers
from .models import Video
from apps.users.serializers import UserSerializer
from apps.categories.serializers import CategorySerializer
from apps.destinations.serializers import CitySerializer

class VideoSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    destination = CitySerializer(read_only=True)
    
    class Meta:
        model = Video
        fields = '__all__'
        read_only_fields = ('video_id', 'thumbnail_url', 'creator')
