from django.contrib import admin
from .models import Customer, Vehicle, Technician, Service, Invoice, Payment, BillingSetting

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'email', 'nic', 'created_at')
    search_fields = ('id', 'name', 'phone', 'email', 'nic')
    readonly_fields = ('created_at',)

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'number', 'brand', 'model', 'customer', 'year')
    search_fields = ('id', 'number', 'brand', 'model', 'customer__name')
    list_filter = ('brand', 'year')
    readonly_fields = ('created_at',)

@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'specialization', 'phone', 'is_active', 'workload')
    list_filter = ('specialization', 'is_active')
    search_fields = ('id', 'name', 'specialization', 'phone')

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'type', 'status', 'cost_display', 'advance_payment_display', 'remaining_balance_display', 'date')
    list_filter = ('status', 'type', 'date')
    search_fields = ('id', 'vehicle__number', 'type')
    readonly_fields = ('created_at',)
    
    def cost_display(self, obj):
        return f"LKR {obj.cost:.2f}"
    cost_display.short_description = 'Cost'

    def advance_payment_display(self, obj):
        return f"LKR {obj.advance_payment:.2f}"
    advance_payment_display.short_description = 'Advance'

    def remaining_balance_display(self, obj):
        return f"LKR {obj.remaining_balance:.2f}"
    remaining_balance_display.short_description = 'Remaining Balance'

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice_number', 'customer', 'total_display', 'paid_amount_display', 'balance_due_display', 'status', 'due_date')
    list_filter = ('status', 'date_created')
    search_fields = ('id', 'invoice_number', 'customer__name', 'vehicle__number')
    readonly_fields = ('date_created',)
    
    def total_display(self, obj):
        return f"LKR {obj.total:.2f}"
    total_display.short_description = 'Total'

    def paid_amount_display(self, obj):
        return f"LKR {obj.paid_amount:.2f}"
    paid_amount_display.short_description = 'Paid Amount'
    
    def balance_due_display(self, obj):
        return f"LKR {obj.balance_due:.2f}"
    balance_due_display.short_description = 'Balance Due'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice_link', 'amount_display', 'method', 'date', 'reference')
    list_filter = ('method', 'date')
    search_fields = ('id', 'invoice__invoice_number', 'reference')
    readonly_fields = ('date',)
    
    def amount_display(self, obj):
        return f"LKR {obj.amount:.2f}"
    amount_display.short_description = 'Amount'

    def invoice_link(self, obj):
        return obj.invoice.invoice_number
    invoice_link.short_description = 'Invoice'

@admin.register(BillingSetting)
class BillingSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'company_name', 'tax_rate', 'invoice_prefix', 'service_prefix')
