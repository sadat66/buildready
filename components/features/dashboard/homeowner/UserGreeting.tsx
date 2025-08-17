'use client'

import { useAuth } from '@/contexts/AuthContext'

interface UserGreetingProps {
  userEmail?: string
}

export default function UserGreeting({ userEmail }: UserGreetingProps) {
  const { user } = useAuth()
  
  // Use full_name if available, otherwise fall back to email-based firstName
  const displayName = user?.full_name || (userEmail ? userEmail.split('@')[0] : 'Homeowner')
  
  const currentHour = new Date().getHours()
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning'
    if (currentHour < 18) return 'Good afternoon'
    return 'Good evening'
  }
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 border border-orange-200 shadow-lg">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full transform -translate-x-24 translate-y-24"></div>
      
      <div className="relative p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
                {getGreeting()}, {displayName}!
              </h1>
              <p className="text-orange-600 font-medium">
                You are signed in as <span className="font-bold text-orange-700">Homeowner</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50">
          <p className="text-orange-800 text-base leading-relaxed">
            🏠 Manage your home improvement projects and track their progress all in one place. 
            Let's build something amazing together!
          </p>
        </div>
      </div>
    </div>
  )
}
