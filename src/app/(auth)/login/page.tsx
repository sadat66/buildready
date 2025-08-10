'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthFooter, AuthHero, LoginForm } from '@/components/features/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, signIn, userRole } = useAuth()

  // Redirect if user is already signed in
  useEffect(() => {
    if (user && userRole) {
      // Redirect to role-specific dashboard using the [role] dynamic route
      const roleDashboard = `/${userRole}/dashboard`
      router.push(roleDashboard)
    }
  }, [user, userRole, router])

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Attempting sign-in with:', email)
      const { user: signedInUser, userRole: signInUserRole, error } = await signIn(email, password)
      
      console.log('Sign-in result:', { signedInUser, signInUserRole, error })
      
      if (error) {
        // Handle specific error messages
        if (error.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (error.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before signing in.')
        } else if (error.includes('Too many requests')) {
          setError('Too many failed attempts. Please wait a moment before trying again.')
        } else {
          setError(error)
        }
      } else if (signedInUser) {
        // Successfully signed in, redirect immediately using the returned userRole
        console.log('Sign-in successful, redirecting to role-specific dashboard...')
        
        if (signInUserRole) {
          const roleDashboard = `/${signInUserRole}/dashboard`
          console.log(`Redirecting to ${roleDashboard}`)
          
          try {
            router.push(roleDashboard)
            
            // Fallback: if router doesn't work within 1 second, use window.location
            setTimeout(() => {
              if (window.location.pathname !== roleDashboard) {
                console.log('Router failed, using window.location fallback')
                window.location.href = roleDashboard
              }
            }, 1000)
          } catch (error) {
            console.error('Router error, using window.location fallback:', error)
            window.location.href = roleDashboard
          }
        } else {
          // Fallback to generic dashboard if role is not available
          console.log('User role not available, redirecting to generic dashboard')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (data: { email: string; password: string }) => {
    await handleSignIn(data.email, data.password)
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Hero Section */}
        <AuthHero
          title={
            <>
              Welcome Back to
              <span className="block text-orange-600">
                BuildReady
              </span>
            </>
          }
          description="Sign in to access your projects, manage contracts, and continue building your home improvement journey."
          maxWidth="md"
        />

        {/* Login Form */}
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error || undefined}
        />

        {/* Footer */}
        <AuthFooter variant="login" />
      </div>
    </div>
  )
}
