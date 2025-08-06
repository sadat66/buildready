'use client'

export const dynamic = 'force-dynamic'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Users
} from 'lucide-react'



export default function DashboardPage() {
  const { profile } = useAuth()

  const quickActions = profile?.role === 'homeowner' ? [
    {
      title: 'Create New Project',
      description: 'Start a new construction project',
      icon: FolderOpen,
      href: '/dashboard/projects/new',
      color: 'bg-blue-500'
    },
    {
      title: 'View Proposals',
      description: 'Review contractor proposals',
      icon: FileText,
      href: '/dashboard/proposals',
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      description: 'Communicate with contractors',
      icon: MessageSquare,
      href: '/dashboard/messages',
      color: 'bg-purple-500'
    }
  ] : [
    {
      title: 'Browse Projects',
      description: 'Find available projects',
      icon: FolderOpen,
      href: '/dashboard/projects',
      color: 'bg-blue-500'
    },
    {
      title: 'My Proposals',
      description: 'View your submitted proposals',
      icon: FileText,
      href: '/dashboard/proposals',
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      description: 'Communicate with homeowners',
      icon: MessageSquare,
      href: '/dashboard/messages',
      color: 'bg-purple-500'
    }
  ]

  const stats = [
    {
      title: 'Active Projects',
      value: '12',
      icon: FolderOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Total Proposals',
      value: '45',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Messages',
      value: '8',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      title: 'Reviews',
      value: '23',
      icon: Users,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s what&apos;s happening with your {profile?.role === 'homeowner' ? 'projects' : 'work'} today.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Latest Updates</CardTitle>
            <CardDescription>
              Recent activity on your {profile?.role === 'homeowner' ? 'projects' : 'proposals'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New proposal received</p>
                  <p className="text-sm text-gray-600">Kitchen renovation project</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Message from contractor</p>
                  <p className="text-sm text-gray-600">Regarding project timeline</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Review submitted</p>
                  <p className="text-sm text-gray-600">Deck construction project</p>
                </div>
                <span className="text-sm text-gray-500">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 