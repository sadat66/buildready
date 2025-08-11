'use client'

import Link from 'next/link'
import { BarChart3, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <BarChart3 className="mx-auto h-24 w-24 text-gray-300" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            System Analytics
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            View system performance and usage analytics
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This feature is coming soon!
          </p>
        </div>

        <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
          <Button
            asChild
            className="flex items-center justify-center px-4 py-2"
          >
            <Link href="/admin/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-4 py-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}