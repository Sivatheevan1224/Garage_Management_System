"""
==============================================================
ACCOUNTS MODELS
==============================================================
This file defines the custom User model for authentication.

The User model extends Django's AbstractBaseUser to:
- Use email for login instead of username
- Add custom fields like role, is_approved
- Support two-step approval process for new staff
- Implement password reset with OTP

Key concepts:
- is_approved: False until admin approves (prevents unauthorized access)
- role: Can be 'admin' (full access) or 'staff' (limited access)
- is_active: Can be False to disable account without deleting
==============================================================
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    # Custom manager to use email for login instead of username
    def create_user(self, email, password=None, **extra_fields):
        # Validate email is provided
        if not email:
            raise ValueError('The Email field must be set')
        # Normalize email (lowercase)
        email = self.normalize_email(email)
        # Create user instance with provided fields
        user = self.model(email=email, **extra_fields)
        # Hash the password for security
        user.set_password(password)
        # Save to database
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create an admin superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_approved', True)  # Auto-approve superusers
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    # Custom user model: email login, roles (admin/staff), approval system
    # Role choices - determines what user can do
    ROLE_CHOICES = [
        ('admin', 'Admin'),      # Full system access
        ('staff', 'Staff'),      # Limited to customer/vehicle/service management
    ]

    email = models.EmailField(unique=True)  # Use email for login, must be unique
    name = models.CharField(max_length=100)  # User's full name
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')  # User role
    
    # Two-step approval process fields
    is_approved = models.BooleanField(default=False)  # False until admin approves
    is_active = models.BooleanField(default=True)  # Can be False to disable account
    is_staff = models.BooleanField(default=False)  # Django admin access
    
    created_at = models.DateTimeField(auto_now_add=True)  # When account was created
    approved_at = models.DateTimeField(null=True, blank=True)  # When admin approved
    approved_by = models.CharField(max_length=50, null=True, blank=True)  # Which admin approved

    # Use custom manager
    objects = UserManager()

    class Meta:
        db_table = 'users'

    # Tell Django to use email for authentication instead of username
    USERNAME_FIELD = 'email'
    # Required fields when creating user from command line
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"{self.email} ({self.role})"

class PasswordResetOTP(models.Model):
    # Store OTP for password reset, valid for 10 minutes
    # Links to User
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Store hashed OTP for security (never store plain text)
    otp_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)  # When OTP was created
    is_used = models.BooleanField(default=False)  # True after OTP is used (can't reuse)

    def set_otp(self, raw_otp):
        """Hash and store the OTP"""
        from django.contrib.auth.hashers import make_password
        self.otp_hash = make_password(raw_otp)

    def check_otp(self, raw_otp):
        """Verify provided OTP matches stored hash"""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_otp, self.otp_hash)

    def is_expired(self):
        """Check if OTP is older than 10 minutes"""
        from django.utils import timezone
        import datetime
        return timezone.now() > self.created_at + datetime.timedelta(minutes=10)

    class Meta:
        db_table = 'password_reset_otps'
