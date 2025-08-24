'use client'

import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ProposalCard from './ProposalCard'

interface ProposalCardGridProps {
  proposals: Array<{
    id: string
    title: string
    status: string
    subtotal_amount: number | null
    total_amount: number | null
    created_at: string
    description_of_work: string
    proposed_start_date: string | null
    proposed_end_date: string | null
    project?: {
      id: string
      project_title: string
      statement_of_work: string
      category: string
      location: string
      status: string
      budget: number | null
      creator: string
    }
    homeowner_details?: {
      id: string
      full_name: string
      email: string
    }
    contractor?: {
      id: string
      full_name: string
    }
  }>
  onViewDetails: (proposal: ProposalCardGridProps['proposals'][0]) => void
  onEditProposal: (proposal: ProposalCardGridProps['proposals'][0]) => void
  formatDate: (date: string) => string
  onBrowseProjects?: () => void
}

export default function ProposalCardGrid({
  proposals,
  onViewDetails,
  onEditProposal,
  formatDate,
  onBrowseProjects
}: ProposalCardGridProps) {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No proposals yet
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Start by browsing available projects and submitting your first proposal.
          </p>
          {onBrowseProjects && (
            <Button onClick={onBrowseProjects}>
              Browse Projects
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onViewDetails={onViewDetails}
          onEditProposal={onEditProposal}
          formatDate={formatDate}
        />
      ))}
    </div>
  )
}
