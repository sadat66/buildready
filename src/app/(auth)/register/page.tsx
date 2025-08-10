'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthFooter, AuthHero, RegistrationForm, RegistrationSuccess } from '@/components/features/auth'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/components/providers/TRPCProvider'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { user, userRole } = useAuth()

  // Redirect if user is already signed in
  useEffect(() => {
    if (user && userRole) {
      // Redirect to role-specific dashboard using the [role] dynamic route
      const roleDashboard = `/${userRole}/dashboard`
      router.push(roleDashboard)
    }
  }, [user, userRole, router])

  const signUpMutation = api.auth.signUp.useMutation({
    onError: (error) => {
      // Handle sign-up errors gracefully
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else if (error.message.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.')
      } else {
        setError(error.message)
      }
      setIsLoading(false)
    },
    onSuccess: (result) => {
      if (result.user) {
        alert('Check your email for the confirmation link! After confirming, you can sign in.')
      }
      setIsLoading(false)
      setIsSuccess(true)
    }
  })

  const handleRegistration = async (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_role: 'homeowner' | 'contractor'
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!data.email || !data.password || !data.first_name || !data.user_role) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      // Use tRPC mutation instead of direct Supabase client
      signUpMutation.mutate({
        email: data.email,
        password: data.password,
        fullName: `${data.first_name} ${data.last_name}`,
        role: data.user_role,
      })
    } catch (error) {
      // Catch any unexpected errors to prevent Next.js error overlays
      console.error('Unexpected error in handleRegistration:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return <RegistrationSuccess />
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Hero Section */}
        <AuthHero
          title={
            <>
              Join the Future of
              <span className="block text-orange-600">
                Home Improvement
              </span>
            </>
          }
          description="Connect with qualified contractors, manage your projects, and transform your home with confidence. Join thousands of homeowners and contractors who trust BuildReady."
          maxWidth="2xl"
        />

        {/* Registration Form */}
        <RegistrationForm
          onSubmit={handleRegistration}
          isLoading={isLoading}
          error={error || undefined}
        />

        {/* Footer */}
        <AuthFooter />
      </div>
    </div>
  )
}
