'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, userRole } = useAuth()

  const quickActions = [
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: User,
      href: userRole ? `/${userRole}/profile` : '/dashboard/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'Settings',
      description: 'Configure your account',
      icon: Settings,
      href: userRole ? `/${userRole}/settings` : '/dashboard/settings',
      color: 'bg-orange-500'
    },
    {
      title: 'Messages',
      description: 'Check your messages',
      icon: MessageSquare,
      href: userRole ? `/${userRole}/messages` : '/dashboard/messages',
      color: 'bg-purple-500'
    }
  ]

  const roleSpecificActions = userRole ? [
    {
      title: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard`,
      description: `Access your ${userRole} specific features`,
      icon: ArrowRight,
      href: `/${userRole}/dashboard`,
      color: 'bg-green-500'
    }
  ] : []

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome to CoreXLab!
          </CardTitle>
          <CardDescription>
            You are signed in as {user?.email}
            {userRole && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                {userRole}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {userRole ? (
              <>
                You have been automatically assigned the <strong>{userRole}</strong> role. 
                You can access your role-specific dashboard and features below.
              </>
            ) : (
              <>
                Choose your role from the options above to access your personalized dashboard. 
                Each role provides different features and capabilities tailored to your needs.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Role-Specific Action */}
      {roleSpecificActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {roleSpecificActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.title} className="hover:shadow-lg transition-shadow border-green-200 bg-green-50">
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
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Go to {userRole} Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* System Status Card */}
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
