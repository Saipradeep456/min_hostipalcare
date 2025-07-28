from rest_framework import serializers
from accounts.serializers import UserProfileSerializer
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'date_of_birth', 'age', 'medical_history',
            'emergency_contact', 'blood_group', 'allergies', 'created_at'
        ]

class PatientCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['date_of_birth', 'medical_history', 'emergency_contact', 'blood_group', 'allergies']