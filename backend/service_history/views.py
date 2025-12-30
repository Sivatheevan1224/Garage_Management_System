from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import bcrypt
import uuid

from .models import Customer, Vehicle, Technician, Service, Invoice, Payment, User, BillingSetting
from .serializers import (
    CustomerSerializer, VehicleSerializer, TechnicianSerializer,
    ServiceSerializer, InvoiceSerializer, PaymentSerializer,
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    BillingSettingSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'id' not in data or not data['id']:
            data['id'] = str(uuid.uuid4())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'id' not in data or not data['id']:
            data['id'] = str(uuid.uuid4())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        customer_id = request.query_params.get('customer_id')
        if customer_id:
            vehicles = self.queryset.filter(customer_id=customer_id)
            serializer = self.get_serializer(vehicles, many=True)
            return Response(serializer.data)
        return Response({'error': 'customer_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)


class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'id' not in data or not data['id']:
            data['id'] = str(uuid.uuid4())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'id' not in data or not data['id']:
            data['id'] = str(uuid.uuid4())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        service = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            service.status = new_status
            service.save()
            return Response({'status': 'success', 'new_status': new_status})
        return Response({'error': 'status field required'}, status=status.HTTP_400_BAD_REQUEST)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'id' not in data or not data['id']:
            data['id'] = str(uuid.uuid4())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'id' not in data or not data['id']:
            data['id'] = str(uuid.uuid4())
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Update invoice paid amount
        payment = serializer.instance
        invoice = payment.invoice
        invoice.paid_amount += payment.amount
        invoice.balance_due = invoice.total - invoice.paid_amount
        if invoice.balance_due <= 0:
            invoice.status = 'paid'
        invoice.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_invoice(self, request):
        invoice_id = request.query_params.get('invoice_id')
        if invoice_id:
            payments = self.queryset.filter(invoice_id=invoice_id)
            serializer = self.get_serializer(payments, many=True)
            return Response(serializer.data)
        return Response({'error': 'invoice_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Hash password with bcrypt
            password = serializer.validated_data['password']
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            # Create user
            user = User.objects.create(
                id=str(uuid.uuid4()),
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                password=hashed.decode('utf-8'),
                role=serializer.validated_data.get('role', 'staff'),
                is_approved=False,  # Requires admin approval
                is_active=True
            )
            
            return Response({
                'success': True,
                'message': 'Registration successful. Awaiting admin approval.',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(email=email)
                
                # Verify password
                if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                    # Check if approved
                    if not user.is_approved:
                        return Response({
                            'success': False,
                            'message': 'Your account is pending admin approval.'
                        }, status=status.HTTP_403_FORBIDDEN)
                    
                    # Check if active
                    if not user.is_active:
                        return Response({
                            'success': False,
                            'message': 'Your account has been deactivated.'
                        }, status=status.HTTP_403_FORBIDDEN)
                    
                    # Login successful
                    return Response({
                        'success': True,
                        'user': {
                            'id': user.id,
                            'name': user.name,
                            'email': user.email,
                            'role': user.role
                        }
                    })
                else:
                    return Response({
                        'success': False,
                        'message': 'Invalid credentials'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                    
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get all pending staff registrations (admin only)"""
        pending_users = User.objects.filter(role='staff', is_approved=False)
        serializer = self.get_serializer(pending_users, many=True)
        return Response({'pending_users': serializer.data})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a staff member (admin only)"""
        user = self.get_object()
        admin_id = request.data.get('admin_id', 'admin-001')
        
        user.is_approved = True
        user.approved_at = timezone.now()
        user.approved_by = admin_id
        user.save()
        
        return Response({
            'success': True,
            'message': 'Staff member approved successfully'
        })

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user (admin only)"""
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({
            'success': True,
            'message': 'User deactivated successfully'
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user (admin only)"""
        user = self.get_object()
        user.is_active = True
        user.save()
        
        return Response({
            'success': True,
            'message': 'User activated successfully'
        })


class BillingSettingViewSet(viewsets.ModelViewSet):
    queryset = BillingSetting.objects.all()
    serializer_class = BillingSettingSerializer

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current billing settings (should only be one record)"""
        settings = BillingSetting.objects.first()
        if settings:
            serializer = self.get_serializer(settings)
            return Response(serializer.data)
        return Response({'error': 'No billing settings found'}, status=status.HTTP_404_NOT_FOUND)
