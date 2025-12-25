from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
import json
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from django.views.decorators.csrf import csrf_exempt
import requests
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from .utilities.text_extractor import extract_text
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from datetime import  datetime
from .models import UserFile
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .utilities.text_summarizer import  summarize_text
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from dotenv import load_dotenv
from .utilities.ncr import extract_legal_entities
from .utilities.text_summarizer import summarize_text
load_dotenv()

# Create your views here.

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username" , "email"]




@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def protected_view(request):
    """Example protected API endpoint."""
    return Response({"message": "This is a protected view!"})

# Create User
@csrf_exempt
@api_view(['POST'])
def create_user(request):
    if request.method == 'POST':
        data = request.data;
        print(data);
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        return JsonResponse({'message': 'User created', 'id': user.id})

# Get All Users
def get_users(request):
    users = User.objects.all().values('id', 'username', 'email', 'is_staff', 'is_active', 'date_joined')
    return JsonResponse(list(users), safe=False)

# Get Single User by ID
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

# Update User
def update_user(request, id):
    if request.method == 'PUT':
        data = json.loads(request.body)
        user = get_object_or_404(User, id=id)
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        if 'password' in data:
            user.set_password(data['password'])  # Hashing the new password
        user.save()
        return JsonResponse({'message': 'User updated'})

# Delete User
def delete_user(request, id):
    if request.method == 'DELETE':
        user = get_object_or_404(User, id=id)
        user.delete()
        return JsonResponse({'message': 'User deleted'})



@csrf_exempt
@api_view(['POST'])
def user_login(request):
    """API endpoint for user login."""
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response({"token": token.key ,"user":user_data})
    else:
        return Response({"error": "Invalid credentials"}, status=400)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])  # Ensure user is authenticated
# def user_logout(request):
#     """API endpoint for user logout."""
#     logout(request)
#     return Response({"message": "Logged out successfully!"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    print(request)
    """API endpoint for user logout."""
    try:
        # Delete the token so it's no longer valid
        request.user.auth_token.delete()
    except:
        pass
    
    return Response({"message": "Logged out successfully!"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure user is authenticated
@parser_classes([MultiPartParser])  # Allow file uploads
def file_upload(request):
    print(request.FILES)
    if 'file' not in request.FILES:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    uploaded_file = request.FILES['file']
    
    # Generate a unique file name: userid_timestamp_filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_file_name = f"{request.user.id}_{timestamp}_{uploaded_file.name}"
    file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', unique_file_name)

    # Save the file
    path = default_storage.save(file_path, ContentFile(uploaded_file.read()))

    # Save file metadata in the database
    user_file = UserFile.objects.create(
        user=request.user,
        file_name=unique_file_name,
        file_path=file_path,
    )

    try:
        extracted_text = extract_text(file_path)
        legal_res = summarize_text(extracted_text,2)

        response_data = {
            "message": "File uploaded and text extracted successfully!",
            "file_url": f"{settings.MEDIA_URL}uploads/{unique_file_name}",
            "summarized_text": legal_res,
            "extracted_text": extracted_text,
            "file_id": user_file.id  # Return the file ID for future reference
        }
        return JsonResponse(response_data, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Error extracting text: {str(e)}"}, status=500)
    
@api_view(['GET'])  # Use Django REST Framework
@permission_classes([IsAuthenticated])  # Ensure user is authenticated
def file_history(request):
    """Fetch the file history for the logged-in user."""
    
    user_files = UserFile.objects.filter(user=request.user).order_by('-uploaded_at')

    file_history = [
        {
            "id": file.id,
            "file_name": file.file_name,
            "file_url": f"{settings.MEDIA_URL}{file.file_path}",
            "uploaded_at": file.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for file in user_files
    ]
    
    return JsonResponse({"file_history": file_history}, status=200)


@csrf_exempt
@api_view(['DELETE'])  
@permission_classes([IsAuthenticated])  
def cleanup_files(request):
    """Delete all files and database entries for the logged-in user."""
    
    # Debug: Check user authentication
    print(f"Request User: {request.user}")  
    print(f"Is Authenticated: {request.user.is_authenticated}")  

    if not request.user or request.user.is_anonymous:
        return JsonResponse({"error": "Authentication required!"}, status=401)

    user_files = UserFile.objects.filter(user=request.user)
    
    for user_file in user_files:
        file_path = user_file.file_path  
        if file_path and os.path.exists(file_path):
            os.remove(file_path)  
        user_file.delete()  

    return JsonResponse({"message": "Files cleaned up successfully!"}, status=200)
import os
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("API")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

@api_view(["POST"])
def chat(request):
    try:
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "Prompt is required"}, status=400)

        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{"parts": [{"text": prompt + " in a concise manner in 3 to 4 lines and simple for understanding"}]}]
        }

        response = requests.post(GEMINI_URL, headers=headers, json=data)

        response_data = response.json()
        
        print("Gemini API Response:", response_data)  # ✅ Debugging

        # ✅ Ensure response_data contains 'candidates' instead of 'contents'
        if "candidates" in response_data and len(response_data["candidates"]) > 0:
            candidate = response_data["candidates"][0]

            if "content" in candidate and "parts" in candidate["content"] and len(candidate["content"]["parts"]) > 0:
                response_text = candidate["content"]["parts"][0]["text"]
                return Response({"response": response_text}, status=200)

        return Response({"error": "Invalid API response structure"}, status=500)

    except Exception as e:
        print("Exception:", str(e))  # ✅ Print error message
        print(traceback.format_exc())  # ✅ Print full error traceback
        return Response({"error": str(e)}, status=500)
    


@csrf_exempt
@api_view(['POST'])  
@permission_classes([IsAuthenticated])  
def getners(request):
    # Extract NERs from the input text
    ners = extract_legal_entities(request.data.get('text'))
    
    try:
        # Check if ners is valid
        if not ners:
            return Response({"error": "No entities extracted from text"}, status=400)

        # Convert the ners dict to a JSON string for the prompt
        prompt = json.dumps(ners)
        if not prompt:
            return Response({"error": "Prompt is required"}, status=400)

        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt + " filter this json out as per the name entity recognition standards like dont keep unnecessary or non-matching entities for the keys and return it in same format"
                        }
                    ]
                }
            ]
        }

        # Make the API request to Gemini
        response = requests.post(GEMINI_URL, headers=headers, json=data)

        # Check if the request was successful
        response.raise_for_status()  # Raises an HTTPError for bad responses

        print(response)
        response_data = response.json()
        
        print("Gemini API Response:", response_data)  # Debugging

        # Validate and extract the response
        if "candidates" in response_data and len(response_data["candidates"]) > 0:
            candidate = response_data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"] and len(candidate["content"]["parts"]) > 0:
                response_text = candidate["content"]["parts"][0]["text"]
                return Response({"response": response_text}, status=200)

        return Response({"error": "Invalid API response structure"}, status=500)

    except requests.exceptions.RequestException as e:
        print("Request Exception:", str(e))
        print(traceback.format_exc())
        return Response({"error": f"API request failed: {str(e)}"}, status=500)
    except Exception as e:
        print("Exception:", str(e))
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)
    

