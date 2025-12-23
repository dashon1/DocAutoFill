// DocAutofill Universal Document Processor
// Handles AI-powered document analysis and field detection

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface ProcessDocumentRequest {
  documentId: string
  filePath: string
  documentType: string
  formType: string
  userId: string
}

interface AIAnalysisResult {
  fields: Array<{
    name: string
    type: string
    confidence: number
    position: { x: number, y: number, width: number, height: number }
    value?: string
  }>
  documentType: string
  formType: string
  overallConfidence: number
}

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
    const { documentId, filePath, documentType, formType, userId }: ProcessDocumentRequest = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get API keys from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const googleCloudApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY')

    if (!openaiApiKey && !anthropicApiKey) {
      throw new Error('No AI API keys configured')
    }

    // Update document status to processing
    await supabase
      .from('docautofill_documents')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    // Get file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('docautofill-documents')
      .download(filePath)

    if (fileError || !fileData) {
      throw new Error('Failed to retrieve file from storage')
    }

    // Convert file to base64 for AI processing
    const fileBuffer = await fileData.arrayBuffer()
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))

    // AI Analysis
    let aiAnalysis: AIAnalysisResult

    // Try OpenAI first
    if (openaiApiKey) {
      try {
        aiAnalysis = await analyzeWithOpenAI(openaiApiKey, base64File, documentType, formType)
      } catch (error) {
        console.error('OpenAI analysis failed:', error)
        // Fallback to Claude
        if (anthropicApiKey) {
          aiAnalysis = await analyzeWithClaude(anthropicApiKey, base64File, documentType, formType)
        } else {
          throw new Error('All AI services failed')
        }
      }
    } else if (anthropicApiKey) {
      aiAnalysis = await analyzeWithClaude(anthropicApiKey, base64File, documentType, formType)
    } else {
      throw new Error('No AI services available')
    }

    // Get user's personal data to map to detected fields
    const { data: personalData } = await supabase
      .from('docautofill_personal_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: licenseData } = await supabase
      .from('docautofill_license_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: vehicleData } = await supabase
      .from('docautofill_vehicle_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: insuranceData } = await supabase
      .from('docautofill_insurance_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Smart field mapping and auto-fill
    const filledFields = mapFieldsToData(aiAnalysis.fields, {
      personal: personalData,
      license: licenseData,
      vehicle: vehicleData,
      insurance: insuranceData
    })

    // Update document with results
    const updateResult = await supabase
      .from('docautofill_documents')
      .update({
        status: 'completed',
        confidence_score: aiAnalysis.overallConfidence,
        fields_detected: aiAnalysis.fields.length,
        fields_filled: filledFields.length,
        ai_analysis: aiAnalysis,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    if (updateResult.error) {
      throw new Error(`Failed to update document: ${updateResult.error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        analysis: aiAnalysis,
        filledFields,
        message: 'Document processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Processing error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Document processing failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// OpenAI Vision Analysis
async function analyzeWithOpenAI(apiKey: string, base64File: string, documentType: string, formType: string): Promise<AIAnalysisResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this document and identify form fields that need to be filled. Document type: ${documentType}, Form type: ${formType}. Provide a JSON response with detected fields including field names, types, positions, and confidence scores.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64File}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const result = await response.json()
  const content = result.choices[0].message.content

  try {
    return JSON.parse(content)
  } catch {
    // Fallback parsing if JSON is malformed
    return {
      fields: [],
      documentType,
      formType,
      overallConfidence: 0,
      error: 'Failed to parse AI response'
    }
  }
}

// Claude Vision Analysis
async function analyzeWithClaude(apiKey: string, base64File: string, documentType: string, formType: string): Promise<AIAnalysisResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-vision-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this document and identify form fields that need to be filled. Document type: ${documentType}, Form type: ${formType}. Provide a JSON response with detected fields including field names, types, positions, and confidence scores.`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64File
              }
            }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`)
  }

  const result = await response.json()
  const content = result.content[0].text

  try {
    return JSON.parse(content)
  } catch {
    // Fallback parsing if JSON is malformed
    return {
      fields: [],
      documentType,
      formType,
      overallConfidence: 0,
      error: 'Failed to parse AI response'
    }
  }
}

// Smart field mapping to user's stored data
function mapFieldsToData(fields: any[], userData: any): any[] {
  const filledFields = []

  for (const field of fields) {
    let mappedValue = null
    const fieldName = field.name.toLowerCase()

    // Map based on field name patterns
    if (fieldName.includes('name') || fieldName.includes('first')) {
      mappedValue = userData.personal?.first_name
    } else if (fieldName.includes('last') || fieldName.includes('surname')) {
      mappedValue = userData.personal?.last_name
    } else if (fieldName.includes('email') || fieldName.includes('e-mail')) {
      mappedValue = userData.personal?.email
    } else if (fieldName.includes('phone') || fieldName.includes('telephone')) {
      mappedValue = userData.personal?.phone
    } else if (fieldName.includes('address') || fieldName.includes('street')) {
      mappedValue = userData.personal?.street_address
    } else if (fieldName.includes('license') || fieldName.includes('dl') || fieldName.includes('driver')) {
      mappedValue = userData.license?.license_number
    } else if (fieldName.includes('vin') || fieldName.includes('vehicle')) {
      mappedValue = userData.vehicle?.vin
    }

    if (mappedValue) {
      filledFields.push({
        ...field,
        mappedValue,
        isFilled: true
      })
    }
  }

  return filledFields
}