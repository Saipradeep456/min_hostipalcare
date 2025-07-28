export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  createdAt: string;
}

export interface Doctor extends User {
  specialization: string;
  experience: number;
  qualifications: string;
  consultationFee: number;
  availability: TimeSlot[];
}

export interface Patient extends User {
  dateOfBirth: string;
  medicalHistory?: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
  createdAt: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}