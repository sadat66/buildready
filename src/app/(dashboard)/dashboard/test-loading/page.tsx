'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TestLoadingPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString())

  useEffect(() => {
    setLastUpdate(new Date().toISOString())
  }, [loading, user, profile])

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Loading Test Page</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auth State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Loading:</strong> {loading ? 'true' : 'false'}
            </div>
            <div>
              <strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}
            </div>
            <div>
              <strong>Profile:</strong> {profile ? profile.full_name : 'No profile'}
            </div>
            <div>
              <strong>Role:</strong> {profile?.role || 'No role'}
            </div>
            <div>
              <strong>Last Update:</strong> {lastUpdate}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-sm">
              {JSON.stringify({ user: !!user, profile: !!profile, loading, profileRole: profile?.role }, null, 2)}
            </pre>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => refreshProfile()} 
                variant="outline" 
                size="sm"
              >
                Refresh Profile
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/projects">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <h3 className="font-semibold">Test Projects Page</h3>
              <p className="text-sm text-gray-600 mt-2">Navigate to projects page to test loading</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/proposals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <h3 className="font-semibold">Test Proposals Page</h3>
              <p className="text-sm text-gray-600 mt-2">Navigate to proposals page to test loading</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
} 