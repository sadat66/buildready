'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import dynamic from 'next/dynamic'
import { Breadcrumbs, LoadingSpinner } from '@/components/shared'

// Force client-side rendering to avoid React 19 SSR issues
const ProjectsPage = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.ProjectsPage })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    </div>
  )
})

export default function HomeownerProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        let query = supabase.from('projects').select(`
          id,
          project_title,
          statement_of_work,
          budget,
          category,
          pid,
          location,
          project_type,
          status,
          visibility_settings,
          start_date,
          end_date,
          expiry_date,
          decision_date,
          permit_required,
          substantial_completion,
          is_verified_project,
          certificate_of_title,
          project_photos,
          files,
          creator,
          proposal_count,
          created_at,
          updated_at
        `)
        
        // Get user role from user object
        const userRole = user.user_role || 'homeowner'
        
        // If homeowner, show only their projects
        // If contractor, show all open projects
        if (userRole === 'homeowner') {
          query = query.eq('creator', user.id)
        } else if (userRole === 'contractor') {
          query = query.eq('status', 'Published')
        }
        
        const { data, error: fetchError } = await query.order('created_at', { ascending: false })
        
        if (fetchError) {
          throw fetchError
        }
        
        setProjects(data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/homeowner/dashboard">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </Link>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/homeowner/dashboard' },
            { label: 'Projects', href: '/homeowner/projects' }
          ]}
        />
      </div>

      <ProjectsPage projects={projects} userRole={user?.user_role || 'homeowner'} />
    </div>
  )
}