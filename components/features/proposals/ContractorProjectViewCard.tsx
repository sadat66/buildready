'use client'

import { Calendar, MapPin, DollarSign, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Project } from '@/types'
import { getProjectStatusConfig, capitalizeFirst } from '@/lib/helpers'

interface ContractorProjectViewCardProps {
  project: Project
  onViewDetails: (project: Project) => void
  onSubmitProposal: (project: Project) => void
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | string) => string
}

export default function ContractorProjectViewCard({ 
  project, 
  onViewDetails, 
  onSubmitProposal,
  formatCurrency,
  formatDate
}: ContractorProjectViewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2 truncate">
              {capitalizeFirst(project.project_title)}
            </CardTitle>
            <div className="text-sm text-gray-600 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {project.statement_of_work || 'No description provided'}
            </div>
          </div>
          <Badge 
            variant={getProjectStatusConfig(project.status).variant} 
            className={`${getProjectStatusConfig(project.status).color} px-3 py-1 text-xs font-medium shrink-0`}
          >
            {getProjectStatusConfig(project.status).label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Metadata Grid */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {project.location?.city || 'Not specified'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {project.budget ? formatCurrency(project.budget) : 'TBD'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              Posted {formatDate(project.created_at)}
            </span>
          </div>
          
          {project.expiry_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Expires {formatDate(project.expiry_date)}
              </span>
            </div>
          )}
        </div>
        
        {/* Categories */}
        {project.category && project.category.length > 0 && (
          <div className="mb-5 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Categories:</span> {project.category.join(', ')}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <Button 
            variant="outline" 
            onClick={() => onViewDetails(project)}
            className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            onClick={() => onSubmitProposal(project)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Submit Proposal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
