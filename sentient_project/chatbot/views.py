import json

from django.contrib.auth import authenticate, get_user_model
from django.core import signing
from django.core.signing import BadSignature, SignatureExpired
from django.http import JsonResponse, StreamingHttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .ai_engine import generate_response, stream_response
from .models import Conversation, ConversationMessage

User = get_user_model()
TOKEN_SALT = "chatbot.auth"
TOKEN_MAX_AGE = 60 * 60 * 24 * 7
SUPPORTED_SEARCH_MODES = {"off", "auto", "on"}
MAX_THREAD_CONTEXT_CHARS = 28_000


def home(request):
    return render(request, "chatbot/index.html")


def _load_json_body(request):
    try:
        return json.loads(request.body or "{}"), None
    except json.JSONDecodeError:
        return None, JsonResponse({"error": "Invalid JSON payload."}, status=400)


def _read_mode(data):
    return (data.get("mode") or "fix").strip().lower()


def _read_search_mode(data):
    candidate = (data.get("search_mode") or "auto").strip().lower()
    return candidate if candidate in SUPPORTED_SEARCH_MODES else "auto"


def _conversation_payload(conversation):
    return {
        "id": str(conversation.id),
        "title": conversation.title,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
    }


def _message_payload(message):
    return {
        "id": str(message.id),
        "role": message.role,
        "content": message.content,
        "mode": message.mode,
        "searchMode": message.search_mode,
        "attachments": message.attachments,
        "status": "done",
        "createdAt": message.created_at.isoformat(),
    }


def _title_from_message(message):
    compact = " ".join(message.split())
    if not compact:
        return "New conversation"
    return compact[:80] + ("…" if len(compact) > 80 else "")


def _thread_context(conversation):
    """Keep the current saved thread coherent without leaking across conversations."""
    if conversation is None:
        return ""

    lines = []
    remaining = MAX_THREAD_CONTEXT_CHARS
    # Work backwards so the latest work stays available when a thread gets long.
    for message in reversed(list(conversation.messages.all())):
        speaker = "Sentient" if message.role == "assistant" else "User"
        text = (message.content or "").strip()
        if not text:
            continue
        line = f"{speaker}: {text}\n"
        if len(line) > remaining:
            line = f"{speaker}: {text[-max(0, remaining - len(speaker) - 4):]}\n"
        lines.append(line)
        remaining -= len(line)
        if remaining <= 0:
            break

    return "".join(reversed(lines)).strip()


def _model_request(user_message, user=None, conversation=None):
    user_name = _user_payload(user)["name"] if user is not None else "there"
    context = _thread_context(conversation)
    profile = f"The signed-in user is {user_name}. Address them naturally by name when it fits; do not overuse it."

    if not context:
        return f"{profile}\n\nCurrent request:\n{user_message}"

    return (
        f"{profile}\n\n"
        "Saved conversation context from this same thread (use it to maintain continuity):\n"
        f"{context}\n\nCurrent request:\n{user_message}"
    )


def _get_conversation_for_user(user, conversation_id):
    if not conversation_id:
        return None
    try:
        return Conversation.objects.get(id=conversation_id, user=user)
    except (Conversation.DoesNotExist, ValueError):
        return None


def _user_payload(user):
    name = user.first_name.strip() if user.first_name else ""
    if not name:
        name = user.get_full_name().strip()
    if not name:
        name = user.username.split("@")[0].replace(".", " ").replace("_", " ").title()

    return {
        "id": user.pk,
        "name": name,
        "email": user.email,
    }


def _issue_token(user):
    return signing.dumps({"user_id": user.pk}, salt=TOKEN_SALT)


def _extract_token(request):
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[7:].strip()
    return ""


def _get_authenticated_user(request):
    token = _extract_token(request)
    if not token:
        return None

    try:
        payload = signing.loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None

    user_id = payload.get("user_id")
    if not user_id:
        return None

    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return None


def _require_authenticated_user(request):
    user = _get_authenticated_user(request)
    if user is None:
        return None, JsonResponse({"error": "Authentication required."}, status=401)
    return user, None


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request."}, status=405)

    data, error_response = _load_json_body(request)
    if error_response:
        return error_response

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not name or not email or not password:
        return JsonResponse({"error": "Name, email, and password are required."}, status=400)

    if "@" not in email:
        return JsonResponse({"error": "Please provide a valid email address."}, status=400)

    if len(password) < 6:
        return JsonResponse({"error": "Password must be at least 6 characters long."}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({"error": "An account with this email already exists."}, status=409)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
    )
    token = _issue_token(user)

    return JsonResponse({"token": token, "user": _user_payload(user)}, status=201)


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request."}, status=405)

    data, error_response = _load_json_body(request)
    if error_response:
        return error_response

    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return JsonResponse({"error": "Email and password are required."}, status=400)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({"error": "Invalid email or password."}, status=401)

    token = _issue_token(user)
    return JsonResponse({"token": token, "user": _user_payload(user)})


@csrf_exempt
def current_user(request):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request."}, status=405)

    user, error_response = _require_authenticated_user(request)
    if error_response:
        return error_response

    return JsonResponse({"user": _user_payload(user)})


@csrf_exempt
def logout_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request."}, status=405)

    user, error_response = _require_authenticated_user(request)
    if error_response:
        return error_response

    return JsonResponse({"message": f"Logged out {user.email}."})


@csrf_exempt
def conversations(request):
    user, error_response = _require_authenticated_user(request)
    if error_response:
        return error_response

    if request.method == "GET":
        items = Conversation.objects.filter(user=user)
        return JsonResponse({"conversations": [_conversation_payload(item) for item in items]})

    if request.method == "POST":
        data, error_response = _load_json_body(request)
        if error_response:
            return error_response
        title = _title_from_message((data.get("title") or "").strip())
        conversation = Conversation.objects.create(user=user, title=title)
        return JsonResponse({"conversation": _conversation_payload(conversation)}, status=201)

    return JsonResponse({"error": "Invalid request."}, status=405)


@csrf_exempt
def conversation_detail(request, conversation_id):
    user, error_response = _require_authenticated_user(request)
    if error_response:
        return error_response

    conversation = _get_conversation_for_user(user, conversation_id)
    if conversation is None:
        return JsonResponse({"error": "Conversation not found."}, status=404)

    if request.method == "GET":
        return JsonResponse({
            "conversation": _conversation_payload(conversation),
            "messages": [_message_payload(message) for message in conversation.messages.all()],
        })

    if request.method == "DELETE":
        conversation.delete()
        return JsonResponse({"message": "Conversation deleted."})

    return JsonResponse({"error": "Invalid request."}, status=405)


@csrf_exempt
def chat(request):
    if request.method != "POST":
        return JsonResponse({"response": "Invalid request."}, status=405)

    data, error_response = _load_json_body(request)
    if error_response:
        return error_response

    user_message = (data.get("message") or "").strip()
    mode = _read_mode(data)
    search_mode = _read_search_mode(data)
    if not user_message:
        return JsonResponse({"response": "No message received."}, status=400)

    reply = generate_response(user_message, mode=mode, search_mode=search_mode)
    return JsonResponse({"response": reply})


@csrf_exempt
def chat_stream(request):
    if request.method != "POST":
        return JsonResponse({"response": "Invalid request."}, status=405)

    data, error_response = _load_json_body(request)
    if error_response:
        return error_response

    user_message = (data.get("message") or "").strip()
    mode = _read_mode(data)
    search_mode = _read_search_mode(data)
    conversation = None
    authenticated_user = _get_authenticated_user(request)
    conversation_id = data.get("conversation_id")
    if not user_message:
        return JsonResponse({"response": "No message received."}, status=400)

    if conversation_id:
        if authenticated_user is None:
            return JsonResponse({"error": "Authentication required for saved conversations."}, status=401)
        conversation = _get_conversation_for_user(authenticated_user, conversation_id)
        if conversation is None:
            return JsonResponse({"error": "Conversation not found."}, status=404)

        display_message = (data.get("display_message") or user_message).strip()
        ConversationMessage.objects.create(
            conversation=conversation,
            role="user",
            content=display_message,
            mode=mode,
            search_mode=search_mode,
            attachments=data.get("attachments") if isinstance(data.get("attachments"), list) else [],
        )
        if conversation.messages.count() == 1:
            conversation.title = _title_from_message(display_message)
            conversation.save(update_fields=["title", "updated_at"])

    model_request = _model_request(user_message, authenticated_user, conversation)

    def generate():
        response_parts = []
        try:
            for chunk in stream_response(model_request, mode=mode, search_mode=search_mode):
                response_parts.append(chunk)
                yield chunk
        finally:
            if conversation is not None:
                ConversationMessage.objects.create(
                    conversation=conversation,
                    role="assistant",
                    content="".join(response_parts) or "No response was generated.",
                    mode=mode,
                    search_mode=search_mode,
                )
                conversation.save(update_fields=["updated_at"])

    return StreamingHttpResponse(generate(), content_type="text/plain")
