'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { clearSupabaseStorage } from '@/lib/auth-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const [status, setStatus] = useState('')
  const supabase = createClient()

  const handleClearAuth = async () => {
    try {
      setStatus('Clearing authentication state...')
      
      // Clear Supabase storage
      clearSupabaseStorage()
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      setStatus('Authentication state cleared successfully! You can now try signing in again.')
    } catch (error) {
      console.error('Error clearing auth state:', error)
      setStatus('Error clearing authentication state. Please try refreshing the page.')
    }
  }

  const handleCheckSession = async () => {
    try {
      setStatus('Checking current session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setStatus(`Session error: ${error.message}`)
      } else if (session) {
        setStatus(`Session found: User ${session.user.email} is logged in`)
      } else {
        setStatus('No active session found')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setStatus('Error checking session')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>
            Use this page to debug and fix authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleCheckSession}
            variant="outline"
            className="w-full"
          >
            Check Current Session
          </Button>
          
          <Button 
            onClick={handleClearAuth}
            variant="destructive"
            className="w-full"
          >
            Clear Authentication State
          </Button>
          
          {status && (
            <div className="p-3 bg-gray-100 rounded-md text-sm">
              {status}
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-2">
            <p><strong>When to use &quot;Clear Authentication State&quot;:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Getting &quot;Invalid Refresh Token&quot; errors</li>
              <li>Stuck in authentication loops</li>
              <li>Unable to sign in after previous errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}