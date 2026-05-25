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

from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
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

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "This is a protected view!"})


@csrf_exempt
@api_view(['POST'])
def create_user(request):
    data = request.data
    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )
    return JsonResponse({'message': 'User created', 'id': user.id})


def get_users(request):
    users = User.objects.all().values('id', 'username', 'email', 'is_staff', 'is_active', 'date_joined')
    return JsonResponse(list(users), safe=False)


def get_user(request, id):
    user = get_object_or_404(User, id=id)
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_active': user.is_active,
        'date_joined': user.date_joined
    })


def update_user(request, id):
    if request.method == 'PUT':
        data = json.loads(request.body)
        user = get_object_or_404(User, id=id)
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        if 'password' in data:
            user.set_password(data['password'])
        user.save()
        return JsonResponse({'message': 'User updated'})


def delete_user(request, id):
    if request.method == 'DELETE':
        user = get_object_or_404(User, id=id)
        user.delete()
        return JsonResponse({'message': 'User deleted'})


@csrf_exempt
@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)

    if user:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response({"token": token.key, "user": user_data})

    return Response({"error": "Invalid credentials"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({"message": "Logged out successfully!"})


# ================= FILE UPLOAD =================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def file_upload(request):
    if 'file' not in request.FILES:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    uploaded_file = request.FILES['file']
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_file_name = f"{request.user.id}_{timestamp}_{uploaded_file.name}"
    file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', unique_file_name)

    default_storage.save(file_path, ContentFile(uploaded_file.read()))

    user_file = UserFile.objects.create(
        user=request.user,
        file_name=unique_file_name,
        file_path=file_path,
    )

    try:
        extracted_text = extract_text(file_path)
        
        # Save the extracted text in the database
        user_file.extracted_text = extracted_text
        user_file.save()

        summarized = summarize_text(extracted_text, 2)

        return JsonResponse({
            "message": "File uploaded successfully",
            "file_url": f"{settings.MEDIA_URL}uploads/{unique_file_name}",
            "summarized_text": summarized,
            "extracted_text": extracted_text,
            "file_id": user_file.id
        }, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_history(request):
    user_files = UserFile.objects.filter(user=request.user).order_by('-uploaded_at')

    data = [{
        "id": f.id,
        "file_name": f.file_name,
        "file_url": f"{settings.MEDIA_URL}uploads/{f.file_name}",
        "uploaded_at": f.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")
    } for f in user_files]

    return JsonResponse({"file_history": data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_details(request, file_id):
    try:
        user_file = get_object_or_404(UserFile, id=file_id, user=request.user)

        # Extract on-the-fly if missing (for legacy entries)
        if not user_file.extracted_text:
            if os.path.exists(user_file.file_path):
                user_file.extracted_text = extract_text(user_file.file_path)
                user_file.save()

        summarized = ""
        if user_file.extracted_text:
            try:
                summarized = summarize_text(user_file.extracted_text, 2)
            except Exception as e:
                print(f"Error summarizing file {file_id}: {e}")

        return JsonResponse({
            "id": user_file.id,
            "file_name": user_file.file_name,
            "file_url": f"{settings.MEDIA_URL}uploads/{user_file.file_name}",
            "uploaded_at": user_file.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
            "extracted_text": user_file.extracted_text or "",
            "summarized_text": summarized
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cleanup_files(request):
    user_files = UserFile.objects.filter(user=request.user)

    for f in user_files:
        if os.path.exists(f.file_path):
            os.remove(f.file_path)
        f.delete()

    return JsonResponse({"message": "Files cleaned successfully"})


# ================= GEMINI CHAT =================

API_KEY = "YOUR_API_KEY"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"


@api_view(["POST"])
def chat(request):
    prompt = request.data.get("prompt")

    if not prompt:
        return Response({"error": "Prompt required"}, status=400)

    response = requests.post(GEMINI_URL, json={
        "contents": [{"parts": [{"text": prompt}]}]
    })

    data = response.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return Response({"response": text})
    except:
        return Response({"error": "Invalid response"}, status=500)


# ================= NER =================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getners(request):
    ners = extract_legal_entities(request.data.get('text'))

    if not ners:
        return Response({"error": "No entities found"}, status=400)

    return Response({"entities": ners})


# ================= SETTINGS API (NEW) =================

user_settings_data = {}

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    user_id = request.user.id

    if request.method == 'GET':
        return Response(user_settings_data.get(user_id, {
            "theme": "light",
            "language": "english",
            "notifications": True,
            "autoSave": True
        }))

    elif request.method == 'POST':
        user_settings_data[user_id] = request.data
        return Response({"message": "Settings saved successfully"})


# ================= PASSWORD RESET APIs =================

@api_view(['POST'])
def request_password_reset_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=400)
    
    user = User.objects.filter(email=email).first()
    if not user:
        # Secure response: return success but don't leak account existence
        return Response({"message": "If a user with this email exists, a 6-digit OTP has been sent."})
    
    import random
    otp = f"{random.randint(100000, 999999)}"
    
    # Save the OTP in the database
    PasswordResetOTP.objects.create(user=user, otp=otp)
    
    # Send the email
    from django.core.mail import send_mail
    from django.conf import settings as django_settings
    
    subject = "Your LexBot Password Reset OTP"
    message = f"Hello {user.username},\n\nYour password reset verification code is: {otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email."
    from_email = getattr(django_settings, 'DEFAULT_FROM_EMAIL', 'support@legify.com')
    
    try:
        send_mail(subject, message, from_email, [email], fail_silently=False)
    except Exception as e:
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)
        
    response_data = {"message": "If a user with this email exists, a 6-digit OTP has been sent."}
    
    # Return the OTP directly in response during DEBUG/testing mode
    if django_settings.DEBUG:
        response_data["otp"] = otp
        
    return Response(response_data)


@api_view(['POST'])
def reset_password_with_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('password')
    
    if not email or not otp or not new_password:
        return Response({"error": "Email, OTP, and new password are required"}, status=400)
        
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User with this email does not exist"}, status=400)
        
    from django.utils import timezone
    from datetime import timedelta
    
    # Find active OTP in last 10 minutes
    ten_minutes_ago = timezone.now() - timedelta(minutes=10)
    otp_record = PasswordResetOTP.objects.filter(
        user=user,
        otp=otp,
        is_verified=False,
        created_at__gte=ten_minutes_ago
    ).order_by('-created_at').first()
    
    if not otp_record:
        return Response({"error": "Invalid or expired OTP"}, status=400)
        
    # Mark OTP as verified
    otp_record.is_verified = True
    otp_record.save()
    
    # Invalidate other OTPs
    PasswordResetOTP.objects.filter(user=user, is_verified=False).update(is_verified=True)
    
    # Reset password
    user.set_password(new_password)
    user.save()
    
    return Response({"message": "Password has been reset successfully!"})