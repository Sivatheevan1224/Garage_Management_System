from rest_framework import serializers
from .models import Customer, Vehicle, Technician, Service, Invoice, Payment, User, BillingSetting


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'nic', 'email', 'phone', 'address', 'created_at']


class VehicleSerializer(serializers.ModelSerializer):
    customerId = serializers.CharField(source='customer.id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = ['id', 'customerId', 'brand', 'model', 'year', 'number', 'color', 'mileage', 'createdAt']


class TechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technician
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    vehicleId = serializers.CharField(source='vehicle.id', read_only=True)
    technicianId = serializers.CharField(source='technician.id', read_only=True, allow_null=True)
    estimatedHours = serializers.DecimalField(source='estimated_hours', max_digits=5, decimal_places=2)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'vehicleId', 'type', 'description', 'cost', 'date', 'status', 'technicianId', 'estimatedHours', 'createdAt']


class InvoiceSerializer(serializers.ModelSerializer):
    invoiceNumber = serializers.CharField(source='invoice_number')
    serviceId = serializers.CharField(source='service.id', read_only=True)
    customerId = serializers.CharField(source='customer.id', read_only=True)
    vehicleId = serializers.CharField(source='vehicle.id', read_only=True)
    dateCreated = serializers.DateTimeField(source='date_created', read_only=True)
    dueDate = serializers.DateTimeField(source='due_date')
    lineItems = serializers.JSONField(source='line_items')
    taxRate = serializers.DecimalField(source='tax_rate', max_digits=5, decimal_places=4)
    taxAmount = serializers.DecimalField(source='tax_amount', max_digits=10, decimal_places=2)
    paidAmount = serializers.DecimalField(source='paid_amount', max_digits=10, decimal_places=2)
    balancedue = serializers.DecimalField(source='balance_due', max_digits=10, decimal_places=2)
    paymentTerms = serializers.CharField(source='payment_terms')
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoiceNumber', 'serviceId', 'customerId', 'vehicleId', 
            'status', 'dateCreated', 'dueDate', 'lineItems', 'subtotal', 
            'taxRate', 'taxAmount', 'discount', 'total', 'paidAmount', 
            'balancedue', 'paymentTerms', 'notes'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    invoice_id = serializers.CharField(source='invoice.id', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'is_approved', 'is_active', 'created_at', 'approved_at']
        read_only_fields = ['id', 'created_at', 'approved_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class BillingSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingSetting
        fields = '__all__'
