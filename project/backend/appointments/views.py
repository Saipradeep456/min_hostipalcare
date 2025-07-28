from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer
from notifications.tasks import send_appointment_confirmation, send_appointment_reminder

class AppointmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'appointment_date']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.select_related('patient__user', 'doctor__user')
        
        if user.role == 'patient':
            # Patients can only see their own appointments
            queryset = queryset.filter(patient__user=user)
        elif user.role == 'doctor':
            # Doctors can only see their own appointments
            queryset = queryset.filter(doctor__user=user)
        elif user.role == 'admin':
            # Admins can see all appointments
            pass
        
        return queryset.order_by('-appointment_date', '-start_time')

    def perform_create(self, serializer):
        appointment = serializer.save()
        # Send confirmation email asynchronously
        send_appointment_confirmation.delay(appointment.id)

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.select_related('patient__user', 'doctor__user')
        
        if user.role == 'patient':
            queryset = queryset.filter(patient__user=user)
        elif user.role == 'doctor':
            queryset = queryset.filter(doctor__user=user)
        elif user.role == 'admin':
            pass
        
        return queryset

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        
        # Check permissions
        user = request.user
        if user.role == 'patient' and appointment.patient.user != user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'doctor' and appointment.doctor.user != user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        appointment.status = 'cancelled'
        appointment.save()
        
        return Response({
            'message': 'Appointment cancelled successfully',
            'appointment': AppointmentSerializer(appointment).data
        })
        
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_confirmation(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        send_appointment_confirmation.delay(appointment.id)
        return Response({'message': 'Confirmation email sent'})
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_reminder(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        send_appointment_reminder.delay(appointment.id)
        return Response({'message': 'Reminder email sent'})
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)