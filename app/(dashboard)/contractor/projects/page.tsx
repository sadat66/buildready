'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ContractorProjectsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.user_metadata?.role
      
      // Redirect contractors to the view route
      if (userRole === 'contractor') {
        router.push('/contractor/projects/view')
        return
      }
      
      // Redirect other roles to appropriate pages
      if (userRole === 'homeowner') {
        router.push('/homeowner/projects')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}