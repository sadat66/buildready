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
          const { count: proposalsCount, error: proposalsError } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .eq('project_owner_id', currentUser.id)
            .eq('status', 'pending')
          
          if (proposalsError) {
            console.warn('Proposals table query failed:', proposalsError)
            setProposalsCount(0)
          } else {
            setProposalsCount(proposalsCount || 0)
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
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="text-center text-red-600">{error}</div>
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
    upcomingDeadlines: stats.upcomingDeadlines
  }

  return (
    <div className="space-y-8">
      <UserGreeting userEmail={userEmail} />
      <QuickActions proposalsCount={proposalsCount} />
      <ProjectStats stats={projectStats} />
      <RecentProjects projects={projects} />
    </div>
  )
}