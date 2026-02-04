"""
==============================================================
VEHICLE SERVICE LAYER
==============================================================
This layer handles all database operations for vehicles.
It separates business logic from views and models.

Functions:
- get_all_vehicles(): Fetch all vehicles
- get_vehicle_by_id(): Fetch one vehicle by ID
- get_vehicles_by_customer(): Fetch all vehicles owned by a customer
- create_vehicle(): Create new vehicle
- update_vehicle(): Update vehicle information
- delete_vehicle(): Delete vehicle from database
==============================================================
"""

from ..models import Vehicle

def get_all_vehicles():
    # Get all vehicles from database
    return Vehicle.objects.all()

def get_vehicle_by_id(vehicle_id):
    # Find vehicle by ID, return None if not found
    try:
        return Vehicle.objects.get(id=vehicle_id)
    except Vehicle.DoesNotExist:
        return None

def create_vehicle(data):
    # Create new vehicle with auto-increment ID
    # Remove manual ID - use auto-increment
    if 'id' in data:
        del data['id']
    vehicle = Vehicle.objects.create(**data)
    return vehicle

def get_vehicles_by_customer(customer_id):
    # Get all vehicles for a specific customer
    return Vehicle.objects.filter(customer_id=customer_id)

def update_vehicle(vehicle_id, data):
    # Update vehicle info, handle customer relationship
    vehicle = get_vehicle_by_id(vehicle_id)
    if vehicle:
        # Handle customer/owner relationship specially
        for attr, value in data.items():
            if attr == 'customer' and value:
                # If customer is provided, link this vehicle to that customer
                from ..models import Customer
                if isinstance(value, Customer):
                    vehicle.customer = value
                else:
                    # If customer is an ID, fetch and link it
                    try:
                        vehicle.customer = Customer.objects.get(id=value)
                    except Customer.DoesNotExist:
                        pass
                continue
            # Update other fields normally
            setattr(vehicle, attr, value)
        vehicle.save()  # Save to database
        return vehicle
    return None


def delete_vehicle(vehicle_id):
    # Delete vehicle, return True if successful
    vehicle = get_vehicle_by_id(vehicle_id)
    if vehicle:
        vehicle.delete()  # Permanently remove
        return True
    return False
