'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Users
} from 'lucide-react'

// Force dynamic rendering for dashboard pages
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  console.log('DashboardLayout render:', { user: !!user, profile: !!profile, loading })

  useEffect(() => {
    console.log('DashboardLayout useEffect:', { user: !!user, loading })
    if (!loading && !user) {
      console.log('Redirecting to signin - no user and not loading')
      router.push('/signin')
    }
  }, [user, loading, router])

  // Add a timeout to prevent infinite loading in layout
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.log('DashboardLayout loading timeout - forcing redirect to signin')
        router.push('/signin')
      }, 15000) // 15 second timeout

      return () => clearTimeout(timeoutId)
    }
  }, [loading, router])

  if (loading) {
    console.log('DashboardLayout showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navigationItems = profile?.role === 'homeowner' ? [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Projects', href: '/dashboard/projects', icon: FolderOpen },
    { name: 'Proposals', href: '/dashboard/proposals', icon: FileText },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Users },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Available Projects', href: '/dashboard/projects', icon: FolderOpen },
    { name: 'My Proposals', href: '/dashboard/proposals', icon: FileText },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Users },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold text-blue-600">BuildConnect</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile?.full_name}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  )
} 