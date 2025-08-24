'use client'

import { Project } from '@/types'
import ContractorProjectViewCard from './ContractorProjectViewCard'
 
interface ContractorProjectCardGridProps {
  projects: Project[]
  onViewDetails: (project: Project) => void
  onSubmitProposal: (project: Project) => void
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | string) => string
}

export default function ContractorProjectCardGrid({
  projects,
  onViewDetails,
  onSubmitProposal,
  formatCurrency,
  formatDate
}: ContractorProjectCardGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-muted-foreground">
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No projects found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No projects are currently available.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ContractorProjectViewCard
          key={project.id}
          project={project}
          onViewDetails={onViewDetails}
          onSubmitProposal={onSubmitProposal}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      ))}
    </div>
  )
}
