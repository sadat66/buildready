'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import { PROJECT_STATUSES } from "@/lib/constants"

import ProjectStats from './ProjectStats'
import RecentProjects from './RecentProjects'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/shared/loading-spinner'

export default function HomeownerDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [acceptedProposalsCount, setAcceptedProposalsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

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

  useEffect(() => {
    fetchData()
  }, [user])

  // Function to refresh data after project deletion
  const handleProjectDeleted = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="relative flex items-center justify-center min-h-screen">
          <LoadingSpinner 
            text="Loading Your Dashboard"
            subtitle="Preparing your construction project overview..."
            size="lg"
            variant="default"
            className="text-center"
          />
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
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-sm font-medium text-gray-800">
              Hello, {user?.user_metadata?.full_name ? capitalizeWords(user.user_metadata.full_name) : user?.email?.split('@')[0] ? capitalizeWords(user.email.split('@')[0]) : 'There'}
            </h1>
            <p className="text-xs text-gray-600 mt-1">Welcome to your project dashboard</p>
          </div>

          {/* Project Statistics */}
          <ProjectStats 
            stats={{
              total: projects.length,
              open: projects.filter(p => ['Draft', 'Open for Proposals'].includes(p.status)).length,
              accepted: acceptedProposalsCount,
              completed: projects.filter(p => p.status === PROJECT_STATUSES.COMPLETED).length
            }}
          />

          {/* Recent Projects */}
          <RecentProjects projects={projects.slice(0, 5)} onProjectDeleted={handleProjectDeleted} />
        </div>
      </div>
    </div>
  )
}