'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { Sidebar } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // Redirect to role-specific dashboard if user has a role
  useEffect(() => {
    if (user && userRole && !loading) {
      const currentPath = pathname
      const roleDashboard = `/${userRole}/dashboard`
      
      // Only redirect if we're on the generic dashboard path
      if (currentPath === '/dashboard') {
        router.push(roleDashboard)
      }
    }
  }, [user, userRole, loading, router, pathname])

  // Implement role-based access control for role-specific routes
  useEffect(() => {
    if (user && userRole && !loading && pathname) {
      const pathSegments = pathname.split('/')
      const routeRole = pathSegments[1] // Extract role from /[role]/...
      
      if (routeRole && routeRole !== 'dashboard' && userRole !== routeRole) {
        console.log(`Access denied: User role ${userRole} cannot access ${routeRole} dashboard`)
        setAccessDenied(true)
        // Redirect to their actual role dashboard
        setTimeout(() => {
          router.push(`/${userRole}/dashboard`)
        }, 2000)
      } else {
        setAccessDenied(false)
      }
    }
  }, [user, userRole, loading, pathname, router])

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing refresh')
        window.location.reload()
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">Loading...</div>
              <div className="text-sm text-gray-500 mb-4">
                <div>User: {user ? 'Loaded' : 'Loading...'}</div>
                <div>UserRole: {userRole || 'Loading...'}</div>
                <div>Current Path: {pathname || 'Loading...'}</div>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Page
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // If user has a role and we're on the generic dashboard, show a message about automatic redirection
  if (userRole && pathname === '/dashboard') {
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

  // Show access denied message if user doesn't have permission
  if (accessDenied) {
    const pathSegments = pathname?.split('/') || []
    const routeRole = pathSegments[1]
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access the {routeRole} dashboard. 
            Redirecting you to your {userRole} dashboard...
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen min-h-screen">
        {/* Navbar */}
        <Navbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          sidebarCollapsed={!sidebarOpen}
        />
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  )
}