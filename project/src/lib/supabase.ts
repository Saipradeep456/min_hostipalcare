import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
          role: 'patient' | 'doctor' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
          role: 'patient' | 'doctor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          role?: 'patient' | 'doctor' | 'admin';
          updated_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          user_id: string;
          specialization: string;
          experience: number;
          qualifications: string;
          consultation_fee: number;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specialization: string;
          experience: number;
          qualifications: string;
          consultation_fee: number;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          specialization?: string;
          experience?: number;
          qualifications?: string;
          consultation_fee?: number;
          bio?: string | null;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          date_of_birth: string;
          medical_history: string | null;
          emergency_contact: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date_of_birth: string;
          medical_history?: string | null;
          emergency_contact?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date_of_birth?: string;
          medical_history?: string | null;
          emergency_contact?: string | null;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          reason: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          reason: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          appointment_date?: string;
          start_time?: string;
          end_time?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          reason?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          doctor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}