from django.db import models
from django.utils import timezone
import json

class Customer(models.Model):
    """
    Customer Model - Stores client information for the garage
    This creates the 'customers' table in MySQL database
    """
    
    # Primary identification field (auto-incrementing ID is automatic)
    name = models.CharField(max_length=100)  # Customer's full name
    
    # National Identity Card number - unique to prevent duplicates
    nic = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    # Email field with unique constraint - ensures one account per email
    email = models.EmailField(unique=True)
    
    # Contact information
    phone = models.CharField(max_length=20)  # Phone number
    address = models.TextField(null=True, blank=True)  # Full address
    
    # Timestamp - automatically set when customer is created
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'  # MySQL table name

    def __str__(self):
        # String representation for admin panel and debugging
        return self.name


class Vehicle(models.Model):
    """
    Vehicle Model - Stores vehicle information linked to customers
    Each vehicle belongs to one customer (Foreign Key relationship)
    """
    
    # Foreign Key to Customer - links vehicle to its owner
    # CASCADE means: if customer is deleted, their vehicles are also deleted
    # related_name='vehicles' allows: customer.vehicles.all()
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='vehicles')
    
    # Vehicle identification fields
    brand = models.CharField(max_length=50)  # e.g., Toyota, Honda
    model = models.CharField(max_length=50)  # e.g., Corolla, Civic
    year = models.CharField(max_length=4)    # Manufacturing year
    number = models.CharField(max_length=20, unique=True)  # License plate (unique)
    
    # Optional vehicle details
    color = models.CharField(max_length=30, null=True, blank=True)
    fuel_type = models.CharField(max_length=20, default='Petrol')  # Petrol/Diesel/Electric
    mileage = models.IntegerField(default=0)  # Current odometer reading

    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'  # MySQL table name

    def __str__(self):
        # Display format: "ABC-1234 - Toyota Corolla"
        return f"{self.number} - {self.brand} {self.model}"


class Technician(models.Model):
    # Standard auto-incrementing ID
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    workload = models.IntegerField(default=0)

    class Meta:
        db_table = 'technicians'

    def __str__(self):
        return self.name


class Service(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    # Standard auto-incrementing ID
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='services')
    type = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_included = models.BooleanField(default=False)
    advance_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    advance_payment_method = models.CharField(max_length=20, null=True, blank=True, choices=[
        ('cash', 'Cash'), 
        ('card', 'Card'),
        ('check', 'Check'),
        ('bank_transfer', 'Bank Transfer')
    ])
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    technician = models.ForeignKey(Technician, on_delete=models.SET_NULL, null=True, blank=True, related_name='services')
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'services'

    def __str__(self):
        return f"Job #{self.id} - {self.vehicle.number}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('canceled', 'Canceled'),
    ]

    # Standard auto-incrementing ID
    invoice_number = models.CharField(max_length=50, unique=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='invoices')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='invoices')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    date_created = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    line_items = models.JSONField(default=list)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.1000)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=50, default='Net 30')
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'invoices'

    def __str__(self):
        return self.invoice_number


class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('check', 'Check'),
        ('bank_transfer', 'Bank Transfer'),
    ]

    # Standard auto-incrementing ID
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    date = models.DateTimeField(default=timezone.now)
    reference = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"Payment #{self.id} - {self.invoice.invoice_number}"


class BillingSetting(models.Model):
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.1000)
    invoice_prefix = models.CharField(max_length=10, default='INV')
    next_invoice_number = models.IntegerField(default=1001)
    service_prefix = models.CharField(max_length=10, default='SRV')
    next_service_number = models.IntegerField(default=1001)
    payment_terms = models.CharField(max_length=50, default='Net 30')
    company_name = models.CharField(max_length=100, default='ProGarage')
    company_address = models.CharField(max_length=255, default='123 Auto Lane')
    company_city = models.CharField(max_length=100, default='Mechanic City, MC 90210')
    company_phone = models.CharField(max_length=20, default='(555) 123-4567')
    company_email = models.EmailField(default='billing@progarage.com')

    class Meta:
        db_table = 'billing_settings'

    def __str__(self):
        return f"Billing Settings - {self.company_name}"