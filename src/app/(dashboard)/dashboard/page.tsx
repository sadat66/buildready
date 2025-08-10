'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, FileText, MessageSquare, Building } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const userRole = user?.user_metadata?.role || 'homeowner'

  const baseActions = [
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: User,
      href: '/dashboard/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'Messages',
      description: 'Check your messages',
      icon: MessageSquare,
      href: '/dashboard/messages',
      color: 'bg-purple-500'
    },
    {
      title: 'Settings',
      description: 'Configure your account',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-orange-500'
    }
  ]

  const roleSpecificActions = userRole === 'contractor' ? [
    {
      title: 'Available Projects',
      description: 'Browse projects from homeowners',
      icon: Building,
      href: '/dashboard/contractor-projects',
      color: 'bg-green-500'
    }
  ] : [
    {
      title: 'My Projects',
      description: 'Manage your projects',
      icon: FileText,
      href: '/dashboard/projects',
      color: 'bg-green-500'
    }
  ]

  const quickActions = [...baseActions.slice(0, 1), ...roleSpecificActions, ...baseActions.slice(1)]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back!
          </CardTitle>
          <CardDescription>
            You are signed in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This is your simple dashboard. Use the quick actions below to navigate to different sections.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {action.description}
                </CardDescription>
                <Link href={action.href}>
                  <Button className="w-full" variant="outline">
                    Go to {action.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">All systems operational</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}