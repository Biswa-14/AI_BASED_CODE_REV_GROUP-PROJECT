from django.db import models

class ConversationMemory(models.Model):
    session_id = models.CharField(max_length=100)
    role = models.CharField(max_length=10)  # 'user' or 'ai'
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)