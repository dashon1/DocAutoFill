-- Migration: create_docautofill_tables
-- Created at: 1765785101

-- User profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal data table (encrypted sensitive information)
CREATE TABLE personal_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  date_of_birth DATE,
  ssn_encrypted TEXT,
  email TEXT,
  phone TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver's license information
CREATE TABLE license_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  license_number TEXT,
  license_class TEXT,
  issued_date DATE,
  expiration_date DATE,
  restrictions TEXT,
  endorsements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle information
CREATE TABLE vehicle_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vin TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  license_plate TEXT,
  odometer_reading INTEGER,
  registration_number TEXT,
  registration_expiration DATE,
  title_number TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance information
CREATE TABLE insurance_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT,
  policy_number TEXT,
  coverage_type TEXT,
  policy_start_date DATE,
  policy_expiration DATE,
  agent_name TEXT,
  agent_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processed documents/forms
CREATE TABLE processed_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  form_type TEXT NOT NULL,
  form_name TEXT,
  original_filename TEXT,
  processed_filename TEXT,
  confidence_score DECIMAL(5,2),
  status TEXT DEFAULT 'pending',
  fields_detected INTEGER,
  fields_filled INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own personal data" ON personal_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own license info" ON license_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vehicle info" ON vehicle_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own insurance info" ON insurance_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own processed forms" ON processed_forms FOR ALL USING (auth.uid() = user_id);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();;