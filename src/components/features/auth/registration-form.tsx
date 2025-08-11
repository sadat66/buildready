'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, User, Home, ArrowLeft, ArrowRight, CheckCircle, Building2, AlertCircle } from 'lucide-react'

// Registration Schema - Only essential fields
const registrationSchema = z.object({
  user_role: z.enum(['homeowner', 'contractor'] as const),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  user_agreed_to_terms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface RegistrationFormProps {
  onSubmit: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_role: 'homeowner' | 'contractor'
  }) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function RegistrationForm({ onSubmit, isLoading = false, error }: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      user_role: 'homeowner',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      user_agreed_to_terms: false,
    },
  })

  const handleNext = async () => {
    const isValid = await form.trigger(['user_role'])
    if (isValid) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleSubmit = async (data: RegistrationFormData) => {
    try {
      // Transform data to match the expected format from the existing signin page
      await onSubmit({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        user_role: data.user_role,
      })
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  const steps = [
    { id: 1, title: 'Choose Your Role', description: 'Select how you\'ll use BuildReady' },
    { id: 2, title: 'Account Details', description: 'Complete your registration' }
  ]

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                ${currentStep >= step.id 
                  ? "border-orange-500 bg-orange-500 text-white" 
                  : "border-gray-300 text-gray-500"
                }
              `}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-2 text-left">
                <h3 className={`
                  text-sm font-medium transition-colors
                  ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"}
                `}>
                  {step.title}
                </h3>
                <p className={`
                  text-xs transition-colors
                  ${currentStep >= step.id ? "text-gray-600" : "text-gray-400"}
                `}>
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-3 transition-colors
                  ${currentStep > step.id ? "bg-orange-500" : "bg-gray-200"}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            {currentStep === 1 ? 'Choose Your Role' : 'Complete Your Profile'}
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {currentStep === 1 
              ? 'Tell us how you\'ll be using BuildReady to get started'
              : 'Fill in your details to create your account'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-center block text-gray-700">
                    I am a...
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="radio"
                        id="homeowner"
                        value="homeowner"
                        {...form.register('user_role')}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="homeowner"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-6 hover:bg-gray-50 hover:border-gray-300 peer-checked:border-orange-500 peer-checked:bg-orange-50 cursor-pointer transition-all duration-200 hover:shadow-md group"
                      >
                        <div className="mb-3 p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <Home className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="space-y-2 text-center">
                          <h3 className="text-lg font-semibold leading-none text-gray-900">Homeowner</h3>
                          <p className="text-sm text-gray-600 max-w-xs">
                            Looking for qualified contractors to complete your home improvement projects
                          </p>
                          <div className="pt-2 text-xs text-gray-500">
                            ✓ Post projects and get quotes<br/>
                            ✓ Review contractor profiles<br/>
                            ✓ Manage your projects
                          </div>
                        </div>
                      </Label>
                    </div>
                    
                    <div>
                      <input
                        type="radio"
                        id="contractor"
                        value="contractor"
                        {...form.register('user_role')}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="contractor"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-6 hover:bg-gray-50 hover:border-gray-300 peer-checked:border-orange-500 peer-checked:bg-orange-50 cursor-pointer transition-all duration-200 hover:shadow-md group"
                      >
                        <div className="mb-3 p-3 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                          <Building2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="space-y-2 text-center">
                          <h3 className="text-lg font-semibold leading-none text-gray-900">Contractor</h3>
                          <p className="text-sm text-gray-600 max-w-xs">
                            Provide professional services and grow your business with quality leads
                          </p>
                          <div className="pt-2 text-xs text-gray-500">
                            ✓ Receive project notifications<br/>
                            ✓ Showcase your expertise<br/>
                            ✓ Build your reputation
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                  {form.formState.errors.user_role && (
                    <p className="text-red-600 text-sm text-center">{form.formState.errors.user_role.message}</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!form.watch('user_role')}
                  >
                    Continue to Account Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Account Details */}
            {currentStep === 2 && (
              <div className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4" />
                      First Name
                    </Label>
                    <Input 
                      id="first_name"
                      placeholder="John" 
                      className="h-10 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                      {...form.register('first_name')} 
                    />
                    {form.formState.errors.first_name && (
                      <p className="text-red-600 text-xs">{form.formState.errors.first_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4" />
                      Last Name
                    </Label>
                    <Input 
                      id="last_name"
                      placeholder="Doe" 
                      className="h-10 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                      {...form.register('last_name')} 
                    />
                    {form.formState.errors.last_name && (
                      <p className="text-red-600 text-xs">{form.formState.errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="john@example.com" 
                    className="h-10 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                    {...form.register('email')} 
                  />
                  <p className="text-xs text-gray-500">
                    We&apos;ll send a verification email to this address
                  </p>
                  {form.formState.errors.email && (
                    <p className="text-red-600 text-xs">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="h-10 text-sm pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        {...form.register('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                    {form.formState.errors.password && (
                      <p className="text-red-600 text-xs">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="h-10 text-sm pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        {...form.register('confirmPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-red-600 text-xs">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                 

                {/* Terms Agreement */}
                <div className="flex items-start space-x-3 space-y-0">
                  <input
                    type="checkbox"
                    id="user_agreed_to_terms"
                    {...form.register('user_agreed_to_terms')}
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="user_agreed_to_terms" className="text-sm font-normal text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                        Privacy Policy
                      </a>
                    </Label>
                    {form.formState.errors.user_agreed_to_terms && (
                      <p className="text-red-600 text-xs">{form.formState.errors.user_agreed_to_terms.message}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1 h-10 text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-10 text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}