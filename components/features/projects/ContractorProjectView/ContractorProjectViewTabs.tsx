'use client'

import { Project } from '@/types/database/projects'
import { Eye, AlertTriangle } from 'lucide-react'
import { ContractorTabType } from '../ContractorProjectView'
import { cn } from '@/lib/utils'

interface ContractorProjectViewTabsProps {
  activeTab: ContractorTabType
  onTabChange: (tab: ContractorTabType) => void
  availableTabs: ContractorTabType[]
  project: Project
}

export function ContractorProjectViewTabs({ 
  activeTab, 
  onTabChange, 
  availableTabs
}: ContractorProjectViewTabsProps) {
  const getTabIcon = (tab: ContractorTabType) => {
    switch (tab) {
      case 'details': 
        return <Eye className="h-4 w-4" />
      case 'requirements': 
        return <AlertTriangle className="h-4 w-4" />
      default: 
        return <Eye className="h-4 w-4" />
    }
  }

  const getTabLabel = (tab: ContractorTabType) => {
    switch (tab) {
      case 'details': 
        return 'Project Details'
      case 'requirements': 
        return 'Requirements'
      default: 
        return 'Details'
    }
  }

  return (
    <nav className="flex space-x-8 my-6 border-b border-gray-200" aria-label="Tabs">
      {availableTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200",
            activeTab === tab
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {getTabIcon(tab)}
          <span>{getTabLabel(tab)}</span>
        </button>
      ))}
    </nav>
  )
}
