'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, FileText, ClipboardList, Plus, Home } from 'lucide-react'
import Link from 'next/link'

interface HomeownerDashboardProps {
  userEmail?: string
}

export default function HomeownerDashboard({ userEmail }: HomeownerDashboardProps) {
  const quickActions = [
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: User,
      href: '/homeowner/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'My Projects',
      description: 'Manage your home improvement projects',
      icon: FileText,
      href: '/homeowner/projects',
      color: 'bg-green-500'
    },
    {
      title: 'Proposals',
      description: 'Review contractor proposals',
      icon: ClipboardList,
      href: '/homeowner/proposals',
      color: 'bg-blue-600'
    },
    {
      title: 'Settings',
      description: 'Configure your account',
      icon: Settings,
      href: '/homeowner/settings',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            Welcome back, Homeowner!
          </CardTitle>
          <CardDescription>
            {userEmail && `You are signed in as ${userEmail}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Manage your home improvement projects, review contractor proposals, and track progress all in one place.
          </p>
        </CardContent>
      </Card>

      {/* Quick Create Project */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Ready to start a new project?</CardTitle>
          <CardDescription className="text-green-600">
            Post your project details and get proposals from qualified contractors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/homeowner/projects/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </Link>
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">No recent activity</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your project updates and proposal notifications will appear here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
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