-- Migration: create_docautofill_universal_tables
-- Created at: 1765785129

-- DocAutofill Universal Document Automation Tables

-- Personal data table (encrypted sensitive information)
CREATE TABLE docautofill_personal_data (
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
  employment_info JSONB,
  medical_info JSONB,
  legal_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver's license information
CREATE TABLE docautofill_license_info (
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
CREATE TABLE docautofill_vehicle_info (
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
CREATE TABLE docautofill_insurance_info (
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

-- Universal documents/forms (supports any document type)
CREATE TABLE docautofill_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL, -- 'government', 'legal', 'business', 'healthcare', 'financial', 'personal'
  form_type TEXT NOT NULL,
  form_name TEXT,
  original_filename TEXT,
  processed_filename TEXT,
  file_path TEXT,
  confidence_score DECIMAL(5,2),
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  fields_detected INTEGER,
  fields_filled INTEGER,
  ai_analysis JSONB, -- Store AI analysis results
  template_id UUID, -- Reference to saved templates
  is_template BOOLEAN DEFAULT false,
  template_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document templates (for saving and reusing document types)
CREATE TABLE docautofill_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  form_type TEXT NOT NULL,
  field_mappings JSONB, -- Maps AI-detected fields to data types
  sample_file_path TEXT,
  confidence_threshold DECIMAL(5,2) DEFAULT 80.00,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE docautofill_user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  default_document_type TEXT DEFAULT 'personal',
  auto_process BOOLEAN DEFAULT true,
  save_templates BOOLEAN DEFAULT true,
  data_encryption BOOLEAN DEFAULT true,
  notification_preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE docautofill_personal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE docautofill_license_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE docautofill_vehicle_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE docautofill_insurance_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE docautofill_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE docautofill_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE docautofill_user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage own personal data" ON docautofill_personal_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own license info" ON docautofill_license_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vehicle info" ON docautofill_vehicle_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own insurance info" ON docautofill_insurance_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents" ON docautofill_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own templates" ON docautofill_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON docautofill_user_settings FOR ALL USING (auth.uid() = user_id);

-- Allow public read access to public templates
CREATE POLICY "Public can view public templates" ON docautofill_templates FOR SELECT USING (is_public = true);

-- Create functions for automatic user setup
CREATE OR REPLACE FUNCTION docautofill_handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO docautofill_user_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user setup
CREATE TRIGGER docautofill_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE docautofill_handle_new_user();;