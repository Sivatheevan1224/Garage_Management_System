from django.contrib.auth import authenticate
from django.utils import timezone
from accounts.models import User

# If SimpleJWT is intended to be used:
# from rest_framework_simplejwt.tokens import RefreshToken

def authenticate_user(email, password):
    user = authenticate(email=email, password=password)

    if user is None:
        return {"error": "Invalid credentials", "status": 401}
    
    if not user.is_active:
        return {"error": "Your account has been deactivated.", "status": 403}
        
    if not user.is_approved:
        return {"error": "Your account is pending admin approval.", "status": 403}

    # If using SimpleJWT (as per user example):
    # refresh = RefreshToken.for_user(user)
    # return {
    #     "access": str(refresh.access_token),
    #     "refresh": str(refresh),
    #     "user": {
    #         "id": user.id,
    #         "email": user.email,
    #         "name": user.name,
    #         "role": user.role
    #     }
    # }
    
    # Fallback to session/data response if JWT is not yet configured
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        },
        "user_obj": user
    }


def approve_user(user_id, admin_user):
    try:
        user = User.objects.get(id=user_id)
        user.is_approved = True
        user.approved_at = timezone.now()
        user.approved_by = admin_user.email
        user.save()
        return user
    except User.DoesNotExist:
        return None

def toggle_user_status(user_id, is_active):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = is_active
        user.save()
        return user
    except User.DoesNotExist:
        return None
