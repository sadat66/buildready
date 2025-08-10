'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit({ email, password })
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Sign In
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Access your BuildReady account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-4 pr-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/reset-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}