import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Exchange the auth code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            navigate('/login?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // Successfully signed in, redirect to dashboard
            navigate('/dashboard')
            return
          }
        }

        // If we get here, something went wrong
        navigate('/login?error=No session found')
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login?error=Authentication failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Completing sign in...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthCallback