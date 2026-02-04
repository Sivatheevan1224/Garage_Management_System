"""
==============================================================
API VIEWS - REST ENDPOINTS
==============================================================
This file defines all HTTP API endpoints that the React frontend uses.
Each function handles GET/POST/PUT/DELETE requests for a resource.

@api_view decorator: Specifies which HTTP methods (GET, POST, PUT, DELETE) are allowed
@permission_classes decorator: Specifies who can access (IsAuthenticated = must have JWT token)

Pattern for each resource:
1. list() - GET all or POST new
2. detail() - GET one, PUT update, or DELETE

Request Flow:
1. React sends request to /api/customers/ (or other endpoint)
2. Django routes to appropriate function
3. Function validates request data with Serializer
4. Function calls Service layer (customer_service, etc.)
5. Service layer queries database and returns results
6. Function returns JSON response to React

==============================================================
"""

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

# ========== CUSTOMER API ENDPOINTS ==========
# Customer is the person who brings vehicle for repair

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # Must be logged in with valid JWT token
def customer_list(request):
    """
    GET:  List all customers from database
    POST: Create new customer
    
    Frontend usage:
    GET  /api/customers/ -> Returns list of all customers
    POST /api/customers/ -> Creates new customer with data from form
    """
    if request.method == 'GET':
        # Fetch all customers using service layer
        customers = customer_service.get_all_customers()
        # Convert Python objects to JSON using Serializer
        serializer = CustomerSerializer(customers, many=True)
        # Return JSON response
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        # Receive JSON from React and validate
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            # If data is valid, save to MySQL database via service layer
            customer = customer_service.create_customer(serializer.validated_data)
            # Return created customer with 201 (Created) status
            return success_response(
                CustomerSerializer(customer).data, 
                "Customer created", 
                status_code=201
            )
        # If validation fails, return error messages to React
        return error_response(serializer.errors)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def customer_detail(request, pk):
    """
    GET:    Retrieve single customer by ID
    PUT:    Update customer information
    DELETE: Delete customer from database
    
    Frontend usage:
    GET    /api/customers/1/ -> Returns customer with id=1
    PUT    /api/customers/1/ -> Updates customer with id=1
    DELETE /api/customers/1/ -> Deletes customer with id=1
    """
    # Find customer by primary key (id)
    customer = customer_service.get_customer_by_id(pk)
    if not customer:
        return error_response("Customer not found", status_code=404)
    
    if request.method == 'GET':
        # Return single customer as JSON
        serializer = CustomerSerializer(customer)
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        # Update customer with new data from React
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            # Save updated data to database
            updated_customer = customer_service.update_customer(pk, serializer.validated_data)
            return success_response(
                CustomerSerializer(updated_customer).data, 
                "Customer updated"
            )
        return error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        # Permanently delete customer from MySQL
        customer_service.delete_customer(pk)
        return success_response(None, "Customer deleted")

# ========== VEHICLE API ENDPOINTS ==========
# Vehicle is the car/bike being serviced

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def vehicle_list(request):
    """
    GET:  List vehicles (optionally filter by customer_id)
    POST: Create new vehicle
    
    Frontend usage:
    GET /api/vehicles/                  -> All vehicles
    GET /api/vehicles/?customer_id=1    -> Only vehicles of customer 1
    POST /api/vehicles/                 -> Create new vehicle
    """
    if request.method == 'GET':
        # Check if customer_id parameter provided (for filtering)
        customer_id = request.query_params.get('customer_id')
        if customer_id:
            # Get only vehicles for this customer
            vehicles = vehicle_service.get_vehicles_by_customer(customer_id)
        else:
            # Get all vehicles
            vehicles = vehicle_service.get_all_vehicles()
        serializer = VehicleSerializer(vehicles, many=True)
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        # Create new vehicle
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            vehicle = vehicle_service.create_vehicle(serializer.validated_data)
            return success_response(VehicleSerializer(vehicle).data, "Vehicle created", status_code=201)
        return error_response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def vehicle_detail(request, pk):
    """
    GET:    Get single vehicle
    PUT:    Update vehicle info
    DELETE: Delete vehicle
    """
    vehicle = vehicle_service.get_vehicle_by_id(pk)
    if not vehicle:
        return error_response("Vehicle not found", status_code=404)
    
    if request.method == 'GET':
        serializer = VehicleSerializer(vehicle)
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        # partial=True means all fields are optional (not all required to update)
        serializer = VehicleSerializer(vehicle, data=request.data, partial=True)
        if serializer.is_valid():
            updated_vehicle = vehicle_service.update_vehicle(pk, serializer.validated_data)
            return success_response(VehicleSerializer(updated_vehicle).data, "Vehicle updated")
        return error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        vehicle_service.delete_vehicle(pk)
        return success_response(None, "Vehicle deleted")


# ========== SERVICE API ENDPOINTS ==========
# Service is the repair work done on the vehicle

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def service_record_list(request):
    """
    GET:  List all services
    POST: Create new service (may trigger auto-invoice if advance payment)
    """
    if request.method == 'GET':
        # Get all services from database
        services = service_service.get_all_services()
        serializer = ServiceSerializer(services, many=True)
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        # Create new service record
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            # This may auto-generate invoice if advance payment provided
            service_record = service_service.create_service_record(serializer.validated_data)
            return success_response(ServiceSerializer(service_record).data, "Service record created", status_code=201)
        return error_response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def service_record_detail(request, pk):
    """
    GET:    Get service details
    PUT:    Update service info
    DELETE: Delete service
    """
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
    """
    PATCH /api/services/{id}/status/
    Update service status (Pending -> In Progress -> Completed)
    IMPORTANT: When status -> 'Completed', automatically generates invoice
    """
    new_status = request.data.get('status')
    if not new_status:
        return error_response("Status is required")
    
    # Update status via service layer
    service_record = service_service.update_service_status(pk, new_status)
    if service_record:
        return success_response(ServiceSerializer(service_record).data, "Status updated")
    return error_response("Service record not found", status_code=404)

# ========== BILLING SETTINGS ==========
# Global settings for taxes, invoice prefix, company info

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_billing_settings(request):
    """
    GET /api/billing-settings/
    Returns global billing settings (tax rate, invoice prefix, etc.)
    """
    settings = BillingSetting.objects.first()
    if settings:
        serializer = BillingSettingSerializer(settings)
        return success_response(serializer.data)
    return error_response("No billing settings found", status_code=404)

# ========== TECHNICIAN API ENDPOINTS ==========
# Technician is the repair staff who performs service

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def technician_list(request):
    """
    GET:  List all technicians
    POST: Add new technician
    """
    if request.method == 'GET':
        # Get all technicians from database
        technicians = Technician.objects.all()
        serializer = TechnicianSerializer(technicians, many=True)
        return success_response(serializer.data)
    elif request.method == 'POST':
        # Create new technician
        serializer = TechnicianSerializer(data=request.data)
        if serializer.is_valid():
            technician = serializer.save()
            return success_response(TechnicianSerializer(technician).data, "Technician created", status_code=201)
        return error_response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def technician_detail(request, pk):
    """
    GET:    Get technician details
    PUT:    Update technician info
    DELETE: Delete technician (soft delete via is_active field)
    """
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


# ========== INVOICE API ENDPOINTS ==========
# Invoice is the bill sent to customer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def invoice_list(request):
    """
    GET:  List all invoices
    POST: Create new invoice (usually auto-generated, but can be manual)
    """
    if request.method == 'GET':
        # Get all invoices
        invoices = Invoice.objects.all()
        serializer = InvoiceSerializer(invoices, many=True)
        return success_response(serializer.data)
    elif request.method == 'POST':
        # Create new invoice manually
        data = request.data.copy()
        # Remove empty id if present (should use auto-increment)
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
    """
    GET:    Get invoice details
    PUT:    Update invoice
    DELETE: Delete invoice
    """
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


# ========== PAYMENT API ENDPOINTS ==========
# Payment is a transaction recorded against an invoice

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payment_list(request):
    """
    GET:  List payments (optionally filter by invoice_id)
    POST: Record new payment
    
    Important: When payment is recorded, invoice balance_due is recalculated
    """
    if request.method == 'GET':
        # Check if filtering by invoice_id
        invoice_id = request.query_params.get('invoice_id')
        if invoice_id:
            # Get payments for specific invoice
            payments = Payment.objects.filter(invoice_id=invoice_id)
        else:
            # Get all payments
            payments = Payment.objects.all()
        serializer = PaymentSerializer(payments, many=True)
        return success_response(serializer.data)
    elif request.method == 'POST':
        # Record new payment
        data = request.data.copy()
        if 'id' in data and not data['id']:
            del data['id']
            
        serializer = PaymentSerializer(data=data)
        if serializer.is_valid():
            payment = serializer.save()
            
            # AUTOMATIC: Recalculate invoice paid_amount and balance_due
            from django.db.models import Sum
            invoice = payment.invoice
            # Sum all payments for this invoice
            total_paid = Payment.objects.filter(invoice=invoice).aggregate(Sum('amount'))['amount__sum'] or 0
            
            # Update invoice with new payment totals
            invoice.paid_amount = total_paid
            invoice.balance_due = invoice.total - invoice.paid_amount
            
            # If fully paid, mark invoice as 'paid'
            if invoice.balance_due <= 0:
                invoice.status = 'paid'
            invoice.save()
            
            # Sync Service remaining_balance with Invoice balance_due
            # This keeps Service and Invoice balances in sync
            if invoice.service:
                service = invoice.service
                service.remaining_balance = invoice.balance_due
                service.save()
            
            return success_response(PaymentSerializer(payment).data, "Payment processed", status_code=201)
        return error_response(serializer.errors)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def payment_detail(request, pk):
    """
    GET:    Get payment details
    DELETE: Delete payment (and recalculate invoice balance)
    """
    try:
        payment = Payment.objects.get(id=pk)
    except Payment.DoesNotExist:
        return error_response("Payment not found", status_code=404)
    
    if request.method == 'GET':
        serializer = PaymentSerializer(payment)
        return success_response(serializer.data)
        
    elif request.method == 'DELETE':
        # Delete payment
        payment.delete()
        return success_response(None, "Payment deleted")


