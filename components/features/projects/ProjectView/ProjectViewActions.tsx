'use client'

import { Project } from '@/types/database/projects'
import { Button } from '@/components/ui/button'
import { 
  Edit, 
  Trash2, 
  Plus, 
  Download, 
  Share2, 
  Bookmark,
  Flag,
  Copy,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'

interface ProjectViewActionsProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
  onEditProject: () => void
  onDeleteProject: () => void
}

export function ProjectViewActions({
  project,
  userRole,
  onEditProject,
  onDeleteProject
}: ProjectViewActionsProps) {
  const canEdit = userRole === USER_ROLES.HOMEOWNER && [PROJECT_STATUSES.DRAFT, PROJECT_STATUSES.OPEN_FOR_PROPOSALS].includes(project.status)
  const canDelete = userRole === USER_ROLES.HOMEOWNER && project.status === PROJECT_STATUSES.DRAFT
  const canSubmitProposal = userRole === USER_ROLES.CONTRACTOR && project.status === PROJECT_STATUSES.OPEN_FOR_PROPOSALS

  const copyProjectLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  const shareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: project.project_title,
        text: `Check out this project: ${project.project_title}`,
        url: window.location.href
      })
    } else {
      copyProjectLink()
    }
  }

  const downloadProjectDetails = () => {
    // Create a text file with project details
    const content = `
Project: ${project.project_title}
Project ID: ${project.pid}
Budget: $${project.budget.toLocaleString()}
Location: ${project.location?.address}, ${project.location?.city}, ${project.location?.province}
Timeline: ${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}
Description: ${project.statement_of_work}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.project_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Primary Actions */}
      {canEdit && (
        <Button 
          onClick={onEditProject}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Project
        </Button>
      )}

      {canSubmitProposal && (
        <Button 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit Proposal
        </Button>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={shareProject}
          className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 transition-colors"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        <Button
          variant="outline"
          onClick={copyProjectLink}
          className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 transition-colors"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>

        <Button
          variant="outline"
          onClick={downloadProjectDetails}
          className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Details
        </Button>

        {userRole === 'contractor' && (
          <Button
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 transition-colors"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Save Project
          </Button>
        )}
      </div>

      {/* Destructive Actions */}
      {canDelete && (
        <Button 
          variant="destructive" 
          onClick={onDeleteProject}
          className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Project
        </Button>
      )}

      {/* Report/Flag Action */}
      {userRole === 'contractor' && (
        <Button
          variant="ghost"
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Flag className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      )}

      {/* View Mode Toggle */}
      <Button
        variant="ghost"
        className="text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>
    </div>
  )
}
