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

export function useUserData() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null)
  const [processedForms, setProcessedForms] = useState<ProcessedForm[]>([])

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
      // Load personal data
      const { data: personal } = await supabase
        .from('personal_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setPersonalData(personal)

      // Load license info
      const { data: license } = await supabase
        .from('license_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setLicenseInfo(license)

      // Load vehicle info
      const { data: vehicle } = await supabase
        .from('vehicle_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setVehicleInfo(vehicle)

      // Load insurance info
      const { data: insurance } = await supabase
        .from('insurance_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setInsuranceInfo(insurance)

      // Load processed forms
      const { data: forms } = await supabase
        .from('processed_forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setProcessedForms(forms || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePersonalData(data: Partial<PersonalData>) {
    if (!user) throw new Error('User not authenticated')

    const { data: result, error } = await supabase
      .from('personal_data')
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
      .from('license_info')
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
      .from('vehicle_info')
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
      .from('insurance_info')
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
      .from('processed_forms')
      .insert({ ...data, user_id: user.id })
      .select()
      .maybeSingle()

    if (error) throw error
    setProcessedForms(prev => [result, ...prev])
    return result
  }

  return {
    loading,
    personalData,
    licenseInfo,
    vehicleInfo,
    insuranceInfo,
    processedForms,
    updatePersonalData,
    updateLicenseInfo,
    updateVehicleInfo,
    updateInsuranceInfo,
    createProcessedForm,
    refreshData: loadUserData
  }
}