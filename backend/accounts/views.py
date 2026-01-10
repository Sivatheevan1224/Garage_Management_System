from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from utils.http_responses import success_response, error_response
from utils.permissions import IsAdmin
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .services.user_service import authenticate_user, approve_user, toggle_user_status
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return success_response(None, "User registration successful. Awaiting admin approval.")
    return error_response(serializer.errors)

from django.middleware.csrf import get_token

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        result = authenticate_user(
            serializer.validated_data['email'],
            serializer.validated_data['password']
        )
        
        if "error" in result:
            return error_response(result["error"], status_code=result.get("status", 400))
            
        # Log the user into the session
        login(request, result["user_obj"])
        
        # Force CSRF token to be generated and set in cookie
        get_token(request)

        
        # Remove the user_obj from response data
        response_data = result.copy()
        del response_data["user_obj"]
        
        return success_response(response_data, "Login successful")
    
    return error_response(serializer.errors)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_pending_users(request):
    pending_users = User.objects.filter(role='staff', is_approved=False)
    serializer = UserSerializer(pending_users, many=True)
    return success_response(serializer.data, "Pending users retrieved")

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_staff(request, user_id):
    user = approve_user(user_id, request.user)
    if user:
        return success_response(None, f"User {user.email} approved")
    return error_response("User not found", status_code=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def deactivate_user(request, user_id):
    user = toggle_user_status(user_id, False)
    if user:
        return success_response(None, f"User {user.email} deactivated")
    return error_response("User not found", status_code=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def activate_user(request, user_id):
    user = toggle_user_status(user_id, True)
    if user:
        return success_response(None, f"User {user.email} activated")
    return error_response("User not found", status_code=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return success_response(serializer.data, "Users retrieved")

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return error_response("User not found", status_code=404)
        
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return success_response(serializer.data)
        
    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data, "User updated")
        return error_response(serializer.errors)
        
    elif request.method == 'DELETE':
        user.delete()
        return success_response(None, "User deleted")

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf(request):
    token = get_token(request)
    return success_response({"csrfToken": token}, "CSRF token retrieved")


