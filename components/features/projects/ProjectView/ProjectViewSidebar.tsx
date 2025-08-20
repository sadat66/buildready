'use client'

import { Project } from '@/types/database/projects'
import { Proposal } from '@/types/database/proposals'
import { User } from '@/types/database/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react'
import { TabType } from './index'
import { cn } from '@/lib/utils'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'

interface ProjectViewSidebarProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
  proposals: Proposal[]
  user: User
  activeTab: TabType
}

export function ProjectViewSidebar({
  project,
  userRole,
  proposals,
  user,
  activeTab
}: ProjectViewSidebarProps) {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getProjectProgress = () => {
    switch (project.status) {
      case PROJECT_STATUSES.DRAFT: return 10
      case PROJECT_STATUSES.OPEN_FOR_PROPOSALS: return 40
      case PROJECT_STATUSES.PROPOSAL_SELECTED: return 60
      case PROJECT_STATUSES.IN_PROGRESS: return 80
      case PROJECT_STATUSES.COMPLETED: return 100
      default: return 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case PROJECT_STATUSES.DRAFT.toLowerCase(): return 'bg-gray-500'
      case PROJECT_STATUSES.OPEN_FOR_PROPOSALS.toLowerCase(): return 'bg-blue-500'
      case PROJECT_STATUSES.PROPOSAL_SELECTED.toLowerCase(): return 'bg-green-500'
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

  const acceptedProposal = proposals.find(p => p.status === 'accepted')
  const pendingProposals = proposals.filter(p => ['submitted', 'viewed'].includes(p.status))
  const rejectedProposals = proposals.filter(p => p.status === 'rejected')

  return (
    <div className="space-y-6">
      {/* Project Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Project Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              className={cn(
                getStatusColor(project.status),
                "text-white px-3 py-1 text-sm font-medium"
              )}
            >
              {getStatusText(project.status)}
            </Badge>
            
            {project.is_verified_project && (
              <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{getProjectProgress()}%</span>
            </div>
            <Progress value={getProjectProgress()} className="h-2" />
          </div>

          {/* Timeline Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{formatDate(project.start_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{formatDate(project.end_date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Budget</span>
            </div>
            <span className="font-semibold text-green-600">
              ${project.budget.toLocaleString()}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Location</span>
            </div>
            <span className="font-semibold text-blue-600 text-sm">
              {project.location?.city}
            </span>
          </div>

          {/* Proposals Count */}
          {userRole === USER_ROLES.HOMEOWNER && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Proposals</span>
              </div>
              <span className="font-semibold text-orange-600">
                {proposals.length}
              </span>
            </div>
          )}

          {/* Days Remaining */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Deadline</span>
            </div>
            <span className={cn(
              "font-semibold",
              isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-purple-600"
            )}>
              {isExpired ? 'Expired' : `${daysRemaining} days`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Summary (Homeowner Only) */}
      {userRole === USER_ROLES.HOMEOWNER && proposals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Proposals Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {acceptedProposal && (
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm text-green-700">Accepted</span>
                <Badge className="bg-green-600 text-white text-xs">1</Badge>
              </div>
            )}
            
            {pendingProposals.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm text-orange-700">Pending Review</span>
                <Badge className="bg-orange-600 text-white text-xs">{pendingProposals.length}</Badge>
              </div>
            )}
            
            {rejectedProposals.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm text-red-700">Rejected</span>
                <Badge className="bg-red-600 text-white text-xs">{rejectedProposals.length}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userRole === USER_ROLES.HOMEOWNER && (
            <>
              <Button 
                variant="outline" 
                className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => {/* Navigate to proposals tab */}}
              >
                <FileText className="h-4 w-4 mr-2" />
                Review Proposals
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => {/* Navigate to messages tab */}}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </>
          )}

          {userRole === USER_ROLES.CONTRACTOR && (
            <>
              <Button 
                variant="outline" 
                className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => {/* Navigate to proposals tab */}}
              >
                <FileText className="h-4 w-4 mr-2" />
                Submit Proposal
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => {/* Navigate to messages tab */}}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Homeowner
              </Button>
            </>
          )}

          <Button 
            variant="outline" 
            className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => {/* Navigate to documents tab */}}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Documents
          </Button>
        </CardContent>
      </Card>

      {/* Alerts & Warnings */}
      {(isExpired || isExpiringSoon || project.permit_required) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isExpired && (
              <div className="text-sm text-orange-700">
                <strong>Deadline Expired:</strong> This project is no longer accepting new proposals.
              </div>
            )}
            
            {isExpiringSoon && !isExpired && (
              <div className="text-sm text-orange-700">
                <strong>Deadline Approaching:</strong> Proposal deadline expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
              </div>
            )}
            
            {project.permit_required && (
              <div className="text-sm text-orange-700">
                <strong>Permits Required:</strong> This project requires proper permits and approvals.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
