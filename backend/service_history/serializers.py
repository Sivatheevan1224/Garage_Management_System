from rest_framework import serializers
from .models import Customer, Vehicle, Technician, Service, Invoice, Payment, BillingSetting


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'nic', 'email', 'phone', 'address', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'nic': {'required': False, 'allow_blank': True, 'allow_null': True},
            'address': {'required': False, 'allow_blank': True, 'allow_null': True}
        }
    
    def validate_email(self, value):
        # Check if email is unique, excluding current instance
        if self.instance and self.instance.email == value:
            return value
        if Customer.objects.filter(email=value).exists():
            raise serializers.ValidationError("A customer with this email already exists.")
        return value
    
    def validate_nic(self, value):
        # Check if NIC is unique, excluding current instance
        if not value:  # Allow empty NIC
            return value
        if self.instance and self.instance.nic == value:
            return value
        if Customer.objects.filter(nic=value).exists():
            raise serializers.ValidationError("A customer with this NIC already exists.")
        return value


class VehicleSerializer(serializers.ModelSerializer):
    customerId = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), 
        source='customer'
    )
    fuelType = serializers.CharField(source='fuel_type', required=False, default='Petrol')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = ['id', 'customerId', 'brand', 'model', 'year', 'number', 'color', 'mileage', 'fuelType', 'createdAt']
        read_only_fields = ['id', 'createdAt']
        extra_kwargs = {
            'color': {'required': False, 'allow_blank': True, 'allow_null': True},
            'mileage': {'required': False}
        }
    
    def validate_number(self, value):
        # Check if vehicle number is unique, excluding current instance
        if self.instance and self.instance.number == value:
            return value
        if Vehicle.objects.filter(number=value).exists():
            raise serializers.ValidationError("A vehicle with this number already exists.")
        return value




class TechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technician
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    vehicleId = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all(), source='vehicle')
    technicianId = serializers.PrimaryKeyRelatedField(queryset=Technician.objects.all(), source='technician', allow_null=True, required=False)
    estimatedHours = serializers.DecimalField(source='estimated_hours', max_digits=5, decimal_places=2, required=False, default=0)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'vehicleId', 'type', 'description', 'cost', 'date', 'status', 'technicianId', 'estimatedHours', 'createdAt']
        read_only_fields = ['id', 'createdAt']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'status': {'required': False, 'default': 'Pending'},
            'cost': {'required': False, 'default': 0}
        }



class InvoiceSerializer(serializers.ModelSerializer):
    invoiceNumber = serializers.CharField(source='invoice_number', required=False)
    serviceId = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(), source='service')
    customerId = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), source='customer', required=False)
    vehicleId = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all(), source='vehicle', required=False)
    dateCreated = serializers.DateTimeField(source='date_created', read_only=True)
    dueDate = serializers.DateTimeField(source='due_date', required=False)
    lineItems = serializers.JSONField(source='line_items', required=False, default=list)
    taxRate = serializers.DecimalField(source='tax_rate', max_digits=5, decimal_places=4, required=False)
    taxAmount = serializers.DecimalField(source='tax_amount', max_digits=10, decimal_places=2, required=False)
    paidAmount = serializers.DecimalField(source='paid_amount', max_digits=10, decimal_places=2, required=False, default=0)
    balanceDue = serializers.DecimalField(source='balance_due', max_digits=10, decimal_places=2, required=False)
    paymentTerms = serializers.CharField(source='payment_terms', required=False)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoiceNumber', 'serviceId', 'customerId', 'vehicleId', 
            'status', 'dateCreated', 'dueDate', 'lineItems', 'subtotal', 
            'taxRate', 'taxAmount', 'discount', 'total', 'paidAmount', 
            'balanceDue', 'paymentTerms', 'notes'
        ]
        read_only_fields = ['dateCreated']
        extra_kwargs = {
            'id': {'required': False},
            'status': {'required': False, 'default': 'draft'},
            'subtotal': {'required': False, 'default': 0},
            'discount': {'required': False, 'default': 0},
            'total': {'required': False, 'default': 0},
            'notes': {'required': False, 'allow_blank': True, 'allow_null': True}
        }
    
    def create(self, validated_data):
        from datetime import timedelta
        from decimal import Decimal
        from django.utils import timezone
        import uuid
        
        # Generate unique ID
        invoice_id = f"inv-{uuid.uuid4().hex[:8]}"
        
        # Get service and derive customer/vehicle
        service = validated_data['service']
        validated_data['customer'] = validated_data.get('customer', service.vehicle.customer)
        validated_data['vehicle'] = validated_data.get('vehicle', service.vehicle)
        
        # Generate invoice number if not provided
        if 'invoice_number' not in validated_data:
            from .models import BillingSetting
            settings = BillingSetting.objects.first()
            if settings:
                validated_data['invoice_number'] = f"{settings.invoice_prefix}-{settings.next_invoice_number:04d}"
                settings.next_invoice_number += 1
                settings.save()
            else:
                validated_data['invoice_number'] = f"INV-{Invoice.objects.count() + 1:04d}"
        
        # Set due date if not provided (use timezone-aware datetime)
        if 'due_date' not in validated_data:
            validated_data['due_date'] = timezone.now() + timedelta(days=30)
        
        # Get billing settings for defaults
        from .models import BillingSetting
        settings = BillingSetting.objects.first()
        if settings:
            if 'tax_rate' not in validated_data:
                validated_data['tax_rate'] = settings.tax_rate
            if 'payment_terms' not in validated_data:
                validated_data['payment_terms'] = settings.payment_terms
        
        # Calculate amounts
        subtotal = Decimal(str(validated_data.get('subtotal', 0)))
        discount = Decimal(str(validated_data.get('discount', 0)))
        tax_rate = Decimal(str(validated_data.get('tax_rate', 0.10)))
        
        tax_amount = (subtotal - discount) * tax_rate
        total = subtotal - discount + tax_amount
        
        validated_data['tax_amount'] = tax_amount
        validated_data['total'] = total
        validated_data['balance_due'] = total - Decimal(str(validated_data.get('paid_amount', 0)))
        
        # Explicitly set the id
        validated_data['id'] = invoice_id
        
        return super().create(validated_data)



class PaymentSerializer(serializers.ModelSerializer):
    invoiceId = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all(), source='invoice')
    
    class Meta:
        model = Payment
        fields = ['id', 'invoiceId', 'amount', 'method', 'date', 'reference', 'notes']







class BillingSettingSerializer(serializers.ModelSerializer):
    taxRate = serializers.DecimalField(source='tax_rate', max_digits=5, decimal_places=4)
    invoicePrefix = serializers.CharField(source='invoice_prefix')
    nextInvoiceNumber = serializers.IntegerField(source='next_invoice_number')
    paymentTerms = serializers.CharField(source='payment_terms')
    companyName = serializers.CharField(source='company_name')
    companyAddress = serializers.CharField(source='company_address')
    companyCity = serializers.CharField(source='company_city')
    companyPhone = serializers.CharField(source='company_phone')
    companyEmail = serializers.EmailField(source='company_email')

    class Meta:
        model = BillingSetting
        fields = [
            'taxRate', 'invoicePrefix', 'nextInvoiceNumber', 'paymentTerms',
            'companyName', 'companyAddress', 'companyCity', 'companyPhone', 'companyEmail'
        ]

