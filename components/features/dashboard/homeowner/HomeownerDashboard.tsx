'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'

import UserGreeting from './UserGreeting'
import QuickActions from './QuickActions'
import ProjectStats from './ProjectStats'
import RecentProjects from './RecentProjects'
import { useAuth } from '@/contexts/AuthContext'

interface HomeownerDashboardProps {
  userEmail?: string
}

export default function HomeownerDashboard({ userEmail }: HomeownerDashboardProps) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [proposalsCount, setProposalsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('') // Keep for future use


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
        
        // Try to fetch proposals count - handle gracefully if table doesn't exist
        try {
          // Get project IDs for the current homeowner
          const projectIds = projectsData?.map(project => project.id) || []
          
          if (projectIds.length > 0) {
            const { count: proposalsCount, error: proposalsError } = await supabase
              .from('proposals')
              .select('*', { count: 'exact', head: true })
              .in('project_id', projectIds)
              .eq('status', 'pending')
            
            if (proposalsError) {
              console.warn('Proposals table query failed:', proposalsError)
              setProposalsCount(0)
            } else {
              setProposalsCount(proposalsCount || 0)
            }
          } else {
            setProposalsCount(0)
          }
        } catch (proposalsError) {
          console.warn('Proposals table might not exist yet:', proposalsError)
          setProposalsCount(0)
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative">
        {/* Single consolidated background layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full transform -translate-x-48 -translate-y-48"></div>
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full transform translate-x-40"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-red-200/20 to-transparent rounded-full transform translate-y-32"></div>
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            {/* Enhanced Loading Spinner */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 animate-pulse">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl animate-spin"></div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-300 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-orange-800">Loading Your Dashboard</h2>
              <p className="text-orange-600">Preparing your construction project overview...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative">
      {/* Single consolidated background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full transform -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full transform translate-x-40"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-red-200/20 to-transparent rounded-full transform translate-y-32"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* User Greeting */}
          <UserGreeting userEmail={userEmail} />

          {/* Quick Actions */}
          <QuickActions proposalsCount={proposalsCount} />

          {/* Project Statistics */}
          <ProjectStats 
            stats={{
              total: projects.length,
              totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
              activeProjects: projects.filter(p => ['Published', 'Bidding', 'In Progress'].includes(p.status)).length,
              upcomingDeadlines: proposalsCount
            }}
          />

          {/* Recent Projects */}
          <RecentProjects projects={projects.slice(0, 5)} />
        </div>
      </div>
    </div>
  )
}