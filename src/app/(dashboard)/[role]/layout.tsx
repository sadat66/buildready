'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/types/database'

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const role = params?.role as string
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // Implement role-based access control
  useEffect(() => {
    if (user && userRole && role && !loading) {
      console.log(`Role check: userRole=${userRole}, routeRole=${role}`)
      // Check if user has access to this role route
      if (userRole !== role) {
        console.log(`Access denied: User role ${userRole} cannot access ${role} dashboard`)
        setAccessDenied(true)
        // Redirect to their actual role dashboard
        setTimeout(() => {
          router.push(`/${userRole}/dashboard`)
        }, 2000)
      } else {
        console.log(`Access granted: User role ${userRole} can access ${role} dashboard`)
        setAccessDenied(false)
      }
    }
  }, [user, userRole, role, loading, router])

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
        <div className="text-center">
          <div className="mb-4">Loading...</div>
          <div className="text-sm text-gray-500 mb-4">
            <div>User: {user ? 'Loaded' : 'Loading...'}</div>
            <div>UserRole: {userRole || 'Loading...'}</div>
            <div>Route Role: {role || 'Loading...'}</div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">No user found, redirecting to signin...</div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Invalid route</div>
          <div className="text-sm text-gray-500">Role parameter not found</div>
        </div>
      </div>
    )
  }

  // Show access denied message if user doesn't have permission
  if (accessDenied) {
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
            You don't have permission to access the {role} dashboard. 
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 capitalize">
                {role} Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.email}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                {role}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}
