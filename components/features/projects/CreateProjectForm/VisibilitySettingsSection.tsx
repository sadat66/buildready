import * as React from "react"
import { FormField, FormSelect, FormSwitch } from "@/components/shared/form-input"
import { VISIBILITY_SETTINGS_VALUES } from "@/lib/constants"

export function VisibilitySettingsSection() {
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
