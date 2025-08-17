'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types/database'
import { LoadingSpinner } from '@/components/shared'
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
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const currentUser = user || (await supabase.auth.getUser()).data.user
        
        if (!currentUser) {
          setLoading(false)
          return
        }
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('homeowner_id', currentUser.id)
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
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="space-y-6 p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
                <LoadingSpinner />
              </div>
              <p className="text-orange-700 font-medium text-center">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="space-y-6 p-8">
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 shadow-lg">
            <div className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <span className="text-white font-bold text-xl">!</span>
                </div>
                <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    bidding: projects.filter(p => p.status === 'bidding').length,
    awarded: projects.filter(p => p.status === 'awarded').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    upcomingDeadlines: projects.filter(p => {
      if (!p.proposal_deadline) return false
      const deadline = new Date(p.proposal_deadline)
      const now = new Date()
      const diffTime = deadline.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 && diffDays <= 30
    }).length
  }

  const projectStats = {
    total: stats.total,
    totalBudget: stats.totalBudget,
    activeProjects: stats.open + stats.bidding + stats.awarded,
    upcomingDeadlines: proposalsCount
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full transform -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full transform translate-x-40"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-red-200/20 to-transparent rounded-full transform translate-y-32"></div>
      </div>
      
      <div className="relative z-10 space-y-8 p-8">
        <UserGreeting userEmail={userEmail} />
        <QuickActions proposalsCount={proposalsCount} />
        <ProjectStats stats={projectStats} />
        <RecentProjects projects={projects} />
        

      </div>
    </div>
  )
}