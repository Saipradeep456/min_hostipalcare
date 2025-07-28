from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Doctor, TimeSlot
from .serializers import DoctorSerializer, TimeSlotSerializer
from datetime import datetime, timedelta

class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.filter(is_available=True).select_related('user')
    serializer_class = DoctorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'specialization', 'qualifications']
    ordering_fields = ['consultation_fee', 'experience', 'created_at']
    ordering = ['user__first_name']

class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.select_related('user').prefetch_related('time_slots')
    serializer_class = DoctorSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_availability(request, doctor_id):
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        date_str = request.GET.get('date')
        
        if not date_str:
            return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get day of week (0=Sunday, 6=Saturday)
        day_of_week = (date.weekday() + 1) % 7
        
        # Get doctor's time slots for this day
        time_slots = TimeSlot.objects.filter(
            doctor=doctor,
            day_of_week=day_of_week,
            is_available=True
        )
        
        # TODO: Check for existing appointments and remove booked slots
        available_slots = []
        for slot in time_slots:
            # Generate 30-minute intervals within the time slot
            current_time = datetime.combine(date, slot.start_time)
            end_time = datetime.combine(date, slot.end_time)
            
            while current_time < end_time:
                available_slots.append({
                    'time': current_time.strftime('%H:%M'),
                    'available': True  # TODO: Check against existing appointments
                })
                current_time += timedelta(minutes=30)
        
        return Response({
            'date': date_str,
            'doctor': doctor.user.full_name,
            'available_slots': available_slots
        })
        
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

class TimeSlotListCreateView(generics.ListCreateAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            return TimeSlot.objects.filter(doctor_id=doctor_id)
        return TimeSlot.objects.all()

    def perform_create(self, serializer):
        # Ensure the user is a doctor and can only create slots for themselves
        if self.request.user.role == 'doctor':
            doctor = Doctor.objects.get(user=self.request.user)
            serializer.save(doctor=doctor)
        else:
            raise PermissionError("Only doctors can create time slots")