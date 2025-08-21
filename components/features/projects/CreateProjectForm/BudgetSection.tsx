import * as React from "react"
import { DollarSign } from "lucide-react"
import { FormField, FormInput } from "@/components/shared/form-input"

export function BudgetSection() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium flex items-center space-x-2 mb-4">
        <DollarSign className="h-5 w-5" />
        <span>Budget</span>
      </h3>

      <FormField name="budget">
        {({ field, error }) => (
          <FormInput
            {...field}
            label="Budget"
            placeholder="Enter your budget"
            type="number"
            required
            error={error}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseFloat(value);
              field.onChange(isNaN(numValue) ? 0 : numValue);
            }}
          />
        )}
      </FormField>
    </div>
  )
}
