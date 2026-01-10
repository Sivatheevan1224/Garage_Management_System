from django.urls import path
from . import views

urlpatterns = [
    # Customer endpoints
    path('customers/', views.customer_list),
    path('customers/<str:pk>/', views.customer_detail),
    
    # Vehicle endpoints
    path('vehicles/', views.vehicle_list),
    path('vehicles/<str:pk>/', views.vehicle_detail),

    
    # Technician endpoints
    path('technicians/', views.technician_list),
    path('technicians/<str:pk>/', views.technician_detail),
    
    # Service endpoints
    path('services/', views.service_record_list),
    path('services/<str:pk>/', views.service_record_detail),
    path('services/<str:pk>/status/', views.update_service_record_status),
    
    # Invoice & Payment endpoints
    path('invoices/', views.invoice_list),
    path('invoices/<str:pk>/', views.invoice_detail),
    path('payments/', views.payment_list),
    path('payments/<str:pk>/', views.payment_detail),

    
    # Billing Settings
    path('billing-settings/current/', views.get_billing_settings),
]


