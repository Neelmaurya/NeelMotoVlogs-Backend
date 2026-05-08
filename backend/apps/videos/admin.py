from django.contrib import admin
from .models import Video

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'category', 'video_type', 'is_featured', 'created_at')
    list_filter = ('video_type', 'is_featured', 'category')
    search_fields = ('title', 'description')
