from rest_framework import serializers
from .models import Blog
from apps.users.serializers import UserSerializer
from apps.categories.serializers import CategorySerializer, TagSerializer
from apps.destinations.serializers import CitySerializer

class BlogListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Blog
        fields = ('id', 'title', 'slug', 'excerpt', 'cover_image', 'author', 'category', 'tags', 'read_time', 'published_at', 'views_count')

class BlogDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    destination = CitySerializer(read_only=True)
    
    class Meta:
        model = Blog
        fields = '__all__'
