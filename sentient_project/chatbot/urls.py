from django.urls import path

from .views import (
    chat,
    chat_stream,
    conversation_detail,
    conversations,
    current_user,
    home,
    login_user,
    logout_user,
    register_user,
)

urlpatterns = [
    path("", home),
    path("auth/register/", register_user),
    path("auth/login/", login_user),
    path("auth/me/", current_user),
    path("auth/logout/", logout_user),
    path("conversations/", conversations),
    path("conversations/<uuid:conversation_id>/", conversation_detail),
    path("chat/", chat),
    path("chat-stream/", chat_stream),
]
