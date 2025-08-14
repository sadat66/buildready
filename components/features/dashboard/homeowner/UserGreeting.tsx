'use client'

import { useAuth } from '@/contexts/AuthContext'

interface UserGreetingProps {
  userEmail?: string
}

export default function UserGreeting({ userEmail }: UserGreetingProps) {
  const { user } = useAuth()
  
  // Use full_name if available, otherwise fall back to email-based firstName
  const displayName = user?.full_name || (userEmail ? userEmail.split('@')[0] : 'Homeowner')
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {displayName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          You are signed in as <span className="font-semibold">Homeowner</span>
        </p>
      </div>
      <p className="text-muted-foreground text-base max-w-2xl">
        Manage your home improvement projects and track their progress all in one place.
      </p>
    </div>
  )
}
