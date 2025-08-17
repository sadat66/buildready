'use client'

import { api } from '~/components/providers/TRPCProvider'
import { LoadingSpinner } from '@/components/shared'
import UserGreeting from './UserGreeting'
import QuickActions from './QuickActions'
import ProjectStats from './ProjectStats'
import RecentProjects from './RecentProjects'
import { useAuth } from '@/contexts/AuthContext'

interface TRPCHomeownerDashboardProps {
  userEmail?: string
}

export default function TRPCHomeownerDashboard({ userEmail }: TRPCHomeownerDashboardProps) {
  const { user } = useAuth()

  // Fetch homeowner's projects using TRPC
  const { data: projects, isLoading: projectsLoading, error: projectsError } = api.projects.getMy.useQuery(
    {
      limit: 20,
      offset: 0,
    },
    {
      enabled: !!user,
    }
  )

  // Fetch user stats using TRPC
  const { isLoading: statsLoading } = api.users.getStats.useQuery(
    undefined,
    {
      enabled: !!user,
    }
  )

  if (projectsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (projectsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">Unable to load your dashboard data. Please try again later.</p>
        </div>
      </div>
    )
  }

  const projectsData = projects || []
  const proposalsCount = projectsData.reduce((total, project) => {
    return total + (project.proposals?.length || 0)
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <UserGreeting userEmail={userEmail} />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions proposalsCount={proposalsCount} />
        </div>

        {/* Right Column - Stats and Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Statistics */}
          <ProjectStats
            stats={{
              total: projectsData.length,
              totalBudget: projectsData.reduce((sum, p) => sum + (p.budget || 0), 0),
              activeProjects: projectsData.filter(p => ['Published', 'Bidding', 'In Progress'].includes(p.status)).length,
              upcomingDeadlines: proposalsCount
            }}
          />

          {/* Recent Projects */}
          <RecentProjects projects={projectsData.slice(0, 5)} />
        </div>
      </div>
    </div>
  )
}