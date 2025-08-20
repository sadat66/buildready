'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/database/projects'
import { Proposal } from '@/types/database/proposals'
import { User } from '@/types/database/auth'
import { ProjectViewTabs } from './ProjectViewTabs'
import { ProjectViewOverview } from './ProjectViewOverview'
import { ProjectViewProposals } from './ProjectViewProposals'
import { ProjectViewMessages } from './ProjectViewMessages'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Share, Globe } from 'lucide-react'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'

export type TabType = 'overview' | 'proposals' | 'messages'

interface ProjectViewProps {
  project: Project
  proposals: Proposal[]
  user: User
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
  onEditProject: () => void
  onDeleteProject: () => void
  onAcceptProposal: (proposalId: string) => Promise<void>
  onRejectProposal: (proposalId: string, reason?: string, notes?: string) => Promise<void>
  onViewProposal: (proposalId: string) => void
  onSubmitProposal?: (proposalData: Record<string, unknown>) => Promise<void>
  loading?: boolean
  proposalsLoading?: boolean
  updatingProposal?: string | null
}

export default function ProjectView({
  project,
  proposals,
  user,
  userRole,
  onEditProject,
  onDeleteProject,
  onAcceptProposal,
  onRejectProposal,
  onViewProposal,
  onSubmitProposal,
  loading = false,
  proposalsLoading = false,
  updatingProposal = null
}: ProjectViewProps) {
  // Smart tab selection based on context
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Auto-select most relevant tab based on context
  useEffect(() => {
    if (userRole === USER_ROLES.HOMEOWNER) {
      if (proposals.length > 0 && proposals.some(p => p.status === 'submitted')) {
        setActiveTab('proposals')
      }
    } else if (userRole === USER_ROLES.CONTRACTOR) {
      if (proposals.length === 0) {
        setActiveTab('overview')
      } else {
        setActiveTab('proposals')
      }
    }
  }, [userRole, proposals, project.status])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    const commonProps = {
      project,
      userRole,
      user
    }

    switch (activeTab) {
      case 'overview':
        return (
          <ProjectViewOverview 
            {...commonProps}
          />
        )
      case 'proposals':
        return (
          <ProjectViewProposals
            {...commonProps}
            proposals={proposals}
            onAcceptProposal={onAcceptProposal}
            onRejectProposal={onRejectProposal}
            onViewProposal={onViewProposal}
            onSubmitProposal={onSubmitProposal}
            loading={proposalsLoading}
            updatingProposal={updatingProposal}
          />
        )
      case 'messages':
        return (
          <ProjectViewMessages
            {...commonProps}
          />
        )
      default:
        return (
          <ProjectViewOverview 
            {...commonProps}
          />
        )
    }
  }

  const getAvailableTabs = (): TabType[] => {
    const baseTabs: TabType[] = ['overview']

    if (userRole === USER_ROLES.HOMEOWNER) {
      return [...baseTabs, 'proposals', 'messages']
    } else if (userRole === USER_ROLES.CONTRACTOR) {
      return [...baseTabs, 'proposals', 'messages']
    }
    return baseTabs
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 1. Top Header - EXACTLY like the image */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                  {project.project_type?.toUpperCase() || 'PROJECT'}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">{project.project_title}</h1>
              <p className="text-sm text-gray-500">
                {project.location.city} • {project.project_type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <Share className="h-4 w-4 mr-2" />
              Share & Promote
            </Button>
            <Button className="bg-green-700 hover:bg-green-800 text-white">
              <Globe className="h-4 w-4 mr-2" />
              Published
            </Button>
          </div>
        </div>

        {/* 3. Navigation Tabs - EXACTLY like the image */}
        <div className="bg-white rounded-t-lg border-b border-gray-200 mb-6">
          <ProjectViewTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={userRole}
            availableTabs={getAvailableTabs()}
            proposalCount={proposals.length}
            project={project}
          />
        </div>

        {/* 2. Main Content - EXACTLY like the image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          {/* Left: Main Content Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header Section */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Header</h3>
                <div className="relative">
                  {project.project_photos && project.project_photos.length > 0 ? (
                    <img
                      src={project.project_photos[0].url}
                      alt={project.project_photos[0].filename}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No project images</p>
                      </div>
                    </div>
                  )}
                  <button className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Change
                  </button>
                </div>
              </div>

              {/* Job Title Section */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Job Title</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={project.project_title}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-gray-50"
                  />
                  <Button
                    size="sm"
                    onClick={onEditProject}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Title
                  </Button>
                </div>
              </div>

              {/* Job Description Section */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Job Description</h3>
                <p className="text-gray-900 leading-relaxed">
                  {project.statement_of_work || 'No description provided'}
                </p>
              </div>

              {/* Responsibilities Section */}
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Responsibilities</h3>
                <ul className="space-y-2 text-gray-900">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Execute all project stages from concept to final completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Collaborate with project managers and team throughout the project lifecycle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Ensure quality standards and timeline adherence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Maintain clear communication with all stakeholders</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Job Details Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Details</h3>
              
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Job Creation Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(project.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Recruitment Period</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(project.start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })} to {new Date(project.end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Hiring Manager</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-medium">
                        {user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.full_name || 'Unknown User'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Recruitment Quota</p>
                  <p className="text-sm font-medium text-gray-900">{proposals.length}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Job Type</p>
                  <p className="text-sm font-medium text-gray-900">{project.project_type}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Experiences</p>
                  <p className="text-sm font-medium text-gray-900">5 Years +</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.location.city}, {project.location.province}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Salary</p>
                  <p className="text-sm font-medium text-gray-900">${project.budget.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Update</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(project.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} ago
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Allow employee to apply</span>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                      <input
                        type="checkbox"
                        className="sr-only"
                        defaultChecked={project.status === PROJECT_STATUSES.OPEN_FOR_PROPOSALS}
                      />
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${project.status === PROJECT_STATUSES.OPEN_FOR_PROPOSALS ? 'translate-x-6 bg-green-500' : 'translate-x-1'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* 4. Tab Content - Connected to tabs above */}
        <div className="bg-white rounded-b-lg shadow-sm">
          {renderTabContent()}
        </div>


      </div>
    </div>
  )
}
