from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from utils.http_responses import success_response, error_response
from utils.permissions import IsAdmin
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .services.user_service import authenticate_user, approve_user, toggle_user_status
from .models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from .models import User, PasswordResetOTP
import random
import string

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


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    if not email:
        return error_response("Email is required")
        
    user = User.objects.filter(email=email).first()
    if user:
        # Generate 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        # Save hashed OTP to database
        otp_record = PasswordResetOTP(user=user)
        otp_record.set_otp(otp_code)
        otp_record.save()
        
        # Send HTML OTP email
        from django.template.loader import render_to_string
        from django.utils.html import strip_tags
        from django.core.mail import EmailMultiAlternatives

        context = {
            'otp_code': otp_code,
            'user_name': user.name,
            'expiry_minutes': 10
        }
        
        html_content = f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 40px auto; padding: 40px; border-radius: 24px; background-color: #ffffff; shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; border-radius: 12px; margin-bottom: 12px;">
                            <span style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; font-family: sans-serif;">ProGarage</span>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; tracking: 0.1em; margin: 0;">Security Portal</p>
                    </div>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 32px;">
                        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Verify your identity</h2>
                        <p style="margin-bottom: 24px;">Hello <strong>{user.name}</strong>,</p>
                        <p style="margin-bottom: 24px;">We received a request to reset your password. Use the verification code below to proceed with your request:</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <div style="display: inline-block; padding: 20px 40px; font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #4f46e5; background-color: #f5f3ff; border: 2px solid #e0e7ff; border-radius: 16px;">
                                {otp_code}
                            </div>
                            <p style="font-size: 13px; color: #ef4444; margin-top: 16px; font-weight: 600;">Expiring in {10} minutes</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #4b5563;">If you didn't request this, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                        <p style="font-size: 12px; color: #9ca3af;">
                            &copy; 2026 ProGarage System. All rights reserved.<br>
                            Professional Vehicle & Customer Management
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        text_content = strip_tags(html_content)
        
        msg = EmailMultiAlternatives(
            "Your ProGarage Verification Code",
            text_content,
            "noreply@progarage.com",
            [email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        return success_response(None, "If an account exists with this email, you will receive a 6-digit OTP.")
    
    return success_response(None, "If an account exists with this email, you will receive a 6-digit OTP.")

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp')
    
    if not all([email, otp_code]):
        return error_response("Email and OTP are required")
        
    user = User.objects.filter(email=email).first()
    if not user:
        return error_response("Invalid request")
        
    otp_records = PasswordResetOTP.objects.filter(
        user=user, 
        is_used=False
    )
    
    valid_otp = None
    for record in otp_records:
        if record.check_otp(otp_code) and not record.is_expired():
            valid_otp = record
            break
    
    if not valid_otp:
        return error_response("Invalid or expired OTP")
        
    return success_response(None, "OTP verified successfully")

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp')
    new_password = request.data.get('password')
    
    if not all([email, otp_code, new_password]):
        return error_response("All fields are required")
        
    user = User.objects.filter(email=email).first()
    if not user:
        return error_response("Invalid request")
        
    otp_records = PasswordResetOTP.objects.filter(
        user=user, 
        is_used=False
    )
    
    valid_otp = None
    for record in otp_records:
        if record.check_otp(otp_code) and not record.is_expired():
            valid_otp = record
            break
    
    if not valid_otp:
        return error_response("Invalid or expired OTP")
        
    # Mark OTP as used
    valid_otp.is_used = True
    valid_otp.save()
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    return success_response(None, "Password has been reset successfully")
