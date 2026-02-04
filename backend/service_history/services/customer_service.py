"""
==============================================================
CUSTOMER SERVICE LAYER
==============================================================
This layer handles all database operations for customers.
It separates business logic from views and models.

Functions:
- get_all_customers(): Fetch all customers
- get_customer_by_id(): Fetch one customer by ID
- create_customer(): Create new customer
- update_customer(): Update customer information
- delete_customer(): Delete customer from database
==============================================================
"""

from ..models import Customer

def get_all_customers():
    # Get all customers from database
    return Customer.objects.all()

def get_customer_by_id(customer_id):
    # Find customer by ID, return None if not found
    try:
        return Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return None

def create_customer(data):
    # Create new customer with auto-increment ID
    # Remove manual ID if present - MySQL auto-increments ID
    if 'id' in data:
        del data['id']
    # Create and save customer to database
    customer = Customer.objects.create(**data)
    return customer

def update_customer(customer_id, data):
    # Update customer info and save to database
    customer = get_customer_by_id(customer_id)
    if customer:
        # Update each field provided in data
        for attr, value in data.items():
            setattr(customer, attr, value)  # Set attribute value
        customer.save()  # Save changes to MySQL database
        return customer
    return None

def delete_customer(customer_id):
    # Delete customer, return True if successful
    customer = get_customer_by_id(customer_id)
    if customer:
        customer.delete()  # Permanently remove from MySQL
        return True
    return False
