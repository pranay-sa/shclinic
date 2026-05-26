CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('frontdesk_exec', 'doctor', 'lab_technician', 'clinic_admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_clinics (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, clinic_id)
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_code TEXT UNIQUE NOT NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  address_line TEXT,
  city TEXT,
  state TEXT,
  pin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_code TEXT UNIQUE NOT NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  visit_type TEXT NOT NULL DEFAULT 'follow_up',
  status TEXT NOT NULL CHECK (status IN ('booked', 'in_progress', 'done', 'cancelled')) DEFAULT 'booked',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);

CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  status TEXT NOT NULL CHECK (status IN ('waiting', 'sent_to_doctor', 'completed')) DEFAULT 'waiting',
  position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  author_user_id UUID REFERENCES users(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('prescription', 'bill', 'image_report', 'text_report')),
  title TEXT NOT NULL,
  ref_code TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('S&H', 'Other')),
  file_name TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  eta_at TIMESTAMPTZ,
  category TEXT NOT NULL,
  tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  sample_id TEXT NOT NULL,
  sample_status TEXT NOT NULL CHECK (sample_status IN ('pending', 'active', 'done')) DEFAULT 'pending',
  process_status TEXT NOT NULL CHECK (process_status IN ('pending', 'active', 'done')) DEFAULT 'pending',
  report_status TEXT NOT NULL CHECK (report_status IN ('pending', 'active', 'done')) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_code TEXT UNIQUE NOT NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  lines JSONB NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  coins NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('card', 'upi', 'cash')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
