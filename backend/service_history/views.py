from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from utils.http_responses import success_response, error_response
from utils.permissions import IsAdmin
from .models import Customer, Vehicle, Technician, Service, Invoice, Payment, BillingSetting
from .serializers import (
    CustomerSerializer, VehicleSerializer, TechnicianSerializer,
    ServiceSerializer, InvoiceSerializer, PaymentSerializer,
    BillingSettingSerializer
)
from .services import customer_service, vehicle_service, service_service

# --- Customer Views ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customer_list(request):
    if request.method == 'GET':
        customers = customer_service.get_all_customers()
        serializer = CustomerSerializer(customers, many=True)
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer = customer_service.create_customer(serializer.validated_data)
            return success_response(CustomerSerializer(customer).data, "Customer created", status_code=201)
        return error_response(serializer.errors)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def customer_detail(request, pk):
    customer = customer_service.get_customer_by_id(pk)
    if not customer:
        return error_response("Customer not found", status_code=404)
    
    if request.method == 'GET':
        serializer = CustomerSerializer(customer)
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            updated_customer = customer_service.update_customer(pk, serializer.validated_data)
            return success_response(CustomerSerializer(updated_customer).data, "Customer updated")
        return error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        customer_service.delete_customer(pk)
        return success_response(None, "Customer deleted")

# --- Vehicle Views ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def vehicle_list(request):
    if request.method == 'GET':
        customer_id = request.query_params.get('customer_id')
        if customer_id:
            vehicles = vehicle_service.get_vehicles_by_customer(customer_id)
        else:
            vehicles = vehicle_service.get_all_vehicles()
        serializer = VehicleSerializer(vehicles, many=True)
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            vehicle = vehicle_service.create_vehicle(serializer.validated_data)
            return success_response(VehicleSerializer(vehicle).data, "Vehicle created", status_code=201)
        return error_response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def vehicle_detail(request, pk):
    vehicle = vehicle_service.get_vehicle_by_id(pk)
    if not vehicle:
        return error_response("Vehicle not found", status_code=404)
    
    if request.method == 'GET':
        serializer = VehicleSerializer(vehicle)
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = VehicleSerializer(vehicle, data=request.data, partial=True)
        if serializer.is_valid():
            updated_vehicle = vehicle_service.update_vehicle(pk, serializer.validated_data)
            return success_response(VehicleSerializer(updated_vehicle).data, "Vehicle updated")
        return error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        vehicle_service.delete_vehicle(pk)
        return success_response(None, "Vehicle deleted")


# --- Service Views ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def service_record_list(request):
    if request.method == 'GET':
        services = service_service.get_all_services()
        serializer = ServiceSerializer(services, many=True)
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            service_record = service_service.create_service_record(serializer.validated_data)
            return success_response(ServiceSerializer(service_record).data, "Service record created", status_code=201)
        return error_response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def service_record_detail(request, pk):
    service_record = service_service.get_service_by_id(pk)
    if not service_record:
        return error_response("Service record not found", status_code=404)
    
    if request.method == 'GET':
        serializer = ServiceSerializer(service_record)
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ServiceSerializer(service_record, data=request.data, partial=True)
        if serializer.is_valid():
            updated_service = service_service.update_service_record(pk, serializer.validated_data)
            return success_response(ServiceSerializer(updated_service).data, "Service record updated")
        return error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        service_service.delete_service_record(pk)
        return success_response(None, "Service record deleted")


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_service_record_status(request, pk):
    new_status = request.data.get('status')
    if not new_status:
        return error_response("Status is required")
    
    service_record = service_service.update_service_status(pk, new_status)
    if service_record:
        return success_response(ServiceSerializer(service_record).data, "Status updated")
    return error_response("Service record not found", status_code=404)

# --- Billing Settings ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_billing_settings(request):
    settings = BillingSetting.objects.first()
    if settings:
        serializer = BillingSettingSerializer(settings)
        return success_response(serializer.data)
    return error_response("No billing settings found", status_code=404)

# --- Technician Views ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def technician_list(request):
    if request.method == 'GET':
        technicians = Technician.objects.all()
        serializer = TechnicianSerializer(technicians, many=True)
        return success_response(serializer.data)
    elif request.method == 'POST':
        serializer = TechnicianSerializer(data=request.data)
        if serializer.is_valid():
            technician = serializer.save()
            return success_response(TechnicianSerializer(technician).data, "Technician created", status_code=201)
        return error_response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def technician_detail(request, pk):
    try:
        technician = Technician.objects.get(id=pk)
    except Technician.DoesNotExist:
        return error_response("Technician not found", status_code=404)
    
    if request.method == 'GET':
        serializer = TechnicianSerializer(technician)
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TechnicianSerializer(technician, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data, "Technician updated")
        return error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        technician.delete()
        return success_response(None, "Technician deleted")


# --- Invoice Views ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def invoice_list(request):
    if request.method == 'GET':
        invoices = Invoice.objects.all()
        serializer = InvoiceSerializer(invoices, many=True)
        return success_response(serializer.data)
    elif request.method == 'POST':
        # Remove empty id from request data if present
        data = request.data.copy()
        if 'id' in data and not data['id']:
            del data['id']
        serializer = InvoiceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data, "Invoice created", status_code=201)
        return error_response(serializer.errors)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def invoice_detail(request, pk):
    try:
        invoice = Invoice.objects.get(id=pk)
    except Invoice.DoesNotExist:
        return error_response("Invoice not found", status_code=404)
    
    if request.method == 'GET':
        serializer = InvoiceSerializer(invoice)
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = InvoiceSerializer(invoice, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data, "Invoice updated")
        return error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        invoice.delete()
        return success_response(None, "Invoice deleted")


# --- Payment Views ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payment_list(request):
    if request.method == 'GET':
        invoice_id = request.query_params.get('invoice_id')
        if invoice_id:
            payments = Payment.objects.filter(invoice_id=invoice_id)
        else:
            payments = Payment.objects.all()
        serializer = PaymentSerializer(payments, many=True)
        return success_response(serializer.data)
    elif request.method == 'POST':
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            payment = serializer.save()
            
            # Simple logic to update invoice (could be in a service)
            invoice = payment.invoice
            invoice.paid_amount += payment.amount
            invoice.balance_due = invoice.total - invoice.paid_amount
            if invoice.balance_due <= 0:
                invoice.status = 'paid'
            invoice.save()
            
            return success_response(serializer.data, "Payment processed", status_code=201)
        return error_response(serializer.errors)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def payment_detail(request, pk):
    try:
        payment = Payment.objects.get(id=pk)
    except Payment.DoesNotExist:
        return error_response("Payment not found", status_code=404)
    
    if request.method == 'GET':
        serializer = PaymentSerializer(payment)
        return success_response(serializer.data)
        
    elif request.method == 'DELETE':
        payment.delete()
        return success_response(None, "Payment deleted")

