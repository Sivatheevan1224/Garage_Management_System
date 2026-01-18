from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'is_approved', 'is_active', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        error_messages={
            'min_length': 'Password must be at least 8 characters long.',
            'required': 'Password is required.',
            'blank': 'Password cannot be blank.'
        }
    )
    email = serializers.EmailField(
        error_messages={
            'required': 'Email is required.',
            'invalid': 'Please enter a valid email address.',
            'blank': 'Email cannot be blank.'
        }
    )
    name = serializers.CharField(
        min_length=2,
        error_messages={
            'required': 'Name is required.',
            'min_length': 'Name must be at least 2 characters long.',
            'blank': 'Name cannot be blank.'
        }
    )

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'role']
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already registered.")
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'staff'),
            is_approved=False # Default to false for staff
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            'required': 'Email is required.',
            'invalid': 'Please enter a valid email address.',
            'blank': 'Email cannot be blank.'
        }
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'Password is required.',
            'blank': 'Password cannot be blank.'
        }
    )
