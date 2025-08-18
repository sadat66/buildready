import * as React from "react"
import { Control } from "react-hook-form"
import { FormField, FormSelect, FormSwitch } from "@/components/shared/form-input"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

interface VisibilitySettingsSectionProps {
  control: Control<CreateProjectFormInputData>
}

export function VisibilitySettingsSection({ control }: VisibilitySettingsSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Visibility Settings</h3>

      <div className="space-y-4">
        <FormField name="visibility_settings" control={control}>
          {({ field, error }) => (
            <FormSelect
              label="Project Visibility"
              required
              options={[
                { value: "Public", label: "Public" },
                { value: "Private", label: "Private" },
                { value: "Invitation Only", label: "Invitation Only" },
              ]}
              value={field.value}
              onValueChange={field.onChange}
              error={error}
            />
          )}
        </FormField>

        <FormField name="is_verified_project" control={control}>
          {({ field, error }) => (
            <FormSwitch
              label="Verified Project"
              helperText="Mark this project as verified by a professional inspector or engineer"
              checked={field.value}
              onCheckedChange={field.onChange}
              error={error}
            />
          )}
        </FormField>
      </div>
    </div>
  )
}
