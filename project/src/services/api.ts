import { supabase } from '../lib/supabase';
import { User, Doctor, Patient, Appointment, TimeSlot } from '../types';

const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

// Django API Service
class DjangoAPIService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('hospital_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${DJANGO_API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  // Users
  async getProfile() {
    return this.request('/users/profile/');
  }

  async updateProfile(userData: Partial<User>) {
    return this.request('/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Doctors
  async getDoctors(filters?: { specialization?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.specialization) params.append('specialization', filters.specialization);
    if (filters?.search) params.append('search', filters.search);
    
    return this.request(`/doctors/?${params.toString()}`);
  }

  async getDoctorById(id: string) {
    return this.request(`/doctors/${id}/`);
  }

  async getDoctorAvailability(doctorId: string, date: string) {
    return this.request(`/doctors/${doctorId}/availability/?date=${date}`);
  }

  // Appointments
  async getAppointments(filters?: { status?: string; date?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    
    return this.request(`/appointments/?${params.toString()}`);
  }

  async createAppointment(appointmentData: Partial<Appointment>) {
    return this.request('/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: string, appointmentData: Partial<Appointment>) {
    return this.request(`/appointments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(appointmentData),
    });
  }

  async cancelAppointment(id: string) {
    return this.request(`/appointments/${id}/cancel/`, {
      method: 'POST',
    });
  }

  // Time Slots
  async getTimeSlots(doctorId: string) {
    return this.request(`/time-slots/?doctor_id=${doctorId}`);
  }

  async createTimeSlot(timeSlotData: Partial<TimeSlot>) {
    return this.request('/time-slots/', {
      method: 'POST',
      body: JSON.stringify(timeSlotData),
    });
  }

  async updateTimeSlot(id: string, timeSlotData: Partial<TimeSlot>) {
    return this.request(`/time-slots/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(timeSlotData),
    });
  }

  // Email Notifications
  async sendAppointmentConfirmation(appointmentId: string) {
    return this.request(`/appointments/${appointmentId}/send-confirmation/`, {
      method: 'POST',
    });
  }

  async sendAppointmentReminder(appointmentId: string) {
    return this.request(`/appointments/${appointmentId}/send-reminder/`, {
      method: 'POST',
    });
  }
}

// Supabase Service
class SupabaseService {
  // Authentication
  async signUp(email: string, password: string, userData: any) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: userData.role,
        });

      if (profileError) throw profileError;

      // Create role-specific profile
      if (userData.role === 'doctor') {
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({
            user_id: authData.user.id,
            specialization: userData.specialization,
            experience: parseInt(userData.experience),
            qualifications: userData.qualifications || '',
            consultation_fee: userData.consultationFee || 100,
          });

        if (doctorError) throw doctorError;
      } else if (userData.role === 'patient') {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: authData.user.id,
            date_of_birth: userData.dateOfBirth,
            medical_history: userData.medicalHistory || null,
          });

        if (patientError) throw patientError;
      }
    }

    return authData;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return { ...data, profile };
    }

    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return { user, profile };
    }

    return { user: null, profile: null };
  }

  // Doctors
  async getDoctors(filters?: { specialization?: string; search?: string }) {
    let query = supabase
      .from('doctors')
      .select(`
        *,
        users!inner(*)
      `);

    if (filters?.specialization) {
      query = query.eq('specialization', filters.specialization);
    }

    if (filters?.search) {
      query = query.or(`users.first_name.ilike.%${filters.search}%,users.last_name.ilike.%${filters.search}%,specialization.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }

  async getDoctorById(id: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users!inner(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Appointments
  async getAppointments(userId: string, userRole: string, filters?: { status?: string }) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients!inner(
          *,
          users!inner(*)
        ),
        doctors!inner(
          *,
          users!inner(*)
        )
      `);

    if (userRole === 'patient') {
      query = query.eq('patients.user_id', userId);
    } else if (userRole === 'doctor') {
      query = query.eq('doctors.user_id', userId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true });
    if (error) throw error;

    return data;
  }

  async createAppointment(appointmentData: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    reason: string;
  }) {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointmentData.patientId,
        doctor_id: appointmentData.doctorId,
        appointment_date: appointmentData.appointmentDate,
        start_time: appointmentData.startTime,
        end_time: appointmentData.endTime,
        reason: appointmentData.reason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Time Slots
  async getTimeSlots(doctorId: string) {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctorId);

    if (error) throw error;
    return data;
  }

  async createTimeSlot(timeSlotData: Partial<TimeSlot>) {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(timeSlotData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Export services
export const djangoAPI = new DjangoAPIService();
export const supabaseService = new SupabaseService();

// Hybrid service that uses both Django and Supabase
export class HybridAPIService {
  // Use Supabase for authentication and real-time features
  // Use Django for complex business logic and email notifications

  async login(email: string, password: string) {
    try {
      // Try Supabase first for authentication
      const supabaseResult = await supabaseService.signIn(email, password);
      return supabaseResult;
    } catch (error) {
      // Fallback to Django API
      console.warn('Supabase login failed, trying Django API:', error);
      return await djangoAPI.login(email, password);
    }
  }

  async register(userData: any) {
    try {
      // Use Supabase for user registration
      return await supabaseService.signUp(userData.email, userData.password, userData);
    } catch (error) {
      // Fallback to Django API
      console.warn('Supabase registration failed, trying Django API:', error);
      return await djangoAPI.register(userData);
    }
  }

  async getDoctors(filters?: { specialization?: string; search?: string }) {
    try {
      return await supabaseService.getDoctors(filters);
    } catch (error) {
      console.warn('Supabase getDoctors failed, trying Django API:', error);
      return await djangoAPI.getDoctors(filters);
    }
  }

  async createAppointment(appointmentData: any) {
    try {
      // Create appointment in Supabase
      const appointment = await supabaseService.createAppointment(appointmentData);
      
      // Send confirmation email via Django API
      try {
        await djangoAPI.sendAppointmentConfirmation(appointment.id);
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      return appointment;
    } catch (error) {
      console.warn('Supabase createAppointment failed, trying Django API:', error);
      return await djangoAPI.createAppointment(appointmentData);
    }
  }

  async getAppointments(userId: string, userRole: string, filters?: { status?: string }) {
    try {
      return await supabaseService.getAppointments(userId, userRole, filters);
    } catch (error) {
      console.warn('Supabase getAppointments failed, trying Django API:', error);
      return await djangoAPI.getAppointments(filters);
    }
  }
}

export const hybridAPI = new HybridAPIService();