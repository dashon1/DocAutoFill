// DocAutofill User Manager
// Handles user authentication, profile management, and data operations

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid or expired token')
    }

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'get_user_data':
        return await getUserData(supabase, user.id)
      
      case 'update_personal_data':
        return await updatePersonalData(supabase, user.id, payload.data)
      
      case 'update_license_data':
        return await updateLicenseData(supabase, user.id, payload.data)
      
      case 'update_vehicle_data':
        return await updateVehicleData(supabase, user.id, payload.data)
      
      case 'update_insurance_data':
        return await updateInsuranceData(supabase, user.id, payload.data)
      
      case 'get_user_stats':
        return await getUserStats(supabase, user.id)
      
      case 'create_template':
        return await createTemplate(supabase, user.id, payload.template)
      
      case 'get_templates':
        return await getTemplates(supabase, user.id)
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('User manager error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Get comprehensive user data
async function getUserData(supabase: any, userId: string) {
  const [personal, license, vehicle, insurance, settings] = await Promise.all([
    supabase.from('docautofill_personal_data').select('*').eq('user_id', userId).single(),
    supabase.from('docautofill_license_info').select('*').eq('user_id', userId).single(),
    supabase.from('docautofill_vehicle_info').select('*').eq('user_id', userId).single(),
    supabase.from('docautofill_insurance_info').select('*').eq('user_id', userId).single(),
    supabase.from('docautofill_user_settings').select('*').eq('user_id', userId).single()
  ])

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        personal: personal.data,
        license: license.data,
        vehicle: vehicle.data,
        insurance: insurance.data,
        settings: settings.data
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Update personal data
async function updatePersonalData(supabase: any, userId: string, data: any) {
  const { data: result, error } = await supabase
    .from('docautofill_personal_data')
    .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      data: result,
      message: 'Personal data updated successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Update license data
async function updateLicenseData(supabase: any, userId: string, data: any) {
  const { data: result, error } = await supabase
    .from('docautofill_license_info')
    .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      data: result,
      message: 'License data updated successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Update vehicle data
async function updateVehicleData(supabase: any, userId: string, data: any) {
  const { data: result, error } = await supabase
    .from('docautofill_vehicle_info')
    .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      data: result,
      message: 'Vehicle data updated successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Update insurance data
async function updateInsuranceData(supabase: any, userId: string, data: any) {
  const { data: result, error } = await supabase
    .from('docautofill_insurance_info')
    .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      data: result,
      message: 'Insurance data updated successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Get user statistics
async function getUserStats(supabase: any, userId: string) {
  const { data: documents, error } = await supabase
    .from('docautofill_documents')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  const stats = {
    totalDocuments: documents.length,
    documentsByType: {},
    recentDocuments: documents.slice(-5).reverse(),
    averageConfidence: 0,
    completedDocuments: documents.filter(d => d.status === 'completed').length
  }

  // Calculate statistics
  for (const doc of documents) {
    if (!stats.documentsByType[doc.document_type]) {
      stats.documentsByType[doc.document_type] = 0
    }
    stats.documentsByType[doc.document_type]++
  }

  // Calculate average confidence
  const confidenceScores = documents.filter(d => d.confidence_score).map(d => d.confidence_score)
  if (confidenceScores.length > 0) {
    stats.averageConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: stats
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Create document template
async function createTemplate(supabase: any, userId: string, template: any) {
  const { data: result, error } = await supabase
    .from('docautofill_templates')
    .insert({
      user_id: userId,
      ...template,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      data: result,
      message: 'Template created successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Get user templates
async function getTemplates(supabase: any, userId: string) {
  const { data: templates, error } = await supabase
    .from('docautofill_templates')
    .select('*')
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      data: templates
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}