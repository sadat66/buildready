'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Eye, EyeOff, Building2, Home } from 'lucide-react'
import Link from 'next/link'
import { api } from '~/components/providers/TRPCProvider'
import { useAuth } from '@/contexts/AuthContext'

// Type for sign-up form (excluding admin role)
type SignUpRole = 'homeowner' | 'contractor'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState<SignUpRole>('homeowner')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
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
      setLoading(false)
    },
    onSuccess: (result) => {
      if (result.user) {
        alert('Check your email for the confirmation link! After confirming, you can sign in.')
      }
      setLoading(false)
    }
  })
  
  const handleSignIn = async (email: string, password: string) => {
    setLoading(true)
    setError('')
    
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
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isSignUp) {
        // Validate required fields
        if (!email || !password || !fullName || !role) {
          setError('Please fill in all required fields')
          setLoading(false)
          return
        }

        // Use tRPC mutation instead of direct Supabase client
        signUpMutation.mutate({
          email,
          password,
          fullName,
          role,
        })
      } else {
        // Sign in using AuthContext
        await handleSignIn(email, password)
      }
    } catch (error) {
      // Catch any unexpected errors to prevent Next.js error overlays
      console.error('Unexpected error in handleAuth:', error)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            {isSignUp ? 'Join BuildReady' : 'Welcome Back'}
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            {isSignUp ? 'Connect with trusted professionals and grow your business' : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {isSignUp ? 'Fill in your details to get started' : 'Enter your credentials to access your account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-5">
              {isSignUp && (
                <>
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('homeowner')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          role === 'homeowner'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Home className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Homeowner</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('contractor')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          role === 'contractor'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Building2 className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Contractor</div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Password Field */}
               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                     Password
                   </label>
                   {!isSignUp && (
                     <Link
                       href="/reset-password"
                       className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                     >
                       Forgot password?
                     </Link>
                   )}
                 </div>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                   <Input
                     id="password"
                     type={showPassword ? 'text' : 'password'}
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Enter your password"
                     className="pl-10 pr-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                   >
                     {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                   </button>
                 </div>
               </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            {/* Toggle Sign In/Sign Up */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
         <div className="text-center text-sm text-gray-500">
           <p>
             By continuing, you agree to our{' '}
             <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
               Terms of Service
             </Link>
             {' '}and{' '}
             <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
               Privacy Policy
             </Link>
           </p>
         </div>
      </div>
    </div>
  )
}