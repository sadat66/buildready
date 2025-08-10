'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, FileText, MessageSquare, Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function RoleDashboardPage() {
  const { user } = useAuth()
  const params = useParams()
  const role = params?.role as string

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'homeowner':
        return {
          title: 'Homeowner Dashboard',
          description: 'Manage your home improvement projects',
          quickActions: [
            {
              title: 'My Projects',
              description: 'View and manage your projects',
              icon: FileText,
              href: '/homeowner/projects',
              color: 'bg-blue-500'
            },
            {
              title: 'Proposals',
              description: 'Review contractor proposals',
              icon: FileText,
              href: '/homeowner/proposals',
              color: 'bg-green-500'
            },
            {
              title: 'Messages',
              description: 'Communicate with contractors',
              icon: MessageSquare,
              href: '/homeowner/messages',
              color: 'bg-purple-500'
            },
            {
              title: 'Profile',
              description: 'Update your profile',
              icon: User,
              href: '/homeowner/profile',
              color: 'bg-orange-500'
            }
          ],
          stats: [
            { label: 'Active Projects', value: '3', icon: FileText, color: 'text-blue-500' },
            { label: 'Pending Proposals', value: '2', icon: FileText, color: 'text-yellow-500' },
            { label: 'Total Spent', value: '$43,000', icon: DollarSign, color: 'text-green-500' },
            { label: 'Messages', value: '12', icon: MessageSquare, color: 'text-purple-500' }
          ]
        }
      case 'contractor':
        return {
          title: 'Contractor Dashboard',
          description: 'Manage your projects and proposals',
          quickActions: [
            {
              title: 'Active Projects',
              description: 'Track ongoing projects',
              icon: FileText,
              href: '/contractor/projects',
              color: 'bg-blue-500'
            },
            {
              title: 'My Proposals',
              description: 'Manage your proposals',
              icon: FileText,
              href: '/contractor/proposals',
              color: 'bg-green-500'
            },
            {
              title: 'Messages',
              description: 'Communicate with homeowners',
              icon: MessageSquare,
              href: '/contractor/messages',
              color: 'bg-purple-500'
            },
            {
              title: 'Profile',
              description: 'Update your profile',
              icon: User,
              href: '/contractor/profile',
              color: 'bg-orange-500'
            }
          ],
          stats: [
            { label: 'Active Projects', value: '5', icon: FileText, color: 'text-blue-500' },
            { label: 'Submitted Proposals', value: '8', icon: FileText, color: 'text-yellow-500' },
            { label: 'Total Revenue', value: '$78,000', icon: DollarSign, color: 'text-green-500' },
            { label: 'Messages', value: '18', icon: MessageSquare, color: 'text-purple-500' }
          ]
        }
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'System administration and monitoring',
          quickActions: [
            {
              title: 'User Management',
              description: 'Manage system users',
              icon: User,
              href: '/admin/users',
              color: 'bg-red-500'
            },
            {
              title: 'System Settings',
              description: 'Configure system settings',
              icon: Settings,
              href: '/admin/settings',
              color: 'bg-blue-500'
            },
            {
              title: 'Analytics',
              description: 'View system analytics',
              icon: TrendingUp,
              href: '/admin/analytics',
              color: 'bg-green-500'
            },
            {
              title: 'Profile',
              description: 'Update your profile',
              icon: User,
              href: '/admin/profile',
              color: 'bg-orange-500'
            }
          ],
          stats: [
            { label: 'Total Users', value: '156', icon: User, color: 'text-blue-500' },
            { label: 'Active Projects', value: '23', icon: FileText, color: 'text-green-500' },
            { label: 'System Status', value: 'Healthy', icon: TrendingUp, color: 'text-green-500' },
            { label: 'Alerts', value: '0', icon: MessageSquare, color: 'text-yellow-500' }
          ]
        }
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to your dashboard',
          quickActions: [
            {
              title: 'Profile',
              description: 'View and edit your profile',
              icon: User,
              href: '/dashboard/profile',
              color: 'bg-blue-500'
            },
            {
              title: 'Settings',
              description: 'Configure your account',
              icon: Settings,
              href: '/dashboard/settings',
              color: 'bg-orange-500'
            }
          ],
          stats: [
            { label: 'Profile', value: 'Complete', icon: User, color: 'text-blue-500' },
            { label: 'Settings', value: 'Configured', icon: Settings, color: 'text-green-500' }
          ]
        }
    }
  }

  const config = getRoleConfig(role)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {config.title}
          </CardTitle>
          <CardDescription>
            {config.description} - You are signed in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Welcome to your personalized dashboard. Use the quick actions below to navigate to different sections.
          </p>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.quickActions.map((action) => {
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

      {/* Role-specific Content */}
      {role === 'homeowner' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New proposal received for Kitchen Renovation</span>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Project "Bathroom Update" started</span>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Message from contractor Mike Wilson</span>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {role === 'contractor' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Kitchen Renovation - 65% complete</span>
                <span className="text-xs text-gray-400">Updated today</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New proposal request from Sarah Johnson</span>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Bathroom Update completed successfully</span>
                <span className="text-xs text-gray-400">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
                <span className="text-xs text-gray-400">Last checked: 5 min ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">5 new user registrations today</span>
                <span className="text-xs text-gray-400">Updated: 1 hour ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Database backup completed successfully</span>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
