'use client'

import { Home, Clock, Award, CheckCircle } from 'lucide-react'

interface ProjectStatsProps {
  stats: {
    total: number
    open: number
    awarded: number
    completed: number
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
      icon: Clock,
      label: 'Open Projects',
      value: stats.open,
      description: 'Published + Bidding'
    },
    {
      icon: Award,
      label: 'Awarded Projects',
      value: stats.awarded,
      description: 'Awarded + In Progress'
    },
    {
      icon: CheckCircle,
      label: 'Completed Projects',
      value: stats.completed,
      description: 'Successfully finished'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="relative overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300 group">
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-50 transition-colors duration-200">
                <item.icon className="h-6 w-6 text-gray-600 group-hover:text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {item.value}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-900">{item.label}</h3>
              <p className="text-xs text-gray-600">{item.description}</p>
            </div>
            
            {/* Progress indicator */}
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 bg-orange-500 rounded-full transition-all duration-1000 ease-out" 
                   style={{ width: `${Math.min(100, (typeof item.value === 'number' ? item.value * 10 : 75))}%` }}>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
