from rest_framework import serializers
from doctors.serializers import DoctorSerializer
from patients.serializers import PatientSerializer
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    patient_id = serializers.IntegerField(write_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'patient_id', 'doctor_id',
            'appointment_date', 'start_time', 'end_time', 'status',
            'reason', 'notes', 'duration_minutes', 'created_at', 'updated_at'
        ]

    def validate(self, attrs):
        # Check for conflicting appointments
        doctor_id = attrs.get('doctor_id')
        appointment_date = attrs.get('appointment_date')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        
        if self.instance:
            # Exclude current appointment from conflict check during updates
            conflicting_appointments = Appointment.objects.filter(
                doctor_id=doctor_id,
                appointment_date=appointment_date,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            ).exclude(id=self.instance.id)
        else:
            conflicting_appointments = Appointment.objects.filter(
                doctor_id=doctor_id,
                appointment_date=appointment_date,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            )
        
        if conflicting_appointments.exists():
            raise serializers.ValidationError("This time slot is already booked")
        
        return attrs

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['doctor_id', 'appointment_date', 'start_time', 'end_time', 'reason']

    def create(self, validated_data):
        # Get patient from request user
        user = self.context['request'].user
        from patients.models import Patient
        patient = Patient.objects.get(user=user)
        validated_data['patient'] = patient
        return super().create(validated_data)