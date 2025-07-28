from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer, PatientCreateUpdateSerializer

class PatientListView(generics.ListAPIView):
    queryset = Patient.objects.select_related('user')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Patient.objects.select_related('user')
        elif user.role == 'doctor':
            # Doctors can see patients who have appointments with them
            return Patient.objects.filter(
                appointments__doctor__user=user
            ).distinct().select_related('user')
        else:
            # Patients can only see their own profile
            return Patient.objects.filter(user=user).select_related('user')

class PatientDetailView(generics.RetrieveUpdateAPIView):
    queryset = Patient.objects.select_related('user')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PatientCreateUpdateSerializer
        return PatientSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'doctor']:
            return Patient.objects.select_related('user')
        else:
            return Patient.objects.filter(user=user).select_related('user')