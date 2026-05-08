from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django_ckeditor_5.fields import CKEditor5Field
from apps.categories.models import Category, Tag
from apps.destinations.models import City

class Blog(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    )

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blogs')
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, max_length=255)
    content = CKEditor5Field('Content', config_name='default')
    excerpt = models.TextField(max_length=500, blank=True)
    cover_image = models.ImageField(upload_to='blogs/covers/')
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='blogs')
    tags = models.ManyToManyField(Tag, blank=True, related_name='blogs')
    destination = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name='blogs')
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # SEO Fields
    meta_title = models.CharField(max_length=100, blank=True)
    meta_description = models.TextField(max_length=160, blank=True)
    keywords = models.CharField(max_length=255, blank=True)
    
    # Analytics
    views_count = models.PositiveIntegerField(default=0)
    read_time = models.PositiveIntegerField(default=0, help_text="Read time in minutes")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Calculate simple read time (approx 200 words per minute)
        word_count = len(self.content.split())
        self.read_time = max(1, word_count // 200)
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
