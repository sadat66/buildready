import * as React from "react"
import { UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FormField, FormInput, FormTextarea, FormSelect, FormBadge, FormFieldLocation, FormMultiSelect } from "@/components/shared/form-input"
import { CreateProjectFormInputData } from "@/lib/validation/projects"
import { TRADE_CATEGORY_VALUES } from "@/lib/constants"
 
interface BasicInformationSectionProps {
  watch: UseFormWatch<CreateProjectFormInputData>
  setValue: UseFormSetValue<CreateProjectFormInputData>
}

export function BasicInformationSection({ 
  watch, 
  setValue
}: BasicInformationSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
      <div className="space-y-4">
        <FormField name="project_title">
          {({ field, error }) => (
            <FormInput
              {...field}
              label="Project Title"
              placeholder="Enter project title"
              required
              error={error}
            />
          )}
        </FormField>

        <FormField name="statement_of_work">
          {({ field, error }) => (
            <FormTextarea
              {...field}
              label="Statement of Work"
              placeholder="Describe the work to be done"
              rows={4}
              required
              error={error}
            />
          )}
        </FormField>

        <FormField name="category">
          {({ field, error }) => (
            <FormMultiSelect
              label="Category"
              placeholder="Select categories"
              options={TRADE_CATEGORY_VALUES.map(value => ({ value, label: value }))}
              value={field.value}
              onChange={field.onChange}
              required
              error={error}

            />
          )}
        </FormField>

        {watch("category") && watch("category").length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {watch("category").map((cat: string, index: number) => (
              <FormBadge
                key={index}
                label={cat}
                variant="secondary"
                removable
                onRemove={() => {
                  const newCategories = watch("category").filter(
                    (_: string, i: number) => i !== index
                  )
                  setValue("category", newCategories)
                }}
              />
            ))}
          </div>
        )}

        <FormField name="project_type">
          {({ field, error }) => (
            <FormSelect
              {...field}
              label="Project Type"
              placeholder="Select project type"
              options={[
                { value: "New Build", label: "New Build" },
                { value: "Renovation", label: "Renovation" },
                { value: "Repair", label: "Repair" },
                { value: "Addition", label: "Addition" },
                { value: "Demolition", label: "Demolition" },
                { value: "Landscaping", label: "Landscaping" },
                { value: "Specialty", label: "Specialty" },
                { value: "Other", label: "Other" }
              ]}
              required
              error={error}
            />
          )}
        </FormField>

        <FormField name="pid">
          {({ field, error }) => (
            <FormInput
              {...field}
              label="PID (Property ID)"
              placeholder="Enter PID"
              required
              error={error}
            />
          )}
        </FormField>

        <FormField name="certificate_of_title">
          {({ field, error }) => (
            <FormInput
              {...field}
              label="Certificate of Title"
              placeholder="Enter certificate number"
              required
              error={error}
            />
          )}
        </FormField>

        <FormFieldLocation
          name="location"
          label="Project Location"
          placeholder="Enter project location"
          required
          showMap={true}
        />
      </div>
    </div>
  )
}
