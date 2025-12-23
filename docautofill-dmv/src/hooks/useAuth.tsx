import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, isDemoMode, getCurrentUser as getUser, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  isDemoMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        const user = await getUser()
        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // Set up auth listener (only for real Supabase)
    if (!isDemoMode && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null)
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [])

  // Auth methods with demo mode support
  async function signIn(email: string, password: string) {
    const result = await authSignIn(email, password)
    if (result.data?.user && !result.error) {
      setUser(result.data.user as User)
    }
    return result
  }

  async function signUp(email: string, password: string) {
    const result = await authSignUp(email, password)
    if (result.data?.user && !result.error) {
      setUser(result.data.user as User)
    }
    return result
  }

  async function signOut() {
    const result = await authSignOut()
    setUser(null)
    return result
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isDemoMode
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}