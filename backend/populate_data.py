"""
Script to populate the database with initial sample data
Run this with: python manage.py shell -c "exec(open('populate_data.py').read())"
"""

from service_history.models import Customer, Vehicle, Technician, Service, Invoice, Payment, User, BillingSetting
from datetime import datetime
import bcrypt

# Clear existing data
print("Clearing existing data...")
Payment.objects.all().delete()
Invoice.objects.all().delete()
Service.objects.all().delete()
Vehicle.objects.all().delete()
Customer.objects.all().delete()
Technician.objects.all().delete()
User.objects.all().delete()
BillingSetting.objects.all().delete()

# Create Customers
print("Creating customers...")
customers_data = [
    {'id': 'cust-001', 'name': 'John Anderson', 'nic': '851234567V', 'email': 'john.anderson@email.com', 'phone': '(555) 123-4567', 'address': '123 Main Street, Springfield, IL 62701'},
    {'id': 'cust-002', 'name': 'Sarah Johnson', 'nic': '902345678V', 'email': 'sarah.johnson@email.com', 'phone': '(555) 234-5678', 'address': '456 Oak Avenue, Springfield, IL 62701'},
    {'id': 'cust-003', 'name': 'Mike Wilson', 'nic': '883456789V', 'email': 'mike.wilson@email.com', 'phone': '(555) 345-6789', 'address': '789 Pine Road, Springfield, IL 62701'},
    {'id': 'cust-004', 'name': 'Emily Davis', 'nic': '954567890V', 'email': 'emily.davis@email.com', 'phone': '(555) 456-7890', 'address': '321 Elm Street, Springfield, IL 62701'},
    {'id': 'cust-005', 'name': 'Robert Brown', 'nic': '825678901V', 'email': 'robert.brown@email.com', 'phone': '(555) 567-8901', 'address': '654 Maple Drive, Springfield, IL 62701'},
]

for data in customers_data:
    Customer.objects.create(**data)

# Create Vehicles
print("Creating vehicles...")
vehicles_data = [
    {'id': 'veh-001', 'customer_id': 'cust-001', 'brand': 'Toyota', 'model': 'Camry', 'year': '2020', 'number': 'ABC-1234', 'color': 'Silver', 'mileage': 45000},
    {'id': 'veh-002', 'customer_id': 'cust-002', 'brand': 'Honda', 'model': 'Civic', 'year': '2019', 'number': 'DEF-5678', 'color': 'Blue', 'mileage': 52000},
    {'id': 'veh-003', 'customer_id': 'cust-003', 'brand': 'Ford', 'model': 'F-150', 'year': '2021', 'number': 'GHI-9012', 'color': 'Black', 'mileage': 38000},
    {'id': 'veh-004', 'customer_id': 'cust-004', 'brand': 'BMW', 'model': '328i', 'year': '2018', 'number': 'JKL-3456', 'color': 'White', 'mileage': 67000},
    {'id': 'veh-005', 'customer_id': 'cust-005', 'brand': 'Chevrolet', 'model': 'Malibu', 'year': '2020', 'number': 'MNO-7890', 'color': 'Red', 'mileage': 41000},
    {'id': 'veh-006', 'customer_id': 'cust-001', 'brand': 'Toyota', 'model': 'RAV4', 'year': '2022', 'number': 'PQR-1357', 'color': 'Gray', 'mileage': 22000},
]

for data in vehicles_data:
    Vehicle.objects.create(**data)

# Create Technicians
print("Creating technicians...")
technicians_data = [
    {'id': 't1', 'name': 'John Doe', 'specialization': 'Engine Specialist', 'workload': 0},
    {'id': 't2', 'name': 'Jane Smith', 'specialization': 'Brake & Suspension', 'workload': 0},
    {'id': 't3', 'name': 'Mike Johnson', 'specialization': 'General Service', 'workload': 0},
]

for data in technicians_data:
    Technician.objects.create(**data)

# Create Services
print("Creating services...")
services_data = [
    {'id': 'srv-001', 'vehicle_id': 'veh-001', 'type': 'Oil Change', 'description': 'Full synthetic oil change with filter replacement', 'cost': 85.00, 'date': '2025-12-15T09:00:00Z', 'status': 'Completed', 'technician_id': 't1', 'estimated_hours': 1.00},
    {'id': 'srv-002', 'vehicle_id': 'veh-002', 'type': 'Brake Service', 'description': 'Front brake pads replacement and rotor resurfacing', 'cost': 320.00, 'date': '2025-12-18T10:30:00Z', 'status': 'Completed', 'technician_id': 't2', 'estimated_hours': 3.00},
    {'id': 'srv-003', 'vehicle_id': 'veh-003', 'type': 'Engine Diagnostic', 'description': 'Computer diagnostic scan for check engine light', 'cost': 125.00, 'date': '2025-12-20T14:00:00Z', 'status': 'Completed', 'technician_id': 't1', 'estimated_hours': 2.00},
]

for data in services_data:
    Service.objects.create(**data)

# Create Invoices
print("Creating invoices...")
invoices_data = [
    {
        'id': 'inv-001',
        'invoice_number': 'INV-1001',
        'service_id': 'srv-001',
        'customer_id': 'cust-001',
        'vehicle_id': 'veh-001',
        'status': 'paid',
        'due_date': '2026-01-14T09:30:00Z',
        'subtotal': 85.00,
        'tax_rate': 0.1000,
        'tax_amount': 8.50,
        'discount': 0,
        'total': 93.50,
        'paid_amount': 93.50,
        'balance_due': 0,
        'payment_terms': 'Net 30',
        'notes': 'Thank you for choosing ProGarage!',
        'line_items': [
            {'id': 'li-001', 'description': 'Oil Change Service', 'detail': 'Full synthetic', 'quantity': 1, 'unitPrice': 75.00, 'total': 75.00, 'type': 'service'},
            {'id': 'li-002', 'description': 'Shop Supplies', 'detail': 'Misc', 'quantity': 1, 'unitPrice': 10.00, 'total': 10.00, 'type': 'parts'}
        ]
    },
    {
        'id': 'inv-002',
        'invoice_number': 'INV-1002',
        'service_id': 'srv-002',
        'customer_id': 'cust-002',
        'vehicle_id': 'veh-002',
        'status': 'sent',
        'due_date': '2026-01-17T11:00:00Z',
        'subtotal': 320.00,
        'tax_rate': 0.1000,
        'tax_amount': 32.00,
        'discount': 0,
        'total': 352.00,
        'paid_amount': 0,
        'balance_due': 352.00,
        'payment_terms': 'Net 30',
        'notes': 'Brake pads replaced successfully.',
        'line_items': [
            {'id': 'li-003', 'description': 'Brake Service', 'detail': 'Front pads', 'quantity': 1, 'unitPrice': 320.00, 'total': 320.00, 'type': 'service'}
        ]
    }
]

for data in invoices_data:
    Invoice.objects.create(**data)

# Create Payments
print("Creating payments...")
payments_data = [
    {'id': 'pay-001', 'invoice_id': 'inv-001', 'amount': 93.50, 'method': 'card', 'reference': 'TXN-789123', 'notes': 'Visa ending in 4567'}
]

for data in payments_data:
    Payment.objects.create(**data)

# Create Users
print("Creating users...")
admin_password = bcrypt.hashpw('adminpassword123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
User.objects.create(
    id='admin-001',
    name='Admin User',
    email='admin@progarage.com',
    password=admin_password,
    role='admin',
    is_approved=True,
    is_active=True,
    approved_at=datetime.now()
)

staff_password = bcrypt.hashpw('staffpassword123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
User.objects.create(
    id='staff-default',
    name='Default Staff',
    email='staff@progarage.com',
    password=staff_password,
    role='staff',
    is_approved=True,
    is_active=True,
    approved_at=datetime.now(),
    approved_by='admin-001'
)

# Create Billing Settings
print("Creating billing settings...")
BillingSetting.objects.create(
    tax_rate=0.1000,
    invoice_prefix='INV',
    next_invoice_number=1003,
    payment_terms='Net 30',
    company_name='ProGarage',
    company_address='123 Auto Lane',
    company_city='Mechanic City, MC 90210',
    company_phone='(555) 123-4567',
    company_email='billing@progarage.com'
)

print("\n✅ Sample data loaded successfully!")
print(f"Customers: {Customer.objects.count()}")
print(f"Vehicles: {Vehicle.objects.count()}")
print(f"Technicians: {Technician.objects.count()}")
print(f"Services: {Service.objects.count()}")
print(f"Invoices: {Invoice.objects.count()}")
print(f"Payments: {Payment.objects.count()}")
print(f"Users: {User.objects.count()}")
print(f"Billing Settings: {BillingSetting.objects.count()}")
