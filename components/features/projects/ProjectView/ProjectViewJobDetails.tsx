'use client'

import { Project } from '@/types/database/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Edit, Trash2, Building2, MapPin, Calendar, DollarSign, FileText, CheckCircle } from 'lucide-react'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'

interface ProjectViewJobDetailsProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
  onEditProject: () => void
  onDeleteProject: () => void
}

export function ProjectViewJobDetails({
  project,
  userRole,
  onEditProject,
  onDeleteProject
}: ProjectViewJobDetailsProps) {
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
      case PROJECT_STATUSES.OPEN_FOR_PROPOSALS.toLowerCase(): return 'Open for Proposals'
      case PROJECT_STATUSES.PROPOSAL_SELECTED.toLowerCase(): return 'Proposal Selected'
      case PROJECT_STATUSES.IN_PROGRESS.toLowerCase(): return PROJECT_STATUSES.IN_PROGRESS
      case PROJECT_STATUSES.COMPLETED.toLowerCase(): return PROJECT_STATUSES.COMPLETED
      case PROJECT_STATUSES.CANCELLED.toLowerCase(): return PROJECT_STATUSES.CANCELLED
      default: return status
    }
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Job Details</CardTitle>
            {userRole === USER_ROLES.HOMEOWNER && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onEditProject}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeleteProject}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Header Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Header</h4>
            <div className="relative">
              {project.project_photos && project.project_photos.length > 0 ? (
                <img
                  src={project.project_photos[0].url}
                  alt={project.project_photos[0].filename}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No project image</p>
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
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Job Title</h4>
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
                 <Edit className="h-4 w-4 mr-2" />
                 Edit Title
               </Button>
            </div>
          </div>

          {/* Job Description Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Job Description</h4>
            <p className="text-gray-900 leading-relaxed">
              {project.statement_of_work || 'No description provided'}
            </p>
          </div>

          {/* Responsibilities Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Responsibilities</h4>
            <ul className="space-y-2 text-gray-900">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Execute all project stages from concept to final completion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Collaborate with project managers and team throughout the project lifecycle</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Ensure quality standards and timeline adherence</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Maintain clear communication with all stakeholders</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Project Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Project Type</p>
                <p className="font-medium text-gray-900">{project.project_type}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{project.location.city}, {project.location.province}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="font-medium text-gray-900">
                  {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-medium text-gray-900">${project.budget.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Project Status</h4>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {getStatusText(project.status)}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Permit Required</h4>
              <Badge variant={project.permit_required ? "default" : "secondary"}>
                {project.permit_required ? "Yes" : "No"}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {project.category && project.category.length > 0 ? (
                  project.category.map((cat, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No categories specified</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Files Attached</h4>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {project.files ? project.files.length : 0} file(s)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
