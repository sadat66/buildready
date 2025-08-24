'use client'

import { useState } from 'react'
import { Project } from '@/types/database/projects'
import { User } from '@/types/database/auth'
import { USER_ROLES } from '@/lib/constants'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import { ContractorProjectViewHeader } from './ContractorProjectView/ContractorProjectViewHeader'
import { ContractorProjectViewTabs } from './ContractorProjectView/ContractorProjectViewTabs'
import { ContractorProjectDetailsTab } from './ContractorProjectView/ContractorProjectDetailsTab'
import { ContractorProjectRequirementsTab } from './ContractorProjectView/ContractorProjectRequirementsTab'

export type ContractorTabType = 'details' | 'requirements'

interface ContractorProjectViewProps {
  project: Project
  user: User
  userRole: (typeof USER_ROLES)[keyof typeof USER_ROLES]
  onSubmitProposal: () => void
  onContactHomeowner: () => void
  loading?: boolean
}

export default function ContractorProjectView({
  project,
  user,
  userRole,
  onSubmitProposal,
  onContactHomeowner,
  loading = false
}: ContractorProjectViewProps) {
  const [activeTab, setActiveTab] = useState<ContractorTabType>('details')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    const commonProps = {
      project,
      userRole,
      user,
    }

    switch (activeTab) {
      case 'details':
        return <ContractorProjectDetailsTab {...commonProps} />
      case 'requirements':
        return <ContractorProjectRequirementsTab {...commonProps} />
      default:
        return <ContractorProjectDetailsTab {...commonProps} />
    }
  }

  const getAvailableTabs = (): ContractorTabType[] => {
    return ['details', 'requirements']
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/contractor/dashboard' },
              { label: 'Projects', href: '/contractor/projects' },
              { label: project.project_title || 'Project Details', href: '#' }
            ]}
          />
        </div>

        {/* Project Header */}
        <div className="mb-4 sm:mb-6">
          <ContractorProjectViewHeader 
            project={project} 
            user={user}
            onSubmitProposal={onSubmitProposal}
            onContactHomeowner={onContactHomeowner}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4 sm:mb-6 overflow-x-auto">
          <ContractorProjectViewTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            availableTabs={getAvailableTabs()}
            project={project}
          />
        </div>

        {/* Tab Content */}
        <div className="overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
