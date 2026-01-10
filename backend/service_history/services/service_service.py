from ..models import Service
import uuid

def get_all_services():
    return Service.objects.all()

def update_service_status(service_id, new_status):
    try:
        service = Service.objects.get(id=service_id)
        service.status = new_status
        service.save()
        return service
    except Service.DoesNotExist:
        return None

def create_service_record(data):
    if 'id' not in data or not data['id']:
        data['id'] = str(uuid.uuid4())
    service = Service.objects.create(**data)
    return service

def get_service_by_id(service_id):
    try:
        return Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return None

def update_service_record(service_id, data):
    service = get_service_by_id(service_id)
    if service:
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


