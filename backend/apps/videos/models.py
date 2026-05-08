from django.db import models
from django.conf import settings
from apps.categories.models import Category
from apps.destinations.models import City
import requests
import re

class Video(models.Model):
    VIDEO_TYPES = (
        ('LONG', 'Long Form'),
        ('SHORT', 'Short/Reel'),
    )

    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    youtube_url = models.URLField(unique=True)
    video_id = models.CharField(max_length=20, unique=True, blank=True)
    thumbnail_url = models.URLField(blank=True)
    
    description = models.TextField(blank=True)
    video_type = models.CharField(max_length=10, choices=VIDEO_TYPES, default='LONG')
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='videos')
    destination = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name='videos')
    
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def extract_video_id(self, url):
        """Extracts the YouTube video ID from various URL formats."""
        pattern = r'(?:v=|\/|embed\/|shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})'
        match = re.search(pattern, url)
        return match.group(1) if match else None

    def save(self, *args, **kwargs):
        if not self.video_id:
            self.video_id = self.extract_video_id(self.youtube_url)
        
        if self.video_id and not self.thumbnail_url:
            self.thumbnail_url = f"https://img.youtube.com/vi/{self.video_id}/maxresdefault.jpg"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
