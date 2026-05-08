from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class PageView(models.Model):
    # Track views for any model (Blog, Video, Destination)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    referer = models.URLField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"View for {self.content_object} at {self.timestamp}"

class DailyAnalytics(models.Model):
    date = models.DateField(unique=True)
    total_views = models.PositiveIntegerField(default=0)
    blog_views = models.PositiveIntegerField(default=0)
    video_views = models.PositiveIntegerField(default=0)
    new_contacts = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return str(self.date)
