from ..models import Customer

def get_all_customers():
    return Customer.objects.all()

def get_customer_by_id(customer_id):
    try:
        return Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return None

def create_customer(data):
    # Remove manual ID - use auto-increment
    if 'id' in data:
        del data['id']
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
