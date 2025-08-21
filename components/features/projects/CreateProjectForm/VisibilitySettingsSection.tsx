import * as React from "react"
import { FormField, FormSelect, FormSwitch } from "@/components/shared/form-input"
import { VISIBILITY_SETTINGS_VALUES, VISIBILITY_SETTINGS, PROJECT_STATUSES } from "@/lib/constants"
import { useFormContext } from "react-hook-form"
import { CreateProjectFormInputData } from "@/lib/validation/projects"
import { Badge } from "@/components/ui/badge"

export function VisibilitySettingsSection() {
  const { watch } = useFormContext<CreateProjectFormInputData>()
  const visibilitySettings = watch("visibility_settings")
  
  // Determine the project status based on visibility settings
  const getProjectStatus = () => {
    if (visibilitySettings === VISIBILITY_SETTINGS.PUBLIC_TO_MARKETPLACE ||
        visibilitySettings === VISIBILITY_SETTINGS.PUBLIC_TO_INVITEES ||
        visibilitySettings === VISIBILITY_SETTINGS.SHARED_WITH_PARTICIPANT ||
        visibilitySettings === VISIBILITY_SETTINGS.SHARED_WITH_TARGET_USER) {
      return PROJECT_STATUSES.OPEN_FOR_PROPOSALS;
    }
    
    if (visibilitySettings === VISIBILITY_SETTINGS.PRIVATE ||
        visibilitySettings === VISIBILITY_SETTINGS.ADMIN_ONLY) {
      return PROJECT_STATUSES.DRAFT;
    }
    
    return "Unknown";
  }
  
  const projectStatus = getProjectStatus()
  const isPublic = projectStatus === PROJECT_STATUSES.OPEN_FOR_PROPOSALS

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Visibility Settings</h3>

      <div className="space-y-4">
        <FormField name="visibility_settings">
          {({ field, error }) => (
            <FormSelect
              label="Visibility Settings"
              placeholder="Select visibility"
              options={VISIBILITY_SETTINGS_VALUES.map(value => ({ value, label: value }))}
              value={field.value}
              onValueChange={field.onChange}
              required
              error={error}
            />
          )}
        </FormField>

        {/* Status Indicator */}
        {visibilitySettings && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Project will be created as:</span>
              <Badge variant={isPublic ? "default" : "secondary"}>
                {projectStatus}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isPublic 
                ? "Your project will be visible to contractors and open for proposals."
                : "Your project will be saved as a draft and only visible to you."
              }
            </p>
          </div>
        )}

        <FormField name="is_verified_project">
          {({ field, error }) => (
            <FormSwitch
              {...field}
              label="Verified Project"
              error={error}
            />
          )}
        </FormField>
      </div>
    </div>
  )
}
