from django.urls import path
from . import views

urlpatterns = [
    path('', views.DoctorListView.as_view(), name='doctor-list'),
    path('<int:pk>/', views.DoctorDetailView.as_view(), name='doctor-detail'),
    path('<int:doctor_id>/availability/', views.doctor_availability, name='doctor-availability'),
    path('time-slots/', views.TimeSlotListCreateView.as_view(), name='time-slot-list-create'),
]