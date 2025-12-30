from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'customers', views.CustomerViewSet)
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'technicians', views.TechnicianViewSet)
router.register(r'services', views.ServiceViewSet)
router.register(r'invoices', views.InvoiceViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'billing-settings', views.BillingSettingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
