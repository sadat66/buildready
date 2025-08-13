'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '~/lib/supabase'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the current URL and extract tokens from hash
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1))
        
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')
        
        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session using the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (!error && data.user) {
            setStatus('success')
            // Get user's role from metadata
            const userRole = data.user.user_metadata?.role || 'homeowner'
            
            // Redirect to role-specific dashboard
            setTimeout(() => {
              router.push(`/${userRole}/dashboard`)
            }, 1000)
          } else {
            setStatus('error')
          }
        } else {
          // Try to get session from current state
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            setStatus('success')
            const userRole = session.user.user_metadata?.role || 'homeowner'
            
            setTimeout(() => {
              router.push(`/${userRole}/dashboard`)
            }, 1000)
          } else {
            setStatus('error')
          }
        }
      } catch (error) {
        console.error('Email confirmation error:', error)
        setStatus('error')
      }
    }

    handleEmailConfirmation()
  }, [router, supabase])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirming your email...</h2>
          <p className="text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Confirmed!</h2>
          <p className="text-gray-600">Redirecting you to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirmation Failed</h2>
        <p className="text-gray-600 mb-4">There was an issue confirming your email.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}
