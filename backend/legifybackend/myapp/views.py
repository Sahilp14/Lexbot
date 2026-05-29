from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.http import JsonResponse
import json
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from django.views.decorators.csrf import csrf_exempt
import requests
from datetime import datetime
from dotenv import load_dotenv

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    parser_classes,
)
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.authtoken.models import Token

from django.contrib.auth import authenticate, login

from .models import UserFile, PasswordResetOTP
from .utilities.text_extractor import extract_text
from .utilities.text_summarizer import summarize_text
from .utilities.ncr import extract_legal_entities

load_dotenv()

# ================= USER SERIALIZER =================


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


# ================= AUTH APIs =================


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "This is a protected view!"})


@csrf_exempt
@api_view(["POST"])
def create_user(request):
    data = request.data
    user = User.objects.create_user(
        username=data["username"], email=data["email"], password=data["password"]
    )
    return JsonResponse({"message": "User created", "id": user.id})


def get_users(request):
    users = User.objects.all().values(
        "id", "username", "email", "is_staff", "is_active", "date_joined"
    )
    return JsonResponse(list(users), safe=False)


def get_user(request, id):
    user = get_object_or_404(User, id=id)
    return JsonResponse(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_active": user.is_active,
            "date_joined": user.date_joined,
        }
    )


def update_user(request, id):
    if request.method == "PUT":
        data = json.loads(request.body)
        user = get_object_or_404(User, id=id)
        user.username = data.get("username", user.username)
        user.email = data.get("email", user.email)
        if "password" in data:
            user.set_password(data["password"])
        user.save()
        return JsonResponse({"message": "User updated"})


def delete_user(request, id):
    if request.method == "DELETE":
        user = get_object_or_404(User, id=id)
        user.delete()
        return JsonResponse({"message": "User deleted"})


@csrf_exempt
@api_view(["POST"])
def user_login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)

    if user:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response({"token": token.key, "user": user_data})

    return Response({"error": "Invalid credentials"}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_logout(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({"message": "Logged out successfully!"})


# ================= FILE UPLOAD =================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def file_upload(request):
    if "file" not in request.FILES:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    uploaded_file = request.FILES["file"]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_file_name = f"{request.user.id}_{timestamp}_{uploaded_file.name}"
    file_path = os.path.join(settings.MEDIA_ROOT, "uploads", unique_file_name)

    default_storage.save(file_path, ContentFile(uploaded_file.read()))

    user_file = UserFile.objects.create(
        user=request.user,
        file_name=unique_file_name,
        file_path=file_path,
    )

    try:
        extracted_text = extract_text(file_path)

        if not extracted_text:
            return JsonResponse(
                {"error": "Could not extract text from file"}, status=400
            )

        # Save extracted text
        user_file.extracted_text = str(extracted_text)
        user_file.save()

        # ── Summarise ────────────────────────────────────────────────────────
        summarized = ""
        summary_error = None
        try:
            summarized = summarize_text(str(extracted_text), 2)
        except Exception as e:
            import traceback

            summary_error = str(e)
            traceback.print_exc()
            print("SUMMARY ERROR:", summary_error)
            summarized = "Summary generation failed: " + summary_error

        return JsonResponse(
            {
                "message": "File uploaded successfully",
                "file_url": f"{settings.MEDIA_URL}uploads/{unique_file_name}",
                "summarized_text": summarized,
                "extracted_text": str(extracted_text),
                "file_id": user_file.id,
            },
            status=201,
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def file_history(request):
    user_files = UserFile.objects.filter(user=request.user).order_by("-uploaded_at")

    data = [
        {
            "id": f.id,
            "file_name": f.file_name,
            "file_url": f"{settings.MEDIA_URL}uploads/{f.file_name}",
            "uploaded_at": f.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for f in user_files
    ]

    return JsonResponse({"file_history": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def file_details(request, file_id):
    """
    Return full details for a single file including OCR text and summary.
    Called when the user clicks a document from sidebar / history.
    """
    try:
        user_file = get_object_or_404(UserFile, id=file_id, user=request.user)

        # Extract on-the-fly if text is missing (legacy entries)
        if not user_file.extracted_text:
            if os.path.exists(user_file.file_path):
                try:
                    user_file.extracted_text = extract_text(user_file.file_path)
                    user_file.save()
                except Exception as ext_err:
                    print(f"Re-extraction failed for file {file_id}: {ext_err}")

        # ── Summarise ────────────────────────────────────────────────────────
        summarized = ""
        if user_file.extracted_text:
            try:
                summarized = summarize_text(user_file.extracted_text, 2)
            except Exception as e:
                import traceback

                traceback.print_exc()
                print(f"Error summarizing file {file_id}: {e}")
                # Return a helpful message rather than a blank string so the
                # frontend can display something in the Summary tab.
                summarized = f"Summary could not be generated: {str(e)}"

        return JsonResponse(
            {
                "id": user_file.id,
                "file_name": user_file.file_name,
                "file_url": f"{settings.MEDIA_URL}uploads/{user_file.file_name}",
                "uploaded_at": user_file.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
                "extracted_text": user_file.extracted_text or "",
                "summarized_text": summarized,
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cleanup_files(request):
    user_files = UserFile.objects.filter(user=request.user)

    for f in user_files:
        if os.path.exists(f.file_path):
            os.remove(f.file_path)
        f.delete()

    return JsonResponse({"message": "Files cleaned successfully"})


# ================= GEMINI CHAT =================

import os
import re
import time
import hashlib
import logging
from collections import OrderedDict
from threading import Lock
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("legify.chat")

API_KEY = os.getenv("GEMINI_API_KEY")

# ---- Response Cache (LRU, thread-safe) ----
_cache_lock = Lock()
_response_cache = OrderedDict()  # key → (answer, timestamp)
_CACHE_MAX_SIZE = 200
_CACHE_TTL_SECONDS = 3600  # 1 hour


def _cache_key(file_id, question):
    normalized = re.sub(r"\s+", " ", question.lower().strip())
    raw = f"{file_id or 'none'}:{normalized}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _cache_get(key):
    with _cache_lock:
        if key in _response_cache:
            answer, ts = _response_cache[key]
            if time.time() - ts < _CACHE_TTL_SECONDS:
                _response_cache.move_to_end(key)
                return answer
            else:
                del _response_cache[key]
    return None


def _cache_set(key, answer):
    with _cache_lock:
        _response_cache[key] = (answer, time.time())
        if len(_response_cache) > _CACHE_MAX_SIZE:
            _response_cache.popitem(last=False)


# ---- Per-user Throttle ----
_throttle_lock = Lock()
_user_last_request = {}
_THROTTLE_SECONDS = 2


def _check_throttle(user_id):
    now = time.time()
    with _throttle_lock:
        last = _user_last_request.get(user_id, 0)
        if now - last < _THROTTLE_SECONDS:
            return False
        _user_last_request[user_id] = now
        return True


# ---- Token-Optimized Chunking ----
def get_relevant_chunks(text, query, max_chars=8000):
    if not text:
        return ""

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    if len(text) <= max_chars:
        return text.strip()

    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

    seen = set()
    unique_paragraphs = []
    for p in paragraphs:
        key = p.lower()[:80]
        if key not in seen:
            seen.add(key)
            unique_paragraphs.append(p)
    paragraphs = unique_paragraphs

    query_words = set(re.findall(r"\w+", query.lower()))
    if not query_words:
        return text[:max_chars].strip()

    scored = []
    for i, para in enumerate(paragraphs):
        para_words = set(re.findall(r"\w+", para.lower()))
        score = len(query_words.intersection(para_words))
        scored.append((i, para, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    selected = []
    current_len = 0

    for idx, para, score in scored:
        if current_len + len(para) + 1 <= max_chars:
            selected.append((idx, para))
            current_len += len(para) + 1
        elif not selected:
            selected.append((idx, para[:max_chars]))
            break
        else:
            break

    selected.sort(key=lambda x: x[0])
    return "\n".join(p for _, p in selected)


# ---- Local Keyword Fallback ----
def _local_keyword_search(text, query, max_results=5):
    if not text or not query:
        return None

    paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) > 30]
    query_words = set(re.findall(r"\w+", query.lower()))
    if not query_words:
        return None

    scored = []
    for para in paragraphs:
        para_words = set(re.findall(r"\w+", para.lower()))
        score = len(query_words.intersection(para_words))
        if score > 0:
            scored.append((score, para))

    if not scored:
        return None

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:max_results]
    excerpts = "\n\n".join(f"• {p}" for _, p in top)
    return (
        "AI service is currently unavailable, but here are the most relevant "
        f"sections from your document:\n\n{excerpts}"
    )


# ---- Gemini API Call with Exponential Backoff ----
# ---- Gemini API Call with Exponential Backoff ----
def _call_gemini_with_retry(payload, max_retries=3):
    api_key = os.getenv("GEMINI_API_KEY", API_KEY)
    # Updated to 2.5-flash-lite
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"

    last_error = None
    # Hardcoded backoff times to outlast the 1-minute RPM bucket
    backoff_times = [10, 30, 60, 60]

    for attempt in range(max_retries + 1):
        try:
            resp = requests.post(url, json={"contents": payload}, timeout=30)

            if resp.status_code == 200:
                return resp, None

            if resp.status_code == 429:
                wait_time = (
                    backoff_times[attempt] if attempt < len(backoff_times) else 60
                )

                logger.warning(
                    f"Gemini 429 on attempt {attempt+1}, retrying in {wait_time}s"
                )

                if attempt < max_retries:
                    time.sleep(wait_time)
                    continue

                return (
                    None,
                    "AI service is temporarily busy. Please try again in a minute.",
                )

            if resp.status_code >= 500:
                logger.warning(f"Gemini {resp.status_code} on attempt {attempt+1}")
                if attempt < max_retries:
                    time.sleep(2**attempt)
                    continue
                return (
                    None,
                    "AI service is experiencing issues. Please try again shortly.",
                )

            try:
                err_msg = resp.json().get("error", {}).get("message", "")
            except Exception:
                err_msg = resp.text[:150]

            if "quota" in err_msg.lower() or "rate" in err_msg.lower():
                return (
                    None,
                    "AI service is temporarily busy. Please try again in a minute.",
                )

            logger.error(f"Gemini {resp.status_code}: {err_msg}")
            return None, "AI service encountered an error. Please try again."

        except requests.exceptions.Timeout:
            last_error = "The AI service timed out. Please try again."
            if attempt < max_retries:
                time.sleep(1)
                continue
        except requests.exceptions.ConnectionError:
            last_error = "Could not connect to the AI service. Please check your internet connection."
            break
        except Exception as e:
            last_error = f"AI service unavailable: {str(e)}"
            break

    return None, last_error


# ---- Chat Endpoint ----
@api_view(["POST"])
def chat(request):
    prompt = request.data.get("prompt", "").strip()
    file_id = request.data.get("file_id")

    if not prompt:
        return Response({"success": False, "error": "Prompt is required."}, status=200)

    user_id = getattr(request.user, "id", "anon")
    if not _check_throttle(user_id):
        return Response(
            {
                "success": False,
                "error": "You're sending requests too quickly. Please wait a moment.",
            },
            status=200,
        )

    ck = _cache_key(file_id, prompt)
    cached = _cache_get(ck)
    if cached:
        logger.info(f"Cache HIT for file_id={file_id}")
        return Response(
            {"success": True, "answer": cached, "response": cached, "cached": True}
        )

    context_text = ""
    if file_id:
        try:
            if request.user and request.user.is_authenticated:
                user_file = UserFile.objects.filter(
                    id=file_id, user=request.user
                ).first()
            else:
                user_file = UserFile.objects.filter(id=file_id).first()

            if user_file and user_file.extracted_text:
                context_text = user_file.extracted_text
                logger.info(
                    f"Document context loaded: {len(context_text)} chars, file_id={file_id}"
                )
        except Exception as e:
            logger.error(f"DB error loading file_id={file_id}: {e}")

    if context_text:
        relevant_context = get_relevant_chunks(context_text, prompt)
        logger.info(
            f"Context sent to Gemini: {len(relevant_context)} chars (from {len(context_text)})"
        )

        system_prompt = (
            "You are a legal document assistant. Answer ONLY from the document below.\n"
            "If the answer is not in the document, say: 'This information is not found in the document.'\n"
            "Be concise.\n\n"
            "DOCUMENT:\n"
            f"{relevant_context}\n\n"
            "QUESTION:"
        )

        contents_payload = [{"parts": [{"text": system_prompt}, {"text": prompt}]}]
    else:
        contents_payload = [{"parts": [{"text": prompt}]}]

    resp, error_msg = _call_gemini_with_retry(contents_payload)

    if error_msg:
        logger.warning(f"Gemini failed: {error_msg}")
        if context_text:
            fallback = _local_keyword_search(context_text, prompt)
            if fallback:
                return Response(
                    {
                        "success": True,
                        "answer": fallback,
                        "response": fallback,
                        "fallback": True,
                    }
                )
        return Response({"success": False, "error": error_msg}, status=200)

    try:
        data = resp.json()
        candidates = data.get("candidates", [])

        if not candidates:
            block_reason = data.get("promptFeedback", {}).get("blockReason", "")
            if block_reason:
                return Response(
                    {"success": False, "error": "Request blocked by safety filters."},
                    status=200,
                )
            return Response(
                {
                    "success": False,
                    "error": "AI could not generate a response. Please rephrase.",
                },
                status=200,
            )

        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        if not text:
            return Response(
                {"success": False, "error": "AI returned an empty response."},
                status=200,
            )

        _cache_set(ck, text)
        logger.info(f"Chat OK — {len(text)} chars, cached.")
        return Response({"success": True, "answer": text, "response": text})

    except Exception as e:
        logger.error(f"Gemini response parse error: {e}")
        return Response(
            {"success": False, "error": "Failed to process AI response."}, status=200
        )


# ================= NER =================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def getners(request):
    text = request.data.get("text")
    if not text:
        return Response({"error": "Text is required"}, status=400)

    ners = extract_legal_entities(text)

    if not ners:
        ners = {}

    import json

    return Response({"entities": ners, "response": f"```json\n{json.dumps(ners)}\n```"})


# ================= SETTINGS API =================

user_settings_data = {}


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def user_settings(request):
    user_id = request.user.id

    if request.method == "GET":
        return Response(
            user_settings_data.get(
                user_id,
                {
                    "theme": "light",
                    "language": "english",
                    "notifications": True,
                    "autoSave": True,
                },
            )
        )

    elif request.method == "POST":
        user_settings_data[user_id] = request.data
        return Response({"message": "Settings saved successfully"})


# ================= PASSWORD RESET APIs =================


@api_view(["POST"])
def request_password_reset_otp(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    user = User.objects.filter(email=email).first()
    if not user:
        return Response(
            {
                "message": "If a user with this email exists, a 6-digit OTP has been sent."
            }
        )

    import random

    otp = f"{random.randint(100000, 999999)}"

    PasswordResetOTP.objects.create(user=user, otp=otp)

    from django.core.mail import send_mail
    from django.conf import settings as django_settings

    subject = "Your LexBot Password Reset OTP"
    message = (
        f"Hello {user.username},\n\n"
        f"Your password reset verification code is: {otp}\n\n"
        "This OTP is valid for 10 minutes.\n\n"
        "If you did not request this, please ignore this email."
    )
    from_email = getattr(django_settings, "DEFAULT_FROM_EMAIL", "support@legify.com")

    try:
        send_mail(subject, message, from_email, [email], fail_silently=False)
    except Exception as e:
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)

    response_data = {
        "message": "If a user with this email exists, a 6-digit OTP has been sent."
    }

    if django_settings.DEBUG:
        response_data["otp"] = otp

    return Response(response_data)


@api_view(["POST"])
def reset_password_with_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    new_password = request.data.get("password")

    if not email or not otp or not new_password:
        return Response(
            {"error": "Email, OTP, and new password are required"}, status=400
        )

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User with this email does not exist"}, status=400)

    from django.utils import timezone
    from datetime import timedelta

    ten_minutes_ago = timezone.now() - timedelta(minutes=10)
    otp_record = (
        PasswordResetOTP.objects.filter(
            user=user, otp=otp, is_verified=False, created_at__gte=ten_minutes_ago
        )
        .order_by("-created_at")
        .first()
    )

    if not otp_record:
        return Response({"error": "Invalid or expired OTP"}, status=400)

    otp_record.is_verified = True
    otp_record.save()

    PasswordResetOTP.objects.filter(user=user, is_verified=False).update(
        is_verified=True
    )

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password has been reset successfully!"})
