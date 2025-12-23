import { createClient } from '@supabase/supabase-js'

// Supabase configuration with demo mode fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

// Check if we have valid Supabase credentials (not placeholders)
const isValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://your-project-id.supabase.co" && 
  supabaseAnonKey !== "your_supabase_anon_key_here"

// Create Supabase client instance (or null for demo mode)
export const supabase = isValidSupabaseConfig ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  null

// Demo mode flag
export const isDemoMode = !isValidSupabaseConfig

// Demo user data for testing
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@docautofill.com',
  user_metadata: {
    full_name: 'Demo User'
  }
}

// Auth helper functions with demo mode support
export async function getCurrentUser() {
  if (isDemoMode) {
    // Check localStorage for demo user
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      return JSON.parse(demoUser)
    }
    return null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

export async function signIn(email: string, password: string) {
  if (isDemoMode) {
    // Demo mode: accept any email/password combination
    const user = { ...DEMO_USER, email }
    localStorage.setItem('demo_user', JSON.stringify(user))
    return { data: { user }, error: null }
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signUp(email: string, password: string) {
  if (isDemoMode) {
    // Demo mode: simulate successful signup
    const user = { ...DEMO_USER, email }
    localStorage.setItem('demo_user', JSON.stringify(user))
    return { data: { user }, error: null }
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  if (isDemoMode) {
    localStorage.removeItem('demo_user')
    return { error: null }
  }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}