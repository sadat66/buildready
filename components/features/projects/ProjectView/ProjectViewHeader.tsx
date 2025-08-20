'use client'

import { Project } from '@/types/database/projects'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Clock, MapPin, DollarSign } from 'lucide-react'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import { cn } from '@/lib/utils'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'

interface ProjectViewHeaderProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
}

export function ProjectViewHeader({ project, userRole }: ProjectViewHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case PROJECT_STATUSES.DRAFT.toLowerCase(): return 'bg-gray-500'
      case PROJECT_STATUSES.OPEN_FOR_PROPOSALS.toLowerCase(): return 'bg-blue-500'
      case PROJECT_STATUSES.PROPOSAL_SELECTED.toLowerCase(): return 'bg-orange-500'
      case PROJECT_STATUSES.IN_PROGRESS.toLowerCase(): return 'bg-blue-600'
      case PROJECT_STATUSES.COMPLETED.toLowerCase(): return 'bg-gray-900'
      case PROJECT_STATUSES.CANCELLED.toLowerCase(): return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case PROJECT_STATUSES.DRAFT.toLowerCase(): return PROJECT_STATUSES.DRAFT
      case PROJECT_STATUSES.OPEN_FOR_PROPOSALS.toLowerCase(): return 'Bidding in Progress'
      case PROJECT_STATUSES.PROPOSAL_SELECTED.toLowerCase(): return 'Awarded to Contractor'
      case PROJECT_STATUSES.IN_PROGRESS.toLowerCase(): return PROJECT_STATUSES.IN_PROGRESS
      case PROJECT_STATUSES.COMPLETED.toLowerCase(): return PROJECT_STATUSES.COMPLETED
      case PROJECT_STATUSES.CANCELLED.toLowerCase(): return PROJECT_STATUSES.CANCELLED
      default: return status
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatBudget = (budget: number) => {
    return `$${budget.toLocaleString()}`
  }

  const getDaysRemaining = () => {
    const expiryDate = new Date(project.expiry_date)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()
  const isExpired = daysRemaining < 0
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs className="text-sm" />

      {/* Project Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Project Title and Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {project.project_title}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Project ID: {project.pid}</span>
                  <span>•</span>
                  <span>Created {formatDate(project.created_at)}</span>
                  {userRole === USER_ROLES.HOMEOWNER && (
                    <>
                      <span>•</span>
                      <span>{project.proposal_count} proposal{project.proposal_count !== 1 ? 's' : ''} received</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status and Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge 
                  className={cn(
                    getStatusColor(project.status),
                    "text-white px-3 py-1 text-sm font-medium"
                  )}
                >
                  {getStatusText(project.status)}
                </Badge>
                
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  {project.visibility_settings}
                </Badge>
                
                {project.is_verified_project && (
                  <Badge className="bg-green-600 text-white px-3 py-1 text-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}

                {project.permit_required && (
                  <Badge variant="outline" className="border-orange-500 text-orange-700 px-3 py-1 text-sm">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Permits Required
                  </Badge>
                )}
              </div>
            </div>

            {/* Project Stats */}
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-col">
              {/* Budget */}
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-xl font-bold text-green-600">
                  {formatBudget(project.budget)}
                </p>
              </div>

              {/* Timeline */}
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </p>
              </div>

              {/* Location */}
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {project.location.city}, {project.location.province}
                </p>
              </div>
            </div>
          </div>

          {/* Expiry Warning */}
          {isExpired && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Proposal deadline has passed. This project is no longer accepting new proposals.
                </span>
              </div>
            </div>
          )}

          {isExpiringSoon && !isExpired && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Proposal deadline expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
