'use client'

import { Calendar, DollarSign, User, Building, Clock, FileText, Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { capitalizeFirst } from '@/lib/helpers'

interface ProposalCardProps {
  proposal: {
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
  }
  onViewDetails: (proposal: any) => void
  onEditProposal: (proposal: any) => void
  formatDate: (date: string) => string
}

export default function ProposalCard({ 
  proposal, 
  onViewDetails, 
  onEditProposal,
  formatDate
}: ProposalCardProps) {
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'accepted':
        return 'default'
      case 'submitted':
      case 'viewed':
        return 'secondary'
      case 'rejected':
      case 'withdrawn':
      case 'expired':
        return 'destructive'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'submitted':
      case 'viewed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'rejected':
      case 'withdrawn':
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'draft':
        return 'bg-gray-50 text-gray-700 border-gray-300'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900 mb-1 truncate">
              {capitalizeFirst(proposal.project?.project_title || 'Project Title')}
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 leading-relaxed max-h-8 overflow-hidden">
              {proposal.project?.statement_of_work || 'No description available'}
            </CardDescription>
          </div>
          <Badge 
            variant={getStatusVariant(proposal.status)}
            className={`${getStatusColor(proposal.status)} px-2 py-0.5 text-xs font-medium shrink-0 capitalize`}
          >
            {proposal.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Metadata Grid */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-700">
              <span className="font-medium">Proposal:</span> {formatCurrency(proposal.total_amount || 0)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Building className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-700">
              <span className="font-medium">Budget:</span> {formatCurrency(proposal.project?.budget || 0)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-700">
              <span className="font-medium">Homeowner:</span> {proposal.homeowner_details?.full_name || 'Unknown'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-700">
              <span className="font-medium">Submitted:</span> {formatDate(proposal.created_at)}
            </span>
          </div>
        </div>
        
        {/* Timeline */}
        {(proposal.proposed_start_date || proposal.proposed_end_date) && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md">
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium text-gray-700">Timeline:</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {proposal.proposed_start_date && (
                <span className="text-gray-700">
                  <span className="font-medium">Start:</span> {formatDate(proposal.proposed_start_date)}
                </span>
              )}
              {proposal.proposed_end_date && (
                <span className="text-gray-700">
                  <span className="font-medium">End:</span> {formatDate(proposal.proposed_end_date)}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Work Description */}
        {proposal.description_of_work && (
          <div className="mb-4 p-2 bg-gray-50 rounded-md">
            <div className="text-xs text-gray-600">
              <span className="font-medium text-gray-700">Description:</span>
              <div className="mt-1 text-gray-700" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {proposal.description_of_work}
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="outline" 
            onClick={() => onViewDetails(proposal)}
            size="sm"
            className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 h-8 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            onClick={() => onEditProposal(proposal)}
            size="sm"
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
