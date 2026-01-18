from ..models import Vehicle

def get_all_vehicles():
    return Vehicle.objects.all()

def get_vehicle_by_id(vehicle_id):
    try:
        return Vehicle.objects.get(id=vehicle_id)
    except Vehicle.DoesNotExist:
        return None

def create_vehicle(data):
    # Remove manual ID - use auto-increment
    if 'id' in data:
        del data['id']
    vehicle = Vehicle.objects.create(**data)
    return vehicle

def get_vehicles_by_customer(customer_id):
    return Vehicle.objects.filter(customer_id=customer_id)

def update_vehicle(vehicle_id, data):
    vehicle = get_vehicle_by_id(vehicle_id)
    if vehicle:
        for attr, value in data.items():
            if attr == 'customer' and value:
                from ..models import Customer
                if isinstance(value, Customer):
                    vehicle.customer = value
                else:
                    try:
                        vehicle.customer = Customer.objects.get(id=value)
                    except Customer.DoesNotExist:
                        pass
                continue
            setattr(vehicle, attr, value)
        vehicle.save()
        return vehicle
    return None


def delete_vehicle(vehicle_id):
    vehicle = get_vehicle_by_id(vehicle_id)
    if vehicle:
        vehicle.delete()
        return True
    return False
