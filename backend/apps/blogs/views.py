from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Blog
from .serializers import BlogListSerializer, BlogDetailSerializer

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.filter(status='PUBLISHED')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'destination', 'author']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['created_at', 'views_count']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogListSerializer
        return BlogDetailSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and (self.request.user.is_staff or self.request.user.role == 'CREATOR'):
            return Blog.objects.all()
        return Blog.objects.filter(status='PUBLISHED')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
