from ..models import Service, Invoice, Payment, BillingSetting
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone

def get_all_services():
    return Service.objects.all()

def auto_generate_invoice(service):
    """Automatically generate invoice when service is completed"""
    try:
        if Invoice.objects.filter(service=service).exists():
            return None
        
        settings = BillingSetting.objects.first()
        count = Invoice.objects.count() + 1
        prefix = settings.invoice_prefix if settings else "INV"
        invoice_number = f"{prefix}-{1000 + count}"
        
        subtotal = service.cost
        tax_rate = settings.tax_rate if settings else Decimal('0.1000')
        
        if service.tax_included:
            total = subtotal
            subtotal = total / (1 + tax_rate)
            tax_amount = total - subtotal
        else:
            tax_amount = subtotal * tax_rate
            total = subtotal + tax_amount
            
        discount = Decimal('0')
        paid_amount = service.advance_payment
        balance_due = total - paid_amount
        
        line_items = [{
            'description': f"Service: {service.type}",
            'detail': service.description or '',
            'quantity': 1,
            'unitPrice': float(subtotal.quantize(Decimal("0.01"))),
            'total': float(subtotal.quantize(Decimal("0.01"))),
            'type': 'service'
        }]
        
        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            service=service,
            customer=service.vehicle.customer,
            vehicle=service.vehicle,
            status='paid' if balance_due <= 0 else 'sent',
            due_date=timezone.now() + timedelta(days=30),
            line_items=line_items,
            subtotal=subtotal.quantize(Decimal("0.01")),
            tax_rate=tax_rate,
            tax_amount=tax_amount.quantize(Decimal("0.01")),
            discount=discount,
            total=total.quantize(Decimal("0.01")),
            paid_amount=paid_amount,
            balance_due=balance_due.quantize(Decimal("0.01")),
            payment_terms=settings.payment_terms if settings else 'Net 30'
        )
        
        if service.advance_payment > 0:
            Payment.objects.create(
                invoice=invoice,
                amount=service.advance_payment,
                method=service.advance_payment_method or 'cash',
                notes='Advance payment from Service record'
            )
        
        return invoice
    except Exception as e:
        print(f"Error auto-generating invoice: {e}")
        return None

def update_service_status(service_id, new_status):
    try:
        service = Service.objects.get(id=service_id)
        service.status = new_status
        service.save()
        
        if new_status == 'Completed':
            auto_generate_invoice(service)
        
        return service
    except Service.DoesNotExist:
        return None

def create_service_record(data):
    # Remove any manual ID logic - let DB handle auto-increment
    if 'id' in data:
        del data['id']
        
    cost = data.get('cost', 0)
    advance = data.get('advance_payment', 0)
    data['remaining_balance'] = cost - advance
    
    service = Service.objects.create(**data)
    
    # Auto-invoice if advance exists
    if service.advance_payment > 0:
        auto_generate_invoice(service)
        
    return service

def get_service_by_id(service_id):
    try:
        return Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return None

def update_service_record(service_id, data):
    service = get_service_by_id(service_id)
    if service:
        cost = data.get('cost', service.cost)
        advance = data.get('advance_payment', service.advance_payment)
        data['remaining_balance'] = cost - advance
        
        for attr, value in data.items():
            setattr(service, attr, value)
        service.save()
        return service
    return None

def delete_service_record(service_id):
    service = get_service_by_id(service_id)
    if service:
        service.delete()
        return True
    return False
