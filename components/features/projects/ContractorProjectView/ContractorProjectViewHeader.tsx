'use client'

import { Project } from '@/types/database/projects'
import { User } from '@/types/database/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  User as UserIcon,
  Send,
  MessageSquare
} from 'lucide-react'
import { getProjectStatusConfig } from '@/lib/helpers'
import { formatCurrency, formatDate } from '@/lib/utils'
import ProjectImageGallery from '../HomeownerProjectView/ProjectImageGallery'

interface ContractorProjectViewHeaderProps {
  project: Project
  user: User
  onSubmitProposal: () => void
  onContactHomeowner: () => void
}

export function ContractorProjectViewHeader({
  project,
  onSubmitProposal,
  onContactHomeowner
}: ContractorProjectViewHeaderProps) {
  const projectStatusConfig = getProjectStatusConfig(project.status)

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Section - Project Visuals */}
        <div className="lg:col-span-1">
          <ProjectImageGallery
            projectPhotos={project.project_photos}
            projectType={project.project_type}
          />
        </div>

        {/* Middle Section - Project Details */}
        <div className="lg:col-span-1">
          <div className="space-y-3 sm:space-y-4">
            {/* Project Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
                {project.project_title}
              </h1>
            </div>

            {/* Project Type Badge */}
            <div>
              <span className="bg-orange-100 text-orange-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {project.project_type?.toUpperCase() || 'PROJECT'}
              </span>
            </div>

            {/* Project Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Status:</span>
              <Badge className={`${projectStatusConfig.color} border-0`}>
                {projectStatusConfig.label}
              </Badge>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <div>
                <span className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(project.budget || 0)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 ml-2">
                  Budget
                </span>
              </div>
            </div>

            {/* Location */}
            {project.location.city || project.location.province ? (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-700">
                  {[project.location.city, project.location.province]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            ) : null}

            {/* Timeline */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <div>
                <span className="text-sm sm:text-base text-gray-700">
                  {project.start_date && project.end_date
                    ? `${formatDate(project.start_date)} - ${formatDate(project.end_date)}`
                    : 'Timeline not specified'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Actions & Homeowner Info */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onSubmitProposal}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Proposal
              </Button>
              
              <Button 
                onClick={onContactHomeowner}
                variant="outline" 
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Homeowner
              </Button>
            </div>

            {/* Homeowner Information */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">Posted by</span>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {project.homeowner?.full_name || 'Unknown Homeowner'}
                </h4>
                {project.homeowner?.email && (
                  <p className="text-xs text-gray-600">{project.homeowner.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
