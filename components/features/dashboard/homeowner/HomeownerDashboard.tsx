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
        console.error('Error fetching dashboard data:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full transform -translate-x-48 -translate-y-48"></div>
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full transform translate-x-40"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-red-200/20 to-transparent rounded-full transform translate-y-32"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            {/* Enhanced Loading Spinner */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 animate-pulse">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-300 to-amber-300 rounded-3xl opacity-20 blur-sm animate-pulse"></div>
            </div>
            
            {/* Loading Text */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-red-700 bg-clip-text text-transparent">
                Loading Dashboard
              </h2>
              <p className="text-orange-600/80 text-lg font-medium">
                Preparing your home improvement overview...
              </p>
            </div>
            
            {/* Animated Dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Removed error state rendering - dashboard will always render with available data

  // Calculate stats
  const stats = {
    total: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    bidding: projects.filter(p => p.status === 'bidding').length,
    awarded: projects.filter(p => p.status === 'awarded').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    proposalCount: proposalsCount // Using proposalsCount directly instead of calculating deadlines
  }

  const projectStats = {
    total: stats.total,
    totalBudget: stats.totalBudget,
    activeProjects: stats.open + stats.bidding + stats.awarded,
    upcomingDeadlines: stats.proposalCount
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