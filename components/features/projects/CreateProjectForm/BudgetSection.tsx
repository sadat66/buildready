import * as React from "react"
import { Control } from "react-hook-form"
import { DollarSign } from "lucide-react"
import { FormField, FormInput } from "@/components/shared/form-input"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

interface BudgetSectionProps {
  control: Control<CreateProjectFormInputData>
}

export function BudgetSection({ control }: BudgetSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium flex items-center space-x-2 mb-4">
        <DollarSign className="h-5 w-5" />
        <span>Budget</span>
      </h3>

      <FormField name="budget" control={control}>
        {({ field, error }) => (
          <FormInput
            {...field}
            label="Project Budget"
            type="number"
            placeholder="15000"
            required
            helperText="Enter your total budget for this project"
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0
              field.onChange(value)
            }}
            error={error}
          />
        )}
      </FormField>
    </div>
  )
}
