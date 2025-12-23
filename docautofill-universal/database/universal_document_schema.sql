-- Universal Document Automation Schema for DocAutofill
-- Extends the existing DMV schema to support ANY document type

-- Enhanced Personal Data (extending beyond DMV)
CREATE TABLE universal_personal_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Basic Identity
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  ssn_encrypted TEXT,
  sin_encrypted TEXT, -- Social Insurance Number (Canada)
  tax_id TEXT,
  
  -- Contact Information
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,
  alternative_email TEXT,
  street_address TEXT,
  apartment_number TEXT,
  city TEXT,
  state_province TEXT,
  postal_zip_code TEXT,
  country TEXT,
  
  -- Professional Information
  employer_name TEXT,
  job_title TEXT,
  work_email TEXT,
  work_phone TEXT,
  work_address TEXT,
  employment_start_date DATE,
  salary DECIMAL(10,2),
  hourly_rate DECIMAL(8,2),
  
  -- Financial Information
  bank_name TEXT,
  account_type TEXT,
  account_number_masked TEXT,
  routing_number_masked TEXT,
  credit_score INTEGER,
  annual_income DECIMAL(12,2),
  net_worth DECIMAL(12,2),
  
  -- Medical Information
  health_insurance_provider TEXT,
  health_insurance_policy TEXT,
  health_insurance_group TEXT,
  medical_record_number TEXT,
  blood_type TEXT,
  allergies TEXT,
  medications TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_email TEXT,
  emergency_contact_address TEXT,
  
  -- Education
  education_level TEXT,
  school_name TEXT,
  degree TEXT,
  graduation_year INTEGER,
  gpa DECIMAL(3,2),
  
  -- Legal Information
  legal_name TEXT,
  court_case_number TEXT,
  attorney_name TEXT,
  attorney_phone TEXT,
  
  -- Additional Custom Fields (JSON for flexibility)
  custom_fields JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Categories for Universal Support
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Universal Document Templates
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES document_categories(id),
  description TEXT,
  
  -- Template Metadata
  file_path TEXT,
  file_type TEXT,
  original_filename TEXT,
  file_size INTEGER,
  
  -- AI Learning Data
  field_mappings JSONB, -- Maps document fields to data types
  confidence_thresholds JSONB,
  validation_rules JSONB,
  
  -- Usage Statistics
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_confidence_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Template Status
  is_public BOOLEAN DEFAULT false,
  is_learned BOOLEAN DEFAULT false, -- Has been trained on multiple documents
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Universal Documents (any document type)
CREATE TABLE universal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Document Identification
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, docx, jpg, png, etc.
  file_size INTEGER,
  category_id UUID REFERENCES document_categories(id),
  template_id UUID REFERENCES document_templates(id),
  
  -- AI Processing Results
  ai_analysis JSONB, -- Raw AI analysis results
  detected_fields JSONB, -- All fields detected by AI
  field_confidence JSONB, -- Confidence scores for each field
  document_type TEXT, -- AI-determined document type
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Field Mapping & Filling
  field_mappings JSONB, -- User corrections to AI detection
  filled_data JSONB, -- Final filled data
  auto_fill_confidence DECIMAL(5,2), -- Overall confidence score
  
  -- Processing Details
  processing_time_seconds INTEGER,
  ai_provider TEXT, -- openai, claude, google_vision
  error_message TEXT,
  
  -- Status & Lifecycle
  status TEXT DEFAULT 'uploaded', -- uploaded, processing, ready, filled, exported
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Document Processing Jobs (for async processing)
CREATE TABLE document_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES universal_documents(id),
  user_id UUID NOT NULL,
  
  -- Job Details
  job_type TEXT NOT NULL, -- ocr, field_detection, auto_fill, validation
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  
  -- AI Provider Information
  provider TEXT, -- openai, claude, google_vision
  provider_job_id TEXT,
  
  -- Results
  result JSONB,
  error_message TEXT,
  confidence_score DECIMAL(5,2),
  
  -- Timing
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processing_time_ms INTEGER
);

-- Field Definitions (for universal field mapping)
CREATE TABLE field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  data_type TEXT NOT NULL, -- text, date, number, email, phone, etc.
  category TEXT, -- personal, professional, financial, medical, etc.
  is_required BOOLEAN DEFAULT false,
  validation_pattern TEXT,
  description TEXT,
  examples TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Field Extractions (what was extracted from documents)
CREATE TABLE document_field_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES universal_documents(id),
  field_definition_id UUID REFERENCES field_definitions(id),
  
  -- Extraction Details
  extracted_value TEXT,
  confidence_score DECIMAL(5,2),
  extraction_method TEXT, -- ai, manual, regex
  
  -- Location Information
  page_number INTEGER,
  x_coordinate DECIMAL(10,2),
  y_coordinate DECIMAL(10,2),
  width DECIMAL(10,2),
  height DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-fill Results
CREATE TABLE document_auto_fill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES universal_documents(id),
  user_id UUID NOT NULL,
  
  -- Fill Results
  total_fields INTEGER,
  auto_filled_fields INTEGER,
  manual_fields INTEGER,
  failed_fields INTEGER,
  
  -- Confidence Metrics
  overall_confidence DECIMAL(5,2),
  field_confidences JSONB, -- Confidence per field
  
  -- Final Data
  final_data JSONB,
  export_filename TEXT,
  export_file_path TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Document Categories
INSERT INTO document_categories (name, description, icon, color) VALUES
('Government Forms', 'DMV, Social Security, IRS, immigration forms', 'government', '#3B82F6'),
('Legal Documents', 'Contracts, agreements, court documents', 'scale', '#8B5CF6'),
('Business Forms', 'Invoicing, compliance, HR documents', 'briefcase', '#10B981'),
('Healthcare Forms', 'Medical records, insurance, prescriptions', 'heart', '#EF4444'),
('Financial Documents', 'Banking, loans, investments, tax forms', 'dollar-sign', '#F59E0B'),
('Personal Forms', 'Applications, registrations, personal documents', 'user', '#6B7280'),
('Education Forms', 'School applications, transcripts, financial aid', 'graduation-cap', '#EC4899'),
('Insurance Forms', 'Auto, health, life, property insurance', 'shield', '#06B6D4');

-- Insert Default Field Definitions
INSERT INTO field_definitions (name, data_type, category, description) VALUES
('First Name', 'text', 'personal', 'Person''s first/given name'),
('Last Name', 'text', 'personal', 'Person''s last/family name'),
('Full Name', 'text', 'personal', 'Complete legal name'),
('Date of Birth', 'date', 'personal', 'Person''s birth date'),
('Social Security Number', 'ssn', 'personal', 'US Social Security Number'),
('Email Address', 'email', 'contact', 'Primary email address'),
('Phone Number', 'phone', 'contact', 'Primary phone number'),
('Street Address', 'address', 'contact', 'Street address line 1'),
('City', 'text', 'contact', 'City name'),
('State/Province', 'text', 'contact', 'State or province'),
('ZIP/Postal Code', 'text', 'contact', 'ZIP code or postal code'),
('Employer Name', 'text', 'professional', 'Name of employer or company'),
('Job Title', 'text', 'professional', 'Job position or title'),
('Annual Income', 'currency', 'financial', 'Yearly income amount'),
('Bank Account Number', 'account', 'financial', 'Bank account number'),
('License Number', 'text', 'professional', 'Professional license number'),
('Medical Record Number', 'text', 'medical', 'Healthcare record identifier'),
('Policy Number', 'text', 'insurance', 'Insurance policy number');

-- Enable RLS on all new tables
ALTER TABLE universal_personal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_field_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_auto_fill_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Universal Personal Data
CREATE POLICY "Users can manage own universal data" ON universal_personal_data FOR ALL USING (auth.uid() = user_id);

-- Document Categories (read-only for users)
CREATE POLICY "Anyone can view document categories" ON document_categories FOR SELECT USING (true);

-- Document Templates
CREATE POLICY "Users can view public templates" ON document_templates FOR SELECT USING (is_public = true OR auth.uid()::text = created_by::text);
CREATE POLICY "Users can manage own templates" ON document_templates FOR ALL USING (auth.uid()::text = created_by::text);

-- Universal Documents
CREATE POLICY "Users can manage own documents" ON universal_documents FOR ALL USING (auth.uid() = user_id);

-- Document Processing Jobs
CREATE POLICY "Users can view own processing jobs" ON document_processing_jobs FOR SELECT USING (auth.uid() = user_id);

-- Field Definitions (read-only for users)
CREATE POLICY "Anyone can view field definitions" ON field_definitions FOR SELECT USING (true);

-- Document Field Extractions
CREATE POLICY "Users can view own extractions" ON document_field_extractions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM universal_documents 
      WHERE universal_documents.id = document_field_extractions.document_id 
      AND universal_documents.user_id = auth.uid()
    )
  );

-- Document Auto-fill Results
CREATE POLICY "Users can manage own fill results" ON document_auto_fill_results FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_universal_documents_user_id ON universal_documents(user_id);
CREATE INDEX idx_universal_documents_category ON universal_documents(category_id);
CREATE INDEX idx_universal_documents_status ON universal_documents(status);
CREATE INDEX idx_document_processing_jobs_status ON document_processing_jobs(status);
CREATE INDEX idx_document_processing_jobs_user_id ON document_processing_jobs(user_id);

-- Functions for document processing workflow
CREATE OR REPLACE FUNCTION get_document_confidence(document_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  avg_confidence DECIMAL(5,2);
BEGIN
  SELECT AVG(
    CASE 
      WHEN confidence_score IS NOT NULL THEN confidence_score 
      ELSE 0.0 
    END
  ) INTO avg_confidence
  FROM document_field_extractions
  WHERE document_id = document_uuid;
  
  RETURN COALESCE(avg_confidence, 0.0);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's universal data as JSON
CREATE OR REPLACE FUNCTION get_universal_user_data(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  data_record RECORD;
  result JSONB;
BEGIN
  SELECT * INTO data_record 
  FROM universal_personal_data 
  WHERE user_id = user_uuid;
  
  IF data_record IS NULL THEN
    RETURN '{}'::JSONB;
  END IF;
  
  -- Convert record to JSON, excluding internal fields
  result = to_jsonb(data_record) - 'id' - 'user_id' - 'created_at' - 'updated_at';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update template statistics
CREATE OR REPLACE FUNCTION update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE document_templates 
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = NEW.template_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_stats
  AFTER INSERT ON universal_documents
  FOR EACH ROW
  WHEN (NEW.template_id IS NOT NULL)
  EXECUTE FUNCTION update_template_stats();
