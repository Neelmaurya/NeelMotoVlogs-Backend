from django.db import models
import uuid

class AIServiceTask(models.Model):
    TASK_TYPES = (
        ('REEL_GEN', 'Reel Generator'),
        ('CAPTION_GEN', 'Caption Generator'),
        ('BLOG_GEN', 'Blog Post Generator'),
        ('TRANSCRIPTION', 'Voice to Text'),
        ('SCENE_DETECTION', 'Video Scene Detection'),
        ('SMART_TAGGING', 'AI Tagging System'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    )

    task_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    input_data = models.JSONField()
    output_data = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.task_type} - {self.status}"

class AIModelRegistry(models.Model):
    """Registry for AI models being used."""
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    provider = models.CharField(max_length=50, help_text="e.g., OpenAI, Anthropic, Local (Ollama)")
    is_active = models.BooleanField(default=True)
    config = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.version})"
