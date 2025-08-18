import * as React from "react"
import { Control } from "react-hook-form"
import { Calendar } from "lucide-react"
import { FormField, FormInput, FormSwitch } from "@/components/shared/form-input"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

interface TimelineSectionProps {
  control: Control<CreateProjectFormInputData>
}

export function TimelineSection({ control }: TimelineSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5" />
        <span>Timeline</span>
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="start_date" control={control}>
            {({ field, error }) => (
              <FormInput
                {...field}
                label="Start Date"
                type="date"
                required
                error={error}
              />
            )}
          </FormField>
          <FormField name="end_date" control={control}>
            {({ field, error }) => (
              <FormInput
                {...field}
                label="End Date"
                type="date"
                required
                error={error}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="expiry_date" control={control}>
            {({ field, error }) => (
              <FormInput
                {...field}
                label="Proposal Deadline"
                type="date"
                required
                helperText="Date when contractors can no longer submit proposals"
                error={error}
              />
            )}
          </FormField>
          <FormField name="decision_date" control={control}>
            {({ field, error }) => (
              <FormInput
                {...field}
                label="Decision Date"
                type="date"
                required
                helperText="Date when you must choose the winning contractor"
                error={error}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="substantial_completion" control={control}>
            {({ field, error }) => (
              <FormInput
                {...field}
                label="Substantial Completion Date (Optional)"
                type="date"
                error={error}
              />
            )}
          </FormField>
          <FormField name="permit_required" control={control}>
            {({ field, error }) => (
              <FormSwitch
                label="Permit Required"
                helperText="Project requires building permits"
                checked={field.value}
                onCheckedChange={field.onChange}
                error={error}
              />
            )}
          </FormField>
        </div>
      </div>
    </div>
  )
}
