'use client'

import { Briefcase, Clock, CheckCircle, Target, TrendingUp, DollarSign } from 'lucide-react'

interface ContractorStatsProps {
  stats: {
    totalProposals: number
    activeProposals: number
    acceptedProposals: number
    totalEarnings: number
    winRate: number
    averageProjectValue: number
  }
}

export default function ContractorStats({ stats }: ContractorStatsProps) {
  const statItems = [
    {
      title: 'Total Proposals',
      value: stats.totalProposals.toLocaleString(),
      icon: Briefcase,
      description: 'Proposals submitted',
      subtitle: 'All time submissions',
      color: 'text-blue-600'
    },
    {
      title: 'Active Proposals',
      value: stats.activeProposals.toLocaleString(),
      icon: Clock,
      description: 'Under review',
      subtitle: 'Awaiting decisions',
      color: 'text-orange-600'
    },
    {
      title: 'Accepted Proposals',
      value: stats.acceptedProposals.toLocaleString(),
      icon: CheckCircle,
      description: 'Projects won',
      subtitle: 'Successfully awarded',
      color: 'text-green-600'
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: Target,
      description: 'Success rate',
      subtitle: 'Proposals accepted',
      color: 'text-purple-600'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      description: 'From accepted projects',
      subtitle: 'Lifetime earnings',
      color: 'text-emerald-600'
    },
    {
      title: 'Avg Project Value',
      value: `$${stats.averageProjectValue.toLocaleString()}`,
      icon: TrendingUp,
      description: 'Per accepted project',
      subtitle: 'Typical project size',
      color: 'text-indigo-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg transition-all duration-200 shadow-md">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
            <div className={`p-2 rounded-lg bg-gray-50`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {item.value}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <item.icon className="h-3 w-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-700">{item.description}</span>
            </div>
            <p className="text-xs text-gray-500">{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
