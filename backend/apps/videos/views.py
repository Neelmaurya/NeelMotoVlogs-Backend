from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Video
from .serializers import VideoSerializer

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'destination', 'video_type', 'is_featured']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'views_count']

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
