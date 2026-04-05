import json

from django.contrib.auth import authenticate, get_user_model
from django.core import signing
from django.core.signing import BadSignature, SignatureExpired
from django.http import JsonResponse, StreamingHttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .ai_engine import generate_response, stream_response

User = get_user_model()
TOKEN_SALT = "chatbot.auth"
TOKEN_MAX_AGE = 60 * 60 * 24 * 7


def home(request):
    return render(request, "chatbot/index.html")


def _load_json_body(request):
    try:
        return json.loads(request.body or "{}"), None
    except json.JSONDecodeError:
        return None, JsonResponse({"error": "Invalid JSON payload."}, status=400)


def _read_mode(data):
    return (data.get("mode") or "fix").strip().lower()


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
def chat(request):
    if request.method != "POST":
        return JsonResponse({"response": "Invalid request."}, status=405)

    data, error_response = _load_json_body(request)
    if error_response:
        return error_response

    user_message = (data.get("message") or "").strip()
    mode = _read_mode(data)
    if not user_message:
        return JsonResponse({"response": "No message received."}, status=400)

    reply = generate_response(user_message, mode=mode)
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
    if not user_message:
        return JsonResponse({"response": "No message received."}, status=400)

    def generate():
        for chunk in stream_response(user_message, mode=mode):
            yield chunk

    return StreamingHttpResponse(generate(), content_type="text/plain")
