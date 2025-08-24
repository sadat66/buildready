'use client'

import { Project } from '@/types/database/projects'
import { User } from '@/types/database/auth'
import { FileText, Calendar, MapPin, Building2, Clock, DollarSign } from 'lucide-react'
import { USER_ROLES } from '@/lib/constants'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ContractorProjectDetailsTabProps {
  project: Project
  user: User
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
}

export function ContractorProjectDetailsTab({ project, user }: ContractorProjectDetailsTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Project Description */}
      {project.statement_of_work && (
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Project Description</h3>
          </div>
          <div className="border-l-4 border-gray-200 pl-3 sm:pl-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {project.statement_of_work}
            </p>
          </div>
        </div>
      )}

      {/* Financial Information */}
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Financial Details</h3>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
            <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Project Budget</span>
            <span className="text-sm sm:text-base text-gray-900 font-semibold">
              {formatCurrency(project.budget || 0)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
            <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Project Type</span>
            <span className="text-sm sm:text-base text-gray-900 capitalize">
              {project.project_type || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Location Details</h3>
        </div>
        <div className="space-y-3">
          {project.location.address && (
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Address</span>
              <span className="text-sm sm:text-base text-gray-900">{project.location.address}</span>
            </div>
          )}
          {project.location.city && (
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">City</span>
              <span className="text-sm sm:text-base text-gray-900">{project.location.city}</span>
            </div>
          )}
          {project.location.province && (
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Province</span>
              <span className="text-sm sm:text-base text-gray-900">{project.location.province}</span>
            </div>
          )}
          {project.location.postalCode && (
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Postal Code</span>
              <span className="text-sm sm:text-base text-gray-900">{project.location.postalCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Categories */}
      {project.category && project.category.length > 0 && (
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Trade Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.category.map((cat, index) => (
              <span key={index} className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Information */}
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Timeline</h3>
        </div>
        <div className="space-y-3">
          {project.start_date && (
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Start Date</span>
              <span className="text-sm sm:text-base text-gray-900">{formatDate(project.start_date)}</span>
            </div>
          )}
          {project.end_date && (
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">End Date</span>
              <span className="text-sm sm:text-base text-gray-900">{formatDate(project.end_date)}</span>
            </div>
          )}
          {project.expiry_date && (
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Proposal Deadline</span>
              <span className="text-sm sm:text-base text-gray-900">{formatDate(project.expiry_date)}</span>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
