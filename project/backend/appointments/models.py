from django.db import models
from django.conf import settings
from doctors.models import Doctor
from patients.models import Patient

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['doctor', 'appointment_date', 'start_time']
        ordering = ['-appointment_date', '-start_time']

    def __str__(self):
        return f"{self.patient.user.full_name} - Dr. {self.doctor.user.full_name} on {self.appointment_date}"

    @property
    def duration_minutes(self):
        from datetime import datetime, timedelta
        start = datetime.combine(self.appointment_date, self.start_time)
        end = datetime.combine(self.appointment_date, self.end_time)
        return int((end - start).total_seconds() / 60)