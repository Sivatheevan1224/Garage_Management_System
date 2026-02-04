"""
==============================================================
SERIALIZERS
==============================================================
Serializers convert between Python objects and JSON format.

They also validate data before saving:
- Check if email is unique
- Check if phone format is valid
- Check if required fields exist
- Handle data type conversions

This keeps validation logic separate from models.
==============================================================
"""

from rest_framework import serializers
from .models import Customer, Vehicle, Technician, Service, Invoice, Payment, BillingSetting
from decimal import Decimal
import uuid

class CustomerSerializer(serializers.ModelSerializer):
    # Validate and convert Customer data to/from JSON
    
    class Meta:
        model = Customer  # Link to Customer model
        fields = ['id', 'name', 'nic', 'email', 'phone', 'address', 'created_at']
        read_only_fields = ['id', 'created_at']  # These fields cannot be set by API
        extra_kwargs = {
            # NIC is optional - can be blank or null
            'nic': {'required': False, 'allow_blank': True, 'allow_null': True},
            # Address is optional
            'address': {'required': False, 'allow_blank': True, 'allow_null': True}
        }
    
    def validate_email(self, value):
        # Check if email already exists in database
        # If updating existing customer, skip if email hasn't changed
        if self.instance and self.instance.email == value:
            return value
        # Check if another customer already has this email
        if Customer.objects.filter(email=value).exists():
            raise serializers.ValidationError("A customer with this email already exists.")
        return value
    
    def validate_nic(self, value):
        # Check if NIC already exists in database
        if not value:  # NIC is optional
            return value
        # If updating, skip if NIC hasn't changed
        if self.instance and self.instance.nic == value:
            return value
        # Check for duplicate NIC
        if Customer.objects.filter(nic=value).exists():
            raise serializers.ValidationError("A customer with this NIC already exists.")
        return value


class VehicleSerializer(serializers.ModelSerializer):
    # Validate and convert Vehicle data, ensure registration number is unique
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
        if self.instance and self.instance.number == value:
            return value
        if Vehicle.objects.filter(number=value).exists():
            raise serializers.ValidationError("A vehicle with this number already exists.")
        return value


class TechnicianSerializer(serializers.ModelSerializer):
    # Technician info with workload (count of pending services)
    workload = serializers.SerializerMethodField()
    
    class Meta:
        model = Technician
        fields = ['id', 'name', 'specialization', 'phone', 'is_active', 'workload']

    def get_workload(self, obj):
        # Only count jobs that are not completed
        return obj.services.filter(status__in=['Pending', 'In Progress']).count()


class ServiceSerializer(serializers.ModelSerializer):
    # Service data with auto-invoice on advance payment received
    vehicleId = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all(), source='vehicle')
    technicianId = serializers.PrimaryKeyRelatedField(queryset=Technician.objects.all(), source='technician', allow_null=True, required=False)
    estimatedHours = serializers.DecimalField(source='estimated_hours', max_digits=5, decimal_places=2, required=False, default=0)
    advancePayment = serializers.DecimalField(source='advance_payment', max_digits=10, decimal_places=2, required=False, default=0)
    advancePaymentMethod = serializers.CharField(source='advance_payment_method', required=False, allow_blank=True, allow_null=True)
    taxIncluded = serializers.BooleanField(source='tax_included', required=False, default=False)
    remainingBalance = serializers.DecimalField(source='remaining_balance', max_digits=10, decimal_places=2, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'vehicleId', 'type', 'description', 'cost', 'taxIncluded', 'advancePayment', 'advancePaymentMethod', 'remainingBalance', 'date', 'status', 'technicianId', 'estimatedHours', 'createdAt']
        read_only_fields = ['id', 'createdAt']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'status': {'required': False, 'default': 'Pending'},
            'cost': {'required': False, 'default': 0}
        }
    
    def create(self, validated_data):
        # Let DB handle ID (auto-increment)
        cost = validated_data.get('cost', 0)
        advance = validated_data.get('advance_payment', 0)
        validated_data['remaining_balance'] = cost - advance
        
        instance = super().create(validated_data)
        
        if instance.advance_payment > 0:
            try:
                self._auto_generate_invoice(instance)
            except Exception as e:
                print(f"Error auto-generating invoice: {e}")
                
        return instance

    def _auto_generate_invoice(self, service):
        from .models import Invoice, Payment, BillingSetting
        from datetime import timedelta
        from django.utils import timezone

        if Invoice.objects.filter(service=service).exists():
            return Invoice.objects.filter(service=service).first()

        settings = BillingSetting.objects.first()
        tax_rate = settings.tax_rate if settings else Decimal('0.1000')
        prefix = settings.invoice_prefix if settings else "INV"
        
        # Generate unique invoice number by finding the highest existing number
        existing_invoices = Invoice.objects.filter(
            invoice_number__startswith=prefix
        ).order_by('-invoice_number').first()
        
        if existing_invoices:
            # Extract number from last invoice (e.g., "INV-1005" -> 1005)
            try:
                last_num = int(existing_invoices.invoice_number.split('-')[-1])
                next_num = last_num + 1
            except (ValueError, IndexError):
                next_num = 1001
        else:
            next_num = 1001
        
        invoice_number = f"{prefix}-{next_num}"

        cost = Decimal(str(service.cost))
        tax_included = service.tax_included

        if tax_included:
            total = cost
            subtotal = total / (1 + tax_rate)
            tax_amount = total - subtotal
        else:
            subtotal = cost
            tax_amount = subtotal * tax_rate
            total = subtotal + tax_amount

        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            service=service,
            customer=service.vehicle.customer,
            vehicle=service.vehicle,
            status='draft',
            due_date=timezone.now() + timedelta(days=30),
            line_items=[{
                "description": f"Service: {service.type}",
                "detail": service.description or "",
                "quantity": 1,
                "unitPrice": float(subtotal.quantize(Decimal("0.01"))),
                "total": float(subtotal.quantize(Decimal("0.01")))
            }],
            subtotal=subtotal.quantize(Decimal("0.01")),
            tax_rate=tax_rate,
            tax_amount=tax_amount.quantize(Decimal("0.01")),
            total=total.quantize(Decimal("0.01")),
            paid_amount=0,
            balance_due=total.quantize(Decimal("0.01")),
            payment_terms=settings.payment_terms if settings else 'Net 30'
        )

        if service.advance_payment > 0:
            Payment.objects.create(
                invoice=invoice,
                amount=service.advance_payment,
                method=service.advance_payment_method or 'cash',
                notes="Advance payment from Service record"
            )
            invoice.paid_amount = service.advance_payment
            invoice.balance_due = invoice.total - invoice.paid_amount
            invoice.save()
        
        return invoice
    
    def update(self, instance, validated_data):
        cost = validated_data.get('cost', instance.cost)
        advance = validated_data.get('advance_payment', instance.advance_payment)
        tax_included = validated_data.get('tax_included', instance.tax_included)
        
        validated_data['remaining_balance'] = cost - advance
        instance = super().update(instance, validated_data)

        new_status = validated_data.get('status', instance.status)

        try:
            if new_status == 'Completed' and not Invoice.objects.filter(service=instance).exists():
                self._auto_generate_invoice(instance)
                
            invoice = Invoice.objects.filter(service=instance).first()
            if invoice:
                tax_rate = invoice.tax_rate
                discount = invoice.discount
                current_cost = Decimal(str(cost))
                
                if tax_included:
                    total = current_cost
                    subtotal = total / (1 + tax_rate)
                    tax_amount = total - subtotal
                else:
                    subtotal = current_cost
                    tax_amount = (subtotal - discount) * tax_rate
                    total = subtotal - discount + tax_amount

                invoice.subtotal = subtotal.quantize(Decimal("0.01"))
                invoice.tax_amount = tax_amount.quantize(Decimal("0.01"))
                invoice.total = total.quantize(Decimal("0.01"))
                
                advance_payment_record = Payment.objects.filter(
                    invoice=invoice, 
                    notes="Advance payment from Service record"
                ).first()

                new_advance = Decimal(str(advance))
                payment_method = validated_data.get('advance_payment_method', instance.advance_payment_method) or 'cash'

                if advance_payment_record:
                    if new_advance > 0:
                        advance_payment_record.amount = new_advance
                        advance_payment_record.method = payment_method
                        advance_payment_record.save()
                    else:
                        advance_payment_record.delete()
                elif new_advance > 0:
                    Payment.objects.create(
                        invoice=invoice,
                        amount=new_advance,
                        method=payment_method,
                        notes="Advance payment from Service record"
                    )

                from django.db.models import Sum
                total_paid = Payment.objects.filter(invoice=invoice).aggregate(Sum('amount'))['amount__sum'] or 0
                invoice.paid_amount = total_paid
                invoice.balance_due = invoice.total - invoice.paid_amount
                invoice.save()
                
        except Exception as e:
            print(f"Sync Error: {e}")
            pass

        return instance


class InvoiceSerializer(serializers.ModelSerializer):
    # Invoice data with auto-calculation of tax, discount, and balance due
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
            'status': {'required': False, 'default': 'draft'},
            'subtotal': {'required': False, 'default': 0},
            'discount': {'required': False, 'default': 0},
            'total': {'required': False, 'default': 0},
            'notes': {'required': False, 'allow_blank': True, 'allow_null': True}
        }
    
    def create(self, validated_data):
        from datetime import timedelta
        from django.utils import timezone

        service = validated_data['service']
        validated_data['customer'] = validated_data.get('customer', service.vehicle.customer)
        validated_data['vehicle'] = validated_data.get('vehicle', service.vehicle)
        
        if validated_data.get('subtotal', 0) == 0:
            validated_data['subtotal'] = service.cost

        if not validated_data.get('line_items'):
            validated_data['line_items'] = [{
                "description": f"Service: {service.type}",
                "detail": service.description or "",
                "quantity": 1,
                "unitPrice": float(service.cost),
                "total": float(service.cost)
            }]

        if validated_data.get('paid_amount', 0) == 0:
            validated_data['paid_amount'] = service.advance_payment

        if 'invoice_number' not in validated_data:
            settings = BillingSetting.objects.first()
            prefix = settings.invoice_prefix if settings else "INV"
            
            # Generate unique invoice number by finding the highest existing number
            existing_invoices = Invoice.objects.filter(
                invoice_number__startswith=prefix
            ).order_by('-invoice_number').first()
            
            if existing_invoices:
                # Extract number from last invoice (e.g., "INV-1005" -> 1005)
                try:
                    last_num = int(existing_invoices.invoice_number.split('-')[-1])
                    next_num = last_num + 1
                except (ValueError, IndexError):
                    next_num = 1001
            else:
                next_num = 1001
            
            validated_data['invoice_number'] = f"{prefix}-{next_num}"
        
        if 'due_date' not in validated_data:
            validated_data['due_date'] = timezone.now() + timedelta(days=30)
        
        settings = BillingSetting.objects.first()
        if settings:
            if 'tax_rate' not in validated_data:
                validated_data['tax_rate'] = settings.tax_rate
            if 'payment_terms' not in validated_data:
                validated_data['payment_terms'] = settings.payment_terms
        
        subtotal = Decimal(str(validated_data.get('subtotal', 0)))
        discount = Decimal(str(validated_data.get('discount', 0)))
        tax_rate = Decimal(str(validated_data.get('tax_rate', 0.10)))
        
        if service and service.tax_included:
            total = Decimal(str(service.cost))
            if 'subtotal' not in validated_data or validated_data['subtotal'] == 0:
                calculated_subtotal = total / (1 + tax_rate)
                validated_data['subtotal'] = calculated_subtotal.quantize(Decimal("0.01"))
            tax_amount = total - validated_data['subtotal']
            validated_data['tax_amount'] = tax_amount.quantize(Decimal("0.01"))
            validated_data['total'] = (total - discount).quantize(Decimal("0.01"))
        else:
            tax_amount = (subtotal - discount) * tax_rate
            total = subtotal - discount + tax_amount
            validated_data['tax_amount'] = tax_amount.quantize(Decimal("0.01"))
            validated_data['total'] = total.quantize(Decimal("0.01"))
        
        validated_data['balance_due'] = (validated_data['total'] - Decimal(str(validated_data.get('paid_amount', 0)))).quantize(Decimal("0.01"))
        
        invoice = super().create(validated_data)
        
        if service and service.advance_payment > 0:
            Payment.objects.create(
                invoice=invoice,
                amount=service.advance_payment,
                method=service.advance_payment_method or 'cash',
                notes="Advance payment from Service record"
            )
            invoice.paid_amount = service.advance_payment
            invoice.balance_due = invoice.total - invoice.paid_amount
            invoice.save()
            
        return invoice


class PaymentSerializer(serializers.ModelSerializer):
    # Payment transactions linked to invoices
    invoiceId = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all(), source='invoice')
    
    class Meta:
        model = Payment
        fields = ['id', 'invoiceId', 'amount', 'method', 'date', 'reference', 'notes']


class BillingSettingSerializer(serializers.ModelSerializer):
    # Store billing settings (tax rate, invoice prefix, company info)
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
