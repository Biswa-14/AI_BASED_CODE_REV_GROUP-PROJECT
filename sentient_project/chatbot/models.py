import uuid

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    """A named, user-owned thread shown in the workspace history rail."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations")
    title = models.CharField(max_length=120, default="New conversation")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]


class ConversationMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10)
    content = models.TextField()
    mode = models.CharField(max_length=20, default="fix")
    search_mode = models.CharField(max_length=10, default="auto")
    attachments = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

class ConversationMemory(models.Model):
    session_id = models.CharField(max_length=100)
    role = models.CharField(max_length=10)  # 'user' or 'ai'
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
