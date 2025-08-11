'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

export function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Check Your Email!
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              We&apos;ve sent you a confirmation link to verify your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Important:</p>
                  <p>Click the link in your email to activate your account before signing in.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                <Link href="/login">
                  Go to Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>Didn&apos;t receive the email? Check your spam folder or</p>
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                try signing in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
