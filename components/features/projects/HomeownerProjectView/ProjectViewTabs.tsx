'use client'

import { Project } from '@/types/database/projects'
import { Badge } from '@/components/ui/badge'
import { Eye, FileText } from 'lucide-react'
import { TabType } from './index'
import { cn } from '@/lib/utils'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'

interface ProjectViewTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
  availableTabs: TabType[]
  proposalCount: number
  project: Project
}

export function ProjectViewTabs({ activeTab, onTabChange, userRole, availableTabs, proposalCount, project }: ProjectViewTabsProps) {
  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'details': return <Eye className="h-4 w-4" />
      case 'proposals': return <FileText className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'details': return 'Details'
      case 'proposals':
        if (userRole === USER_ROLES.HOMEOWNER) {
          return 'Proposals'
        }
        return userRole === USER_ROLES.CONTRACTOR ? 'My Proposals' : 'Proposals'
      default: return 'details'
    }
  }



  const isTabDisabled = (tab: TabType) => {
    if (tab === 'proposals' && userRole === USER_ROLES.CONTRACTOR && project.status === PROJECT_STATUSES.COMPLETED) return true
    return false
  }

  const getTabBadge = (tab: TabType) => {
    switch (tab) {
      case 'proposals':
        if (userRole === USER_ROLES.HOMEOWNER && proposalCount > 0) {
          return (
            <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800">
              {proposalCount}
            </Badge>
          )
        }
        return null
      default: return null
    }
  }

  return (
         <nav className="flex space-x-8 my-6 border-b border-gray-200 " aria-label="Tabs">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              disabled={isTabDisabled(tab)}
              className={cn(
                "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200",
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                isTabDisabled(tab) && "opacity-50 cursor-not-allowed"
              )}
            >
              {getTabIcon(tab)}
              <span>{getTabLabel(tab)}</span>
              {getTabBadge(tab)}
            </button>
          ))}
        </nav>
    )
}
