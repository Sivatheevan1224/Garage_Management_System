from django.db import models
import json

class Customer(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    nic = models.CharField(max_length=20, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='vehicles')
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.CharField(max_length=4)
    number = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=30, null=True, blank=True)
    mileage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'

    def __str__(self):
        return f"{self.number} - {self.brand} {self.model}"


class Technician(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100, null=True, blank=True)
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

    id = models.CharField(max_length=50, primary_key=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='services')
    type = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    technician = models.ForeignKey(Technician, on_delete=models.SET_NULL, null=True, blank=True, related_name='services')
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'services'

    def __str__(self):
        return f"{self.vehicle.number} - {self.type}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('canceled', 'Canceled'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
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

    id = models.CharField(max_length=50, primary_key=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    date = models.DateTimeField(auto_now_add=True)
    reference = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"{self.invoice.invoice_number} - ${self.amount}"


class User(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Bcrypt hashed
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.name} ({self.role})"


class BillingSetting(models.Model):
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.1000)
    invoice_prefix = models.CharField(max_length=10, default='INV')
    next_invoice_number = models.IntegerField(default=1001)
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