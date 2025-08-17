'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner, Breadcrumbs } from '@/components/shared'
import dynamic from 'next/dynamic'

// Force client-side rendering to avoid React 19 SSR issues
const CreateProjectForm = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.CreateProjectForm })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    </div>
  )
})

export default function CreateProjectPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simple loading state management
    if (user) {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Enhanced Create Project Form Component */}
      <CreateProjectForm 
        user={user}
      />
    </div>
  )
}
