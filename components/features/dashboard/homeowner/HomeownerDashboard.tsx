'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'

import ProjectStats from './ProjectStats'
import RecentProjects from './RecentProjects'
import { useAuth } from '@/contexts/AuthContext'

export default function HomeownerDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [acceptedProposalsCount, setAcceptedProposalsCount] = useState(0)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const currentUser = user || (await supabase.auth.getUser()).data.user
        
        if (!currentUser) {
          console.log('No authenticated user found, skipping data fetch')
          setLoading(false)
          return
        }
        
        console.log('Fetching dashboard data for user:', currentUser.id)
        
        // Fetch projects with all schema fields
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id,
            project_title,
            statement_of_work,
            budget,
            category,
            pid,
            location,
            certificate_of_title,
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
            project_photos,
            files,
            creator,
            proposal_count,
            created_at,
            updated_at
          `)
          .eq('creator', currentUser.id)
          .order('created_at', { ascending: false })
        
        if (projectsError) {
          throw projectsError
        }
        
        setProjects(projectsData || [])

        // Fetch accepted proposals count
        try {
          const { count: acceptedCount, error: proposalsError } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .eq('homeowner', currentUser.id)
            .eq('status', 'accepted')
            .eq('is_deleted', 'no')
          
          if (proposalsError) {
            console.warn('Proposals table query failed:', proposalsError)
          } else {
            setAcceptedProposalsCount(acceptedCount || 0)
          }
        } catch (proposalsError) {
          console.warn('Proposals table might not exist yet:', proposalsError)
        }
        
      } catch (error) {
        // Only log errors if we have a user (avoid logging auth-related errors)
        if (user) {
          console.error('Error fetching dashboard data:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
        // Don't set error state - render dashboard with empty data instead
        // setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            {/* Minimalist Loading Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Loading Your Dashboard</h2>
              <p className="text-gray-600">Preparing your construction project overview...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {/* Error Display */}

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Project Statistics */}
          <ProjectStats 
            stats={{
              total: projects.length,
              open: projects.filter(p => ['Published', 'Bidding'].includes(p.status)).length,
              accepted: acceptedProposalsCount,
              completed: projects.filter(p => p.status === 'Completed').length
            }}
          />

          {/* Recent Projects */}
          <RecentProjects projects={projects.slice(0, 5)} />
        </div>
      </div>
    </div>
  )
}