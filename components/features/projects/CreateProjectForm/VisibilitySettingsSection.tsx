import * as React from "react"
import { FormField, FormSelect, FormSwitch } from "@/components/shared/form-input"

export function VisibilitySettingsSection() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Visibility Settings</h3>

      <div className="space-y-4">
        <FormField name="visibility_settings">
          {({ field, error }) => (
            <FormSelect
              {...field}
              label="Visibility Settings"
              placeholder="Select visibility"
              options={[
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
                { value: "invite_only", label: "Invite Only" }
              ]}
              required
              error={error}
            />
          )}
        </FormField>

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
