-- Migration: fix_universal_document_schema_and_storage_policies
-- Created at: 1765785952

-- Fix universal document schema to match application expectations

-- Update docautofill_documents table structure
ALTER TABLE docautofill_documents 
DROP COLUMN IF EXISTS document_type,
DROP COLUMN IF EXISTS form_type,
DROP COLUMN IF EXISTS form_name,
DROP COLUMN IF EXISTS processed_filename,
DROP COLUMN IF EXISTS fields_filled,
DROP COLUMN IF EXISTS ai_analysis,
DROP COLUMN IF EXISTS template_id,
DROP COLUMN IF EXISTS is_template,
DROP COLUMN IF EXISTS template_name;

-- Add missing columns to match application expectations
ALTER TABLE docautofill_documents 
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_category TEXT CHECK (document_category IN ('government', 'legal', 'business', 'healthcare', 'financial', 'personal')),
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS original_filename TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fields_extracted JSONB;

-- Update docautofill_templates table structure
ALTER TABLE docautofill_templates 
DROP COLUMN IF EXISTS document_type,
DROP COLUMN IF EXISTS form_type,
DROP COLUMN IF EXISTS field_mappings,
DROP COLUMN IF EXISTS sample_file_path,
DROP COLUMN IF EXISTS confidence_threshold;

-- Add missing columns to match application expectations
ALTER TABLE docautofill_templates 
ADD COLUMN IF NOT EXISTS document_category TEXT CHECK (document_category IN ('government', 'legal', 'business', 'healthcare', 'financial', 'personal')),
ADD COLUMN IF NOT EXISTS template_fields JSONB,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing data
UPDATE docautofill_documents SET 
  document_category = COALESCE(document_type, 'personal'),
  document_name = COALESCE(form_name, 'Untitled Document'),
  uploaded_at = created_at,
  processed_at = CASE WHEN status = 'completed' THEN updated_at ELSE NULL END
WHERE document_category IS NULL;

UPDATE docautofill_templates SET 
  document_category = COALESCE(document_type, 'personal'),
  template_fields = COALESCE(field_mappings, '[]'::jsonb)
WHERE document_category IS NULL;

-- Create storage policies for docautofill-documents bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'docautofill-documents' AND auth.role() = 'authenticated'
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects FOR SELECT USING (
  bucket_id = 'docautofill-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE USING (
  bucket_id = 'docautofill-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (
  bucket_id = 'docautofill-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to files (for sharing processed documents)
CREATE POLICY "Public can read files" ON storage.objects FOR SELECT USING (
  bucket_id = 'docautofill-documents'
);;