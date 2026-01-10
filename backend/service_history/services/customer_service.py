from ..models import Customer
import uuid

def get_all_customers():
    return Customer.objects.all()

def get_customer_by_id(customer_id):
    try:
        return Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return None

def create_customer(data):
    if 'id' not in data or not data['id']:
        data['id'] = str(uuid.uuid4())
    customer = Customer.objects.create(**data)
    return customer

def update_customer(customer_id, data):
    customer = get_customer_by_id(customer_id)
    if customer:
        for attr, value in data.items():
            setattr(customer, attr, value)
        customer.save()
        return customer
    return None

def delete_customer(customer_id):
    customer = get_customer_by_id(customer_id)
    if customer:
        customer.delete()
        return True
    return False
