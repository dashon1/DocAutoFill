#!/usr/bin/env node

/**
 * DocAutofill Universal Database Setup Script
 * 
 * This script helps set up the database tables and storage bucket
 * for the DocAutofill Universal application.
 * 
 * Usage:
 *   node setup-database.js
 * 
 * Requirements:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable
 *   - Supabase CLI installed (npm install -g supabase)
 */

const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')

// Check for required environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Set them and try again:')
  console.error('   export SUPABASE_URL="https://your-project.supabase.co"')
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupDatabase() {
  console.log('🚀 Setting up DocAutofill Universal database...')
  console.log(`📡 Connected to: ${supabaseUrl}`)
  
  try {
    // Create universal_documents table
    console.log('📄 Creating universal_documents table...')
    await supabase.rpc('exec_sql', {
      query: `
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
      `
    })
    console.log('✅ universal_documents table created')

    // Create document_templates table
    console.log('📋 Creating document_templates table...')
    await supabase.rpc('exec_sql', {
      query: `
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
      `
    })
    console.log('✅ document_templates table created')

    // Enable RLS
    console.log('🔒 Enabling Row Level Security...')
    await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE universal_documents ENABLE ROW LEVEL SECURITY;
        ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
      `
    })

    // Create RLS policies for universal_documents
    console.log('🛡️ Creating RLS policies for universal_documents...')
    const policies = [
      {
        name: 'Users can view their own documents',
        definition: 'auth.uid() = user_id',
        check: null
      },
      {
        name: 'Users can insert their own documents',
        definition: null,
        check: 'auth.uid() = user_id'
      },
      {
        name: 'Users can update their own documents',
        definition: 'auth.uid() = user_id',
        check: null
      },
      {
        name: 'Users can delete their own documents',
        definition: 'auth.uid() = user_id',
        check: null
      }
    ]

    for (const policy of policies) {
      const selectClause = policy.definition ? `USING (${policy.definition})` : ''
      const checkClause = policy.check ? `WITH CHECK (${policy.check})` : ''
      
      await supabase.rpc('exec_sql', {
        query: `
          CREATE POLICY IF NOT EXISTS "${policy.name}" ON universal_documents
          FOR ALL ${selectClause} ${checkClause};
        `
      })
    }

    // Create RLS policies for document_templates
    console.log('🛡️ Creating RLS policies for document_templates...')
    await supabase.rpc('exec_sql', {
      query: `
        CREATE POLICY IF NOT EXISTS "Users can view public templates or their own" ON document_templates
        FOR SELECT USING (is_public = TRUE OR auth.uid() = created_by);

        CREATE POLICY IF NOT EXISTS "Users can insert their own templates" ON document_templates
        FOR INSERT WITH CHECK (auth.uid() = created_by);

        CREATE POLICY IF NOT EXISTS "Users can update their own templates" ON document_templates
        FOR UPDATE USING (auth.uid() = created_by);

        CREATE POLICY IF NOT EXISTS "Users can delete their own templates" ON document_templates
        FOR DELETE USING (auth.uid() = created_by);
      `
    })

    // Create indexes
    console.log('📊 Creating performance indexes...')
    await supabase.rpc('exec_sql', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_universal_documents_user_id ON universal_documents(user_id);
        CREATE INDEX IF NOT EXISTS idx_universal_documents_category ON universal_documents(document_category);
        CREATE INDEX IF NOT EXISTS idx_universal_documents_status ON universal_documents(status);
        CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(document_category);
      `
    })

    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('   1. Create a storage bucket named "documents"')
    console.log('   2. Configure storage policies for public access')
    console.log('   3. Deploy edge functions (optional)')
    console.log('   4. Test the application')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
setupDatabase()
