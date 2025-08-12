'use client'

import { Home, DollarSign, TrendingUp, Clock } from 'lucide-react'

interface ProjectStatsProps {
  stats: {
    total: number
    totalBudget: number
    activeProjects: number
    upcomingDeadlines: number
  }
}

export default function ProjectStats({ stats }: ProjectStatsProps) {
  const statItems = [
    {
      icon: Home,
      label: 'Total Projects',
      value: stats.total,
      description: 'All time projects'
    },
    {
      icon: DollarSign,
      label: 'Total Budget',
      value: `$${stats.totalBudget.toLocaleString()}`,
      description: 'Combined project value'
    },
    {
      icon: TrendingUp,
      label: 'Active Projects',
      value: stats.activeProjects,
      description: 'Open + Bidding + Awarded'
    },
    {
      icon: Clock,
      label: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      description: 'Due within 30 days'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          <div className="text-3xl font-bold">{item.value}</div>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
