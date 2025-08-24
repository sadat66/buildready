'use client'

import { Project } from '@/types/database/projects'
import { User } from '@/types/database/auth'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Shield, 
  Info,
  Calendar,
  Clock
} from 'lucide-react'
import { USER_ROLES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface ContractorProjectRequirementsTabProps {
  project: Project
  user: User
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
}

export function ContractorProjectRequirementsTab({ project }: ContractorProjectRequirementsTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Legal & Verification Requirements */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Legal & Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Permit Required</p>
                <Badge className={project.permit_required ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                  {project.permit_required ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Verified Project</p>
                <Badge className={project.is_verified_project ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {project.is_verified_project ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Timeline Requirements */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Timeline Requirements</h3>
        <div className="space-y-3">
          {project.start_date && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Project Start Date</p>
                <p className="text-sm text-blue-800">{formatDate(project.start_date)}</p>
              </div>
            </div>
          )}
          
          {project.end_date && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-green-900 font-medium">Project End Date</p>
                <p className="text-sm text-green-800">{formatDate(project.end_date)}</p>
              </div>
            </div>
          )}
          
          {project.expiry_date && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-orange-900 font-medium">Proposal Deadline</p>
                <p className="text-sm text-orange-800">{formatDate(project.expiry_date)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Files & Attachments */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Project Files & Attachments</h3>
        <div className="space-y-4">
          {project.files && project.files.length > 0 ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Attached Files</h4>
              </div>
              <div className="space-y-2">
                {project.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{`File ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No additional files provided</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Additional Information</h3>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Project Requirements</h4>
          </div>
          <p className="text-blue-800 text-sm">
            This project is open for contractor proposals. Please review all requirements carefully before submitting your proposal.
            Ensure you have the necessary qualifications and can meet the timeline requirements.
          </p>
        </div>
      </div>

      {/* Contractor Notes */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Contractor Notes</h3>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">Important Reminders</h4>
          </div>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• Ensure your proposal includes all required information</li>
            <li>• Verify you can meet the proposed timeline</li>
            <li>• Include relevant experience and qualifications</li>
            <li>• Provide competitive pricing within the budget range</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
