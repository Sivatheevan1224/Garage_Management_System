from django.urls import path
from .views import (
    register_user, login_user, get_pending_users, 
    approve_staff, deactivate_user, activate_user,
    list_users, user_detail, get_csrf
)



urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),
    path('pending-approvals/', get_pending_users),
    path('approve/<str:user_id>/', approve_staff),
    path('deactivate/<str:user_id>/', deactivate_user),
    path('activate/<str:user_id>/', activate_user),
    path('users/', list_users),
    path('users/<str:user_id>/', user_detail),
    path('get-csrf/', get_csrf),
]


