'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp, Home } from 'lucide-react'

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

  const getGreetingEmoji = () => {
    if (currentHour < 12) return '🌅'
    if (currentHour < 18) return '☀️'
    return '🌙'
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border border-orange-200/60 shadow-2xl">
      {/* Enhanced Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-200/40 to-amber-200/30 rounded-full transform translate-x-40 -translate-y-40"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-200/30 to-orange-200/40 rounded-full transform -translate-x-32 translate-y-32"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full transform -translate-x-16 -translate-y-16"></div>
      
      <div className="relative p-8 space-y-8">
        {/* Main Greeting Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <span className="text-white font-bold text-3xl">{displayName.charAt(0).toUpperCase()}</span>
                </div>
                {/* Decorative ring */}
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-300 to-amber-300 rounded-3xl opacity-20 blur-sm"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{getGreetingEmoji()}</span>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 via-orange-700 to-red-700 bg-clip-text text-transparent">
                    {getGreeting()}, {displayName}!
                  </h1>
                </div>
                <div className="flex items-center gap-4">
              
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                      <Home className="mr-2 h-4 w-4" />
                      Homeowner
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Today</p>
                      <p className="text-orange-800 font-semibold text-sm">
                        {getCurrentDate()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
