from django.db import models
import uuid

class MediaFile(models.Model):
    FILE_TYPES = (
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
        ('DOCUMENT', 'Document'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='uploads/%Y/%m/')
    file_type = models.CharField(max_length=10, choices=FILE_TYPES, default='IMAGE')
    file_size = models.PositiveIntegerField(help_text="Size in bytes", editable=False)
    
    # Metadata
    alt_text = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or self.file.name
