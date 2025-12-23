import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface PersonalData {
  id?: string
  user_id: string
  first_name?: string
  last_name?: string
  middle_name?: string
  date_of_birth?: string
  ssn_encrypted?: string
  email?: string
  phone?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_relationship?: string
  emergency_contact_phone?: string
  created_at?: string
  updated_at?: string
}

export interface LicenseInfo {
  id?: string
  user_id: string
  license_number?: string
  license_class?: string
  issued_date?: string
  expiration_date?: string
  restrictions?: string
  endorsements?: string
  created_at?: string
  updated_at?: string
}

export interface VehicleInfo {
  id?: string
  user_id: string
  vin?: string
  make?: string
  model?: string
  year?: number
  color?: string
  license_plate?: string
  odometer_reading?: number
  registration_number?: string
  registration_expiration?: string
  title_number?: string
  purchase_date?: string
  purchase_price?: number
  created_at?: string
  updated_at?: string
}

export interface InsuranceInfo {
  id?: string
  user_id: string
  provider?: string
  policy_number?: string
  coverage_type?: string
  policy_start_date?: string
  policy_expiration?: string
  agent_name?: string
  agent_phone?: string
  created_at?: string
  updated_at?: string
}

export interface ProcessedForm {
  id?: string
  user_id: string
  form_type: string
  form_name?: string
  original_filename?: string
  processed_filename?: string
  confidence_score?: number
  status?: string
  fields_detected?: number
  fields_filled?: number
  created_at?: string
  updated_at?: string
}

export interface UniversalDocument {
  id?: string
  user_id: string
  document_name: string
  document_category: DocumentCategory
  file_path: string
  original_filename: string
  file_size: number
  mime_type: string
  uploaded_at?: string
  processed_at?: string
  status?: DocumentStatus
  confidence_score?: number
  fields_detected?: number
  fields_extracted?: any
  created_at?: string
  updated_at?: string
}

export interface DocumentTemplate {
  id?: string
  template_name: string
  document_category: DocumentCategory
  template_fields: DocumentField[]
  description?: string
  is_public: boolean
  created_by?: string
  usage_count?: number
  created_at?: string
  updated_at?: string
}

export interface DocumentField {
  field_name: string
  field_type: string
  field_description?: string
  is_required: boolean
  confidence_threshold?: number
}

export type DocumentCategory = 
  | 'government' 
  | 'legal' 
  | 'business' 
  | 'healthcare' 
  | 'financial' 
  | 'personal'

export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'processed' 
  | 'completed' 
  | 'error'

export const DOCUMENT_CATEGORIES = [
  { id: 'government', name: 'Government', icon: 'Building2', description: 'Forms and applications for government services' },
  { id: 'legal', name: 'Legal', icon: 'Scale', description: 'Contracts, agreements, and legal documents' },
  { id: 'business', name: 'Business', icon: 'Briefcase', description: 'Business forms, invoices, and corporate documents' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', description: 'Medical forms and healthcare-related documents' },
  { id: 'financial', name: 'Financial', icon: 'DollarSign', description: 'Banking, insurance, and financial forms' },
  { id: 'personal', name: 'Personal', icon: 'User', description: 'Personal documents and forms' }
] as const

export function useUserData() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null)
  const [processedForms, setProcessedForms] = useState<ProcessedForm[]>([])
  const [universalDocuments, setUniversalDocuments] = useState<UniversalDocument[]>([])
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([])
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('government')

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  async function loadUserData() {
    if (!user) return
    
    setLoading(true)
    try {
      // Load personal data from new table
      const { data: personal } = await supabase
        .from('docautofill_personal_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setPersonalData(personal)

      // Load license info from new table
      const { data: license } = await supabase
        .from('docautofill_license_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setLicenseInfo(license)

      // Load vehicle info from new table
      const { data: vehicle } = await supabase
        .from('docautofill_vehicle_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setVehicleInfo(vehicle)

      // Load insurance info from new table
      const { data: insurance } = await supabase
        .from('docautofill_insurance_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setInsuranceInfo(insurance)

      // Load processed forms from new table
      const { data: forms } = await supabase
        .from('docautofill_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setProcessedForms(forms || [])

      // Load universal documents from new table
      const { data: documents } = await supabase
        .from('docautofill_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setUniversalDocuments(documents || [])

      // Load document templates from new table
      const { data: templates } = await supabase
        .from('docautofill_templates')
        .select('*')
        .or(`is_public.eq.true,created_by.eq.${user.id}`)
        .order('created_at', { ascending: false })
      
      setDocumentTemplates(templates || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePersonalData(data: Partial<PersonalData>) {
    if (!user) throw new Error('User not authenticated')

    const { data: result, error } = await supabase
      .from('docautofill_personal_data')
      .upsert({ ...data, user_id: user.id })
      .select()
      .maybeSingle()

    if (error) throw error
    setPersonalData(result)
    return result
  }

  async function updateLicenseInfo(data: Partial<LicenseInfo>) {
    if (!user) throw new Error('User not authenticated')

    const { data: result, error } = await supabase
      .from('docautofill_license_info')
      .upsert({ ...data, user_id: user.id })
      .select()
      .maybeSingle()

    if (error) throw error
    setLicenseInfo(result)
    return result
  }

  async function updateVehicleInfo(data: Partial<VehicleInfo>) {
    if (!user) throw new Error('User not authenticated')

    const { data: result, error } = await supabase
      .from('docautofill_vehicle_info')
      .upsert({ ...data, user_id: user.id })
      .select()
      .maybeSingle()

    if (error) throw error
    setVehicleInfo(result)
    return result
  }

  async function updateInsuranceInfo(data: Partial<InsuranceInfo>) {
    if (!user) throw new Error('User not authenticated')

    const { data: result, error } = await supabase
      .from('docautofill_insurance_info')
      .upsert({ ...data, user_id: user.id })
      .select()
      .maybeSingle()

    if (error) throw error
    setInsuranceInfo(result)
    return result
  }

  async function createProcessedForm(data: Partial<ProcessedForm>) {
    if (!user) throw new Error('User not authenticated')

    const { data: result, error } = await supabase
      .from('docautofill_documents')
      .insert({ ...data, user_id: user.id })
      .select()
      .maybeSingle()

    if (error) throw error
    setProcessedForms(prev => [result, ...prev])
    return result
  }

  async function uploadUniversalDocument(
    file: File, 
    category: DocumentCategory, 
    documentName: string
  ): Promise<UniversalDocument> {
    if (!user) throw new Error('User not authenticated')

    // Upload file to storage bucket
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('docautofill-documents')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Create document record
    const { data: document, error: documentError } = await supabase
      .from('docautofill_documents')
      .insert({
        user_id: user.id,
        document_name: documentName,
        document_category: category,
        file_path: uploadData.path,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: 'uploaded'
      })
      .select()
      .single()

    if (documentError) throw documentError

    setUniversalDocuments(prev => [document, ...prev])

    // Process document with AI using the new edge function
    try {
      const { data: processResult } = await supabase.functions.invoke('docautofill-processor', {
        body: {
          document_id: document.id,
          file_path: uploadData.path,
          document_category: category,
          document_name: documentName,
          user_id: user.id
        }
      })

      if (processResult) {
        // Update document with processing results
        const { data: updatedDoc } = await supabase
          .from('docautofill_documents')
          .update({
            status: processResult.success ? 'processed' : 'error',
            confidence_score: processResult.confidence_score,
            fields_detected: processResult.fields_detected,
            fields_extracted: processResult.extracted_fields,
            processed_at: new Date().toISOString()
          })
          .eq('id', document.id)
          .select()
          .single()

        if (updatedDoc) {
          setUniversalDocuments(prev => 
            prev.map(doc => doc.id === document.id ? updatedDoc : doc)
          )
          return updatedDoc
        }
      }
    } catch (error) {
      console.error('Document processing error:', error)
      // Mark document as error
      await supabase
        .from('docautofill_documents')
        .update({ status: 'error' })
        .eq('id', document.id)
    }

    return document
  }

  async function createDocumentTemplate(
    templateName: string,
    category: DocumentCategory,
    fields: DocumentField[],
    description?: string
  ): Promise<DocumentTemplate> {
    if (!user) throw new Error('User not authenticated')

    const { data: template, error } = await supabase
      .from('docautofill_templates')
      .insert({
        template_name: templateName,
        document_category: category,
        template_fields: fields,
        description,
        is_public: false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error
    setDocumentTemplates(prev => [template, ...prev])
    return template
  }

  async function getDocumentsByCategory(category: DocumentCategory): Promise<UniversalDocument[]> {
    if (!user) return []

    const { data: documents } = await supabase
      .from('docautofill_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_category', category)
      .order('created_at', { ascending: false })

    return documents || []
  }

  return {
    loading,
    personalData,
    licenseInfo,
    vehicleInfo,
    insuranceInfo,
    processedForms,
    universalDocuments,
    documentTemplates,
    activeCategory,
    setActiveCategory,
    updatePersonalData,
    updateLicenseInfo,
    updateVehicleInfo,
    updateInsuranceInfo,
    createProcessedForm,
    uploadUniversalDocument,
    createDocumentTemplate,
    getDocumentsByCategory,
    refreshData: loadUserData
  }
}