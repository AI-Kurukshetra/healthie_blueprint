-- CareSync Database Schema
-- Run this in Supabase SQL Editor after creating the project

-- ============================================
-- PROFILES (auto-created on signup via trigger)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('patient', 'provider', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (needed for displaying names in appointments, etc.)
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- PROVIDER DETAILS
-- ============================================
CREATE TABLE public.provider_details (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  specialization TEXT,
  license_number TEXT,
  bio TEXT
);

ALTER TABLE public.provider_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider details viewable by authenticated" ON public.provider_details
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Providers can update own details" ON public.provider_details
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Providers can insert own details" ON public.provider_details
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PATIENT DETAILS
-- ============================================
CREATE TABLE public.patient_details (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  blood_type TEXT,
  emergency_contact TEXT,
  insurance_provider TEXT,
  insurance_id TEXT
);

ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;

-- Patients see own details, providers see their patients', admins see all
CREATE POLICY "Patients view own details" ON public.patient_details
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Providers view assigned patients' details" ON public.patient_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patient_details.id
      AND appointments.provider_id = auth.uid()
    )
  );

CREATE POLICY "Admins view all patient details" ON public.patient_details
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Patients update own details" ON public.patient_details
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients insert own details" ON public.patient_details
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  type TEXT DEFAULT 'initial' CHECK (type IN ('initial', 'follow_up', 'consultation')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients see own appointments
CREATE POLICY "Patients view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

-- Providers see their appointments
CREATE POLICY "Providers view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = provider_id);

-- Admins see all appointments
CREATE POLICY "Admins view all appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Patients can create appointments (book)
CREATE POLICY "Patients can book appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Providers can update their appointments (status changes, etc.)
CREATE POLICY "Providers can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = provider_id);

-- Patients can update their appointments (cancel)
CREATE POLICY "Patients can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- CLINICAL NOTES (SOAP format)
-- ============================================
CREATE TABLE public.clinical_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  subjective TEXT NOT NULL,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

-- Providers see notes they wrote
CREATE POLICY "Providers view own notes" ON public.clinical_notes
  FOR SELECT USING (auth.uid() = provider_id);

-- Patients can view notes about them (read-only)
CREATE POLICY "Patients view own notes" ON public.clinical_notes
  FOR SELECT USING (auth.uid() = patient_id);

-- Admins see all
CREATE POLICY "Admins view all notes" ON public.clinical_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only providers can create notes
CREATE POLICY "Providers create notes" ON public.clinical_notes
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- Only the authoring provider can update notes
CREATE POLICY "Providers update own notes" ON public.clinical_notes
  FOR UPDATE USING (auth.uid() = provider_id);

CREATE TRIGGER clinical_notes_updated_at
  BEFORE UPDATE ON public.clinical_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- MEDICAL RECORDS
-- ============================================
CREATE TABLE public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('condition', 'medication', 'allergy')),
  name TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'discontinued')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Patients view own records
CREATE POLICY "Patients view own records" ON public.medical_records
  FOR SELECT USING (auth.uid() = patient_id);

-- Providers view assigned patients' records
CREATE POLICY "Providers view assigned patients' records" ON public.medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = medical_records.patient_id
      AND appointments.provider_id = auth.uid()
    )
  );

-- Admins view all
CREATE POLICY "Admins view all records" ON public.medical_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Providers can create records for their patients
CREATE POLICY "Providers create records" ON public.medical_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = medical_records.patient_id
      AND appointments.provider_id = auth.uid()
    )
  );

-- Providers can update records they have access to
CREATE POLICY "Providers update accessible records" ON public.medical_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = medical_records.patient_id
      AND appointments.provider_id = auth.uid()
    )
  );

CREATE TRIGGER medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users see messages they sent or received
CREATE POLICY "Users view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Receiver can mark as read
CREATE POLICY "Receiver can update messages" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Admins see all
CREATE POLICY "Admins view all messages" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- AVAILABILITY
-- ============================================
CREATE TABLE public.availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.profiles(id) NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Everyone can view availability (needed for booking)
CREATE POLICY "Availability viewable by authenticated" ON public.availability
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Providers manage own availability
CREATE POLICY "Providers manage own availability" ON public.availability
  FOR ALL USING (auth.uid() = provider_id);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX idx_appointments_date_time ON public.appointments(date_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_clinical_notes_appointment_id ON public.clinical_notes(appointment_id);
CREATE INDEX idx_clinical_notes_provider_id ON public.clinical_notes(provider_id);
CREATE INDEX idx_clinical_notes_patient_id ON public.clinical_notes(patient_id);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_availability_provider_id ON public.availability(provider_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
