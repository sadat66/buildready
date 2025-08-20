import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useFormContext } from "react-hook-form"
import { CreateProjectFormInputData } from "@/lib/validation/projects"
import { VISIBILITY_SETTINGS, PROJECT_STATUSES } from "@/lib/constants"

interface FormActionsProps {
  loading: boolean
}

export function FormActions({ loading }: FormActionsProps) {
  const { watch } = useFormContext<CreateProjectFormInputData>()
  const visibilitySettings = watch("visibility_settings")
  
  // Determine button text based on visibility settings
  const getButtonText = () => {
    if (loading) return "Creating Project..."
    
    if (visibilitySettings === VISIBILITY_SETTINGS.PUBLIC_TO_MARKETPLACE ||
        visibilitySettings === VISIBILITY_SETTINGS.PUBLIC_TO_INVITEES ||
        visibilitySettings === VISIBILITY_SETTINGS.SHARED_WITH_PARTICIPANT ||
        visibilitySettings === VISIBILITY_SETTINGS.SHARED_WITH_TARGET_USER) {
      return "Post Project for Proposals"
    }
    
    if (visibilitySettings === VISIBILITY_SETTINGS.PRIVATE ||
        visibilitySettings === VISIBILITY_SETTINGS.ADMIN_ONLY) {
      return "Save as Draft"
    }
    
    return "Create Project"
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-end space-x-4">
        <Link href="/homeowner/dashboard">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {getButtonText()}
        </Button>
      </div>
    </div>
  )
}
