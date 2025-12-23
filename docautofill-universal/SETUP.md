# DocAutofill Universal - Production Setup Guide

This guide will help you set up DocAutofill Universal with a complete Supabase backend for production use.

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project
3. **API Keys**: Get your project URL and anon key from Settings → API

## Step 1: Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

## Step 2: Database Setup

Execute these SQL commands in your Supabase SQL Editor:

### Create Core Tables

```sql
-- Universal Documents Table
CREATE TABLE IF NOT EXISTS universal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_name TEXT NOT NULL,
  document_category TEXT NOT NULL CHECK (document_category IN ('government', 'legal', 'business', 'healthcare', 'financial', 'personal')),
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'completed', 'error')),
  confidence_score DECIMAL(3,2),
  fields_detected INTEGER,
  fields_extracted JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  document_category TEXT NOT NULL CHECK (document_category IN ('government', 'legal', 'business', 'healthcare', 'financial', 'personal')),
  template_fields JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE universal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for universal_documents
CREATE POLICY "Users can view their own documents" ON universal_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON universal_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON universal_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON universal_documents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for document_templates
CREATE POLICY "Users can view public templates or their own" ON document_templates
  FOR SELECT USING (is_public = TRUE OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own templates" ON document_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON document_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON document_templates
  FOR DELETE USING (auth.uid() = created_by);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_universal_documents_user_id ON universal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_universal_documents_category ON universal_documents(document_category);
CREATE INDEX IF NOT EXISTS idx_universal_documents_status ON universal_documents(status);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(document_category);
```

## Step 3: Storage Bucket Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `documents`
3. Set bucket to public (for public file access)
4. Configure allowed file types:
   - PDF: `application/pdf`
   - Documents: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Text: `text/plain`
   - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
5. Set file size limit: 50MB (52428800 bytes)

### Storage Policies

Add these policies in Storage → Policies:

```sql
-- Allow public read access to documents
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 4: Edge Functions (Optional)

If you want to use AI document processing, deploy the included edge functions:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-id`
4. Deploy functions: `supabase functions deploy`

## Step 5: Build and Deploy

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy to your hosting platform (Vercel, Netlify, etc.)
4. Set environment variables in your hosting platform

## Step 6: Test the Setup

1. Visit your deployed application
2. Check that the configuration banner disappears
3. Register a new account
4. Try uploading a document
5. Test category navigation and document management

## Troubleshooting

### Common Issues

1. **"Supabase configuration required" banner appears**:
   - Check that your `.env` file has valid Supabase credentials
   - Ensure the URL ends with `.supabase.co`
   - Verify the anon key is correct (should be ~50+ characters)

2. **Authentication errors**:
   - Check that RLS policies are enabled
   - Verify user registration is enabled in Supabase Auth settings

3. **Upload failures**:
   - Ensure the `documents` storage bucket exists
   - Check storage policies are correctly configured
   - Verify file size and type restrictions

4. **Database errors**:
   - Confirm all tables were created successfully
   - Check that RLS policies match the exact table names

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anon key from Settings → API | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Features Enabled

Once properly configured, your DocAutofill Universal app will have:

- ✅ Real user authentication and registration
- ✅ Document upload with category assignment
- ✅ AI-powered field detection and extraction
- ✅ Document template management
- ✅ Universal document categories (Government, Legal, Business, Healthcare, Financial, Personal)
- ✅ Real-time data persistence
- ✅ Secure file storage
- ✅ User-specific document access

## Support

For issues with this setup guide, please check:
1. Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Your Supabase project logs
3. Browser console for detailed error messages
