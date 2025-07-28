/*
  # Hospital Appointment Booking System Database Schema

  1. New Tables
    - `users` - Extended user profiles with role-based access
    - `doctors` - Doctor-specific information and qualifications
    - `patients` - Patient-specific medical information
    - `appointments` - Appointment bookings and scheduling
    - `time_slots` - Doctor availability time slots

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure patient data access

  3. Features
    - JWT authentication integration
    - Real-time appointment updates
    - Email notification triggers
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  experience integer NOT NULL CHECK (experience >= 0),
  qualifications text NOT NULL,
  consultation_fee decimal(10,2) NOT NULL CHECK (consultation_fee >= 0),
  bio text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth date NOT NULL,
  medical_history text,
  emergency_contact text,
  blood_group text,
  allergies text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, day_of_week, start_time)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  reason text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, appointment_date, start_time)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors policies
CREATE POLICY "Anyone can read available doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all doctors"
  ON doctors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients policies
CREATE POLICY "Patients can read own profile"
  ON patients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Patients can update own profile"
  ON patients FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Doctors can read their patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = patients.id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all patients"
  ON patients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Time slots policies
CREATE POLICY "Anyone can read time slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can manage own time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE id = doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Appointments policies
CREATE POLICY "Patients can read own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE id = patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can read their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE id = doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE id = patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE id = patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE id = doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (id, email, first_name, last_name, phone, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'patient@demo.com', 'John', 'Doe', '+1234567890', 'patient'),
  ('22222222-2222-2222-2222-222222222222', 'doctor@demo.com', 'Sarah', 'Smith', '+1234567891', 'doctor'),
  ('33333333-3333-3333-3333-333333333333', 'admin@demo.com', 'Admin', 'User', '+1234567892', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (user_id, specialization, experience, qualifications, consultation_fee, bio) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Cardiology', 15, 'MD, FACC, FSCAI', 150.00, 'Experienced cardiologist specializing in interventional cardiology.')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO patients (user_id, date_of_birth, medical_history) VALUES
  ('11111111-1111-1111-1111-111111111111', '1990-01-01', 'No significant medical history')
ON CONFLICT (user_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_is_available ON doctors(is_available);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_doctor_id ON time_slots(doctor_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_day_of_week ON time_slots(day_of_week);