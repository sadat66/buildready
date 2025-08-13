'use client'

import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { AuthInput, InlinePasswordStrength } from '@/components/shared/form-input'
import { RegistrationFormData } from '@/lib/validation'

interface AccountDetailsStepProps {
  form: UseFormReturn<RegistrationFormData>
  onBack: () => void
  isLoading: boolean
}

export function AccountDetailsStep({ form, onBack, isLoading }: AccountDetailsStepProps) {
  return (
    <div className="space-y-5">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AuthInput
          type="name"
          label="First Name"
          placeholder="John"
          error={form.formState.errors.first_name?.message}
          {...form.register('first_name')}
        />
        <AuthInput
          type="name"
          label="Last Name"
          placeholder="Doe"
          error={form.formState.errors.last_name?.message}
          {...form.register('last_name')}
        />
      </div>

      {/* Email Field */}
      <AuthInput
        type="email"
        label="Email Address"
        error={form.formState.errors.email?.message}
        helperText="Verification email will be sent here"
        {...form.register('email')}
      />

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <AuthInput
            type="password"
            error={form.formState.errors.password?.message}
            showPasswordToggle={true}
            {...form.register('password')}
          />
          {/* Password Strength Indicator */}
          <InlinePasswordStrength 
            password={form.watch('password') || ''} 
          />
        </div>

        <AuthInput
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          error={form.formState.errors.confirmPassword?.message}
          showPasswordToggle={true}
          {...form.register('confirmPassword')}
        />
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
            I agree to{' '}
            <a href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
              Terms
            </a>{' '}
            &{' '}
            <a href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
              Privacy
            </a>
          </Label>
          {form.formState.errors.user_agreed_to_terms && (
            <p className="text-red-600 text-xs">{form.formState.errors.user_agreed_to_terms.message}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-10 text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          type="submit" 
          className="flex-1 h-10 text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={isLoading || form.formState.isSubmitting}
        >
          {isLoading || form.formState.isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
              Creating...
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
  )
}
