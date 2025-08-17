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
      description: 'All time projects',
      gradient: 'from-orange-400 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-500'
    },
    {
      icon: DollarSign,
      label: 'Total Budget',
      value: `$${stats.totalBudget.toLocaleString()}`,
      description: 'Combined project value',
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-500'
    },
    {
      icon: TrendingUp,
      label: 'Active Projects',
      value: stats.activeProjects,
      description: 'Open + Bidding + Awarded',
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-600'
    },
    {
      icon: Clock,
      label: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      description: 'Due within 30 days',
      gradient: 'from-red-400 to-orange-500',
      bgGradient: 'from-red-50 to-orange-50',
      iconBg: 'bg-red-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.bgGradient} border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full transform translate-x-10 -translate-y-10"></div>
          
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                  {item.value}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-orange-800">{item.label}</h3>
              <p className="text-xs text-orange-600/80">{item.description}</p>
            </div>
            
            {/* Progress indicator */}
            <div className="w-full bg-white/50 rounded-full h-1.5">
              <div className={`h-1.5 bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-1000 ease-out`} 
                   style={{ width: `${Math.min(100, (typeof item.value === 'number' ? item.value * 10 : 75))}%` }}>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
