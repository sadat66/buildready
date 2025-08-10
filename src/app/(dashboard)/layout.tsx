'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Home, User, Wrench, Shield, ArrowRight } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // Redirect to role-specific dashboard if user has a role
  useEffect(() => {
    if (user && userRole && !loading) {
      const currentPath = window.location.pathname
      const roleDashboard = `/${userRole}/dashboard`
      
      // Only redirect if we're on the generic dashboard path
      if (currentPath === '/dashboard') {
        router.push(roleDashboard)
      }
    }
  }, [user, userRole, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const roleRoutes = [
    {
      title: 'Homeowner Dashboard',
      description: 'Manage your home improvement projects',
      icon: Home,
      href: '/homeowner/dashboard',
      color: 'bg-blue-500',
      features: ['View Projects', 'Review Proposals', 'Message Contractors']
    },
    {
      title: 'Contractor Dashboard',
      description: 'Manage projects and proposals',
      icon: Wrench,
      href: '/contractor/dashboard',
      color: 'bg-green-500',
      features: ['Track Projects', 'Manage Proposals', 'Client Communication']
    },
    {
      title: 'Admin Dashboard',
      description: 'System administration and monitoring',
      icon: Shield,
      href: '/admin/dashboard',
      color: 'bg-red-500',
      features: ['User Management', 'System Settings', 'Analytics']
    }
  ]

  // If user has a role and we're on the generic dashboard, show a message about automatic redirection
  if (userRole && window.location.pathname === '/dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
              <p className="text-gray-600 mb-4">
                Taking you to your {userRole} dashboard
              </p>
            </div>
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                CoreXLab Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.email}
              </span>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Role Selection */}
         

          {/* Common Dashboard Content */}
          {children}
        </div>
      </main>
    </div>
  )
}