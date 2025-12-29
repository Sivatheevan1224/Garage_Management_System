from django.db import models

class ServiceRecord(models.Model):
    # Requirement: Search by vehicle or customer
    vehicle_no = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=100)
    
    # Requirement: Record service date and type
    service_date = models.DateField()
    service_type = models.CharField(max_length=100) # e.g., Oil Change, Repair
    
    # Requirement: Staff and Financial details
    technician = models.CharField(max_length=100)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField() # To store previous repair details

    def __str__(self):
        return f"{self.vehicle_no} - {self.service_date}"