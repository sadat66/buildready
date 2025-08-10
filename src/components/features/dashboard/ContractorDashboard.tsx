'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, Building, ClipboardList, Search, Briefcase } from 'lucide-react'
import Link from 'next/link'

interface ContractorDashboardProps {
  userEmail?: string
}

export default function ContractorDashboard({ userEmail }: ContractorDashboardProps) {
  const quickActions = [
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: User,
      href: '/contractor/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'Available Projects',
      description: 'Browse projects from homeowners',
      icon: Building,
      href: '/contractor/projects',
      color: 'bg-green-500'
    },
    {
      title: 'My Proposals',
      description: 'Track your submitted proposals',
      icon: ClipboardList,
      href: '/contractor/proposals',
      color: 'bg-blue-600'
    },
    {
      title: 'Settings',
      description: 'Configure your account',
      icon: Settings,
      href: '/contractor/settings',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Welcome back, Contractor!
          </CardTitle>
          <CardDescription>
            {userEmail && `You are signed in as ${userEmail}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Find new project opportunities, manage your proposals, and grow your construction business.
          </p>
        </CardContent>
      </Card>

      {/* Quick Browse Projects */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Looking for new projects?</CardTitle>
          <CardDescription className="text-blue-600">
            Browse available projects from homeowners and submit your proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/contractor/projects/view">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Browse Projects
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

      {/* Business Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-gray-500">Proposals awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Won Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-gray-500">Projects awarded to you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">-</div>
            <p className="text-xs text-gray-500">Proposal success rate</p>
          </CardContent>
        </Card>
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
              Your proposal updates and project notifications will appear here.
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