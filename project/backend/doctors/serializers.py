from rest_framework import serializers
from accounts.serializers import UserProfileSerializer
from .models import Doctor, TimeSlot

class TimeSlotSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_available']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'specialization', 'experience', 'qualifications',
            'consultation_fee', 'bio', 'is_available', 'time_slots',
            'rating', 'review_count', 'created_at'
        ]

    def get_rating(self, obj):
        # TODO: Calculate actual rating from reviews
        return 4.5

    def get_review_count(self, obj):
        # TODO: Count actual reviews
        return 25

class DoctorCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['specialization', 'experience', 'qualifications', 'consultation_fee', 'bio', 'is_available']