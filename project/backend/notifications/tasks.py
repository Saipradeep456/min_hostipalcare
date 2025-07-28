from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from appointments.models import Appointment

@shared_task
def send_appointment_confirmation(appointment_id):
    try:
        appointment = Appointment.objects.select_related(
            'patient__user', 'doctor__user'
        ).get(id=appointment_id)
        
        subject = f'Appointment Confirmation - {appointment.appointment_date}'
        
        context = {
            'appointment': appointment,
            'patient_name': appointment.patient.user.full_name,
            'doctor_name': appointment.doctor.user.full_name,
        }
        
        html_message = render_to_string('emails/appointment_confirmation.html', context)
        plain_message = render_to_string('emails/appointment_confirmation.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return f"Confirmation email sent for appointment {appointment_id}"
        
    except Appointment.DoesNotExist:
        return f"Appointment {appointment_id} not found"
    except Exception as e:
        return f"Failed to send confirmation email: {str(e)}"

@shared_task
def send_appointment_reminder(appointment_id):
    try:
        appointment = Appointment.objects.select_related(
            'patient__user', 'doctor__user'
        ).get(id=appointment_id)
        
        subject = f'Appointment Reminder - Tomorrow at {appointment.start_time}'
        
        context = {
            'appointment': appointment,
            'patient_name': appointment.patient.user.full_name,
            'doctor_name': appointment.doctor.user.full_name,
        }
        
        html_message = render_to_string('emails/appointment_reminder.html', context)
        plain_message = render_to_string('emails/appointment_reminder.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return f"Reminder email sent for appointment {appointment_id}"
        
    except Appointment.DoesNotExist:
        return f"Appointment {appointment_id} not found"
    except Exception as e:
        return f"Failed to send reminder email: {str(e)}"

@shared_task
def send_daily_appointment_reminders():
    from datetime import date, timedelta
    
    tomorrow = date.today() + timedelta(days=1)
    appointments = Appointment.objects.filter(
        appointment_date=tomorrow,
        status='confirmed'
    )
    
    sent_count = 0
    for appointment in appointments:
        try:
            send_appointment_reminder.delay(appointment.id)
            sent_count += 1
        except Exception as e:
            print(f"Failed to queue reminder for appointment {appointment.id}: {e}")
    
    return f"Queued {sent_count} appointment reminders for {tomorrow}"