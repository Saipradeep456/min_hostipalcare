from django.urls import path
from . import views

urlpatterns = [
    path('', views.AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:appointment_id>/cancel/', views.cancel_appointment, name='cancel-appointment'),
    path('<int:appointment_id>/send-confirmation/', views.send_confirmation, name='send-confirmation'),
    path('<int:appointment_id>/send-reminder/', views.send_reminder, name='send-reminder'),
]