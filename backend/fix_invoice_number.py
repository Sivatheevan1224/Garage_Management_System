import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'garage_backend.settings')
django.setup()

from service_history.models import Invoice, BillingSetting

# Get existing invoice numbers
invoices = Invoice.objects.all().values_list('invoice_number', flat=True)
print('Existing invoices:', list(invoices))

# Update billing settings
settings = BillingSetting.objects.first()
if settings:
    print(f'Current next_invoice_number: {settings.next_invoice_number}')
    settings.next_invoice_number = 1006
    settings.save()
    print(f'Updated next_invoice_number to: {settings.next_invoice_number}')
else:
    print('No billing settings found')
