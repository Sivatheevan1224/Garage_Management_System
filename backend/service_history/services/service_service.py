"""
==============================================================
SERVICE SERVICE LAYER
==============================================================
This layer handles all service management operations.
Most importantly: It automatically generates invoices when a service
is marked as 'Completed', calculating all taxes and payments correctly.

Key Concept: Tax Calculation
- If tax_included=True: Service cost already includes tax
  Example: Customer says "I want $100 total". Tax is extracted.
  $100 total = $90.91 subtotal + $9.09 tax (10%)
  
- If tax_included=False: Tax is added on top
  Example: Service costs $100. Tax is added.
  $100 subtotal + $10 tax (10%) = $110 total

Functions:
- get_all_services(): Fetch all services
- auto_generate_invoice(): Create invoice when service completes (IMPORTANT)
- update_service_status(): Change service status, trigger invoice if 'Completed'
- create_service_record(): Create new service, auto-invoice if advance payment
- get_service_by_id(): Find one service
- update_service_record(): Update service information
- delete_service_record(): Delete service
==============================================================
"""

from ..models import Service, Invoice, Payment, BillingSetting
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone

def get_all_services():
    # Get all services from database
    return Service.objects.all()

def auto_generate_invoice(service):
    # Auto-generate invoice when service completes, handle tax calculation and payment tracking
    try:
        # Prevent duplicate invoices for same service
        if Invoice.objects.filter(service=service).exists():
            return None
        
        # Get billing settings for tax rate and invoice prefix
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
        
        invoice_number = f"{prefix}-{next_num}"
        
        # Get the service cost (this is the base price)
        subtotal = service.cost
        tax_rate = settings.tax_rate if settings else Decimal('0.1000')
        
        # CRITICAL: Two tax scenarios with different math
        if service.tax_included:
            # Tax is already IN the price customer quoted
            # Need to extract tax from total
            # Formula: subtotal = total / (1 + tax_rate)
            total = subtotal  # The $100 already includes tax
            subtotal = total / (1 + tax_rate)  # Extract actual cost: $90.91
            tax_amount = total - subtotal  # Tax is difference: $9.09
        else:
            # Tax is NOT in price, add it on top
            # Formula: total = subtotal + (subtotal × tax_rate)
            tax_amount = subtotal * tax_rate  # Calculate tax: $100 × 10% = $10
            total = subtotal + tax_amount  # Add to subtotal: $100 + $10 = $110
            
        # No discounts for now
        discount = Decimal('0')
        
        # Payment tracking
        paid_amount = service.advance_payment  # How much already paid
        balance_due = total - paid_amount  # How much still owed
        
        # Create line item for invoice (shows service details)
        line_items = [{
            'description': f"Service: {service.type}",
            'detail': service.description or '',
            'quantity': 1,
            'unitPrice': float(subtotal.quantize(Decimal("0.01"))),
            'total': float(subtotal.quantize(Decimal("0.01"))),
            'type': 'service'
        }]
        
        # Create the Invoice in database
        invoice = Invoice.objects.create(
            invoice_number=invoice_number,  # Auto-generated: INV-1001
            service=service,  # Link to service
            customer=service.vehicle.customer,  # Who to bill
            vehicle=service.vehicle,  # What vehicle was serviced
            status='paid' if balance_due <= 0 else 'sent',  # If fully paid, mark as paid
            due_date=timezone.now() + timedelta(days=30),  # Payment due in 30 days
            line_items=line_items,  # What service was done
            subtotal=subtotal.quantize(Decimal("0.01")),  # Stored with 2 decimal places
            tax_rate=tax_rate,
            tax_amount=tax_amount.quantize(Decimal("0.01")),
            discount=discount,
            total=total.quantize(Decimal("0.01")),  # Final price
            paid_amount=paid_amount,  # Already received from advance
            balance_due=balance_due.quantize(Decimal("0.01")),  # Still owed
            payment_terms=settings.payment_terms if settings else 'Net 30'  # Payment terms
        )
        
        # Record advance payment as a Payment transaction
        if service.advance_payment > 0:
            Payment.objects.create(
                invoice=invoice,  # Link to invoice
                amount=service.advance_payment,  # How much was paid
                method=service.advance_payment_method or 'cash',  # How was it paid (cash/card/check)
                notes='Advance payment from Service record'  # Explanation
            )
        
        return invoice
    except Exception as e:
        # If something goes wrong, print error but don't crash
        print(f"Error auto-generating invoice: {e}")
        return None


def update_service_status(service_id, new_status):
    # Update service status, auto-generate invoice when marked 'Completed'
    try:
        service = Service.objects.get(id=service_id)
        service.status = new_status  # Update status
        service.save()  # Save to database
        
        # TRIGGER: If completed, auto-generate invoice
        if new_status == 'Completed':
            auto_generate_invoice(service)  # Runs invoice creation
        
        return service
    except Service.DoesNotExist:
        return None

def create_service_record(data):
    """
    Create a new service record
    Calculates remaining balance (total cost - advance payment)
    Auto-generates invoice if advance payment is provided
    
    Args: data (dict) - Service information
    Returns: Newly created Service object
    """
    # Remove manual ID - let database handle auto-increment
    if 'id' in data:
        del data['id']
        
    # Calculate balance: What still needs to be paid
    # Example: $100 service with $25 advance = $75 remaining
    cost = data.get('cost', 0)
    advance = data.get('advance_payment', 0)
    data['remaining_balance'] = cost - advance
    
    # Create service in database
    service = Service.objects.create(**data)
    
    # Auto-invoice if customer paid advance
    if service.advance_payment > 0:
        auto_generate_invoice(service)
        
    return service

def get_service_by_id(service_id):
    # Find service by ID, return None if not found
    try:
        return Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return None

def update_service_record(service_id, data):
    # Update service info, recalculate balance if cost or advance changed
    service = get_service_by_id(service_id)
    if service:
        # Recalculate balance if cost or advance changed
        cost = data.get('cost', service.cost)
        advance = data.get('advance_payment', service.advance_payment)
        data['remaining_balance'] = cost - advance
        
        # Update all fields
        for attr, value in data.items():
            setattr(service, attr, value)
        service.save()  # Save to database
        return service
    return None

def delete_service_record(service_id):
    # Delete service, return True if successful
    service = get_service_by_id(service_id)
    if service:
        service.delete()  # Permanently remove
        return True
    return False
