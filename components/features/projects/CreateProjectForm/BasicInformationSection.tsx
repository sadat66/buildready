import * as React from "react"
import { Control } from "react-hook-form"
import { FormField, FormInput, FormTextarea, FormSelect, FormBadge, FormFieldLocation } from "@/components/shared/form-input"
import { CreateProjectFormInputData } from "@/lib/validation/projects"
 
interface BasicInformationSectionProps {
  control: Control<CreateProjectFormInputData>
  watch: any
  setValue: any
}

export function BasicInformationSection({ 
  control, 
  watch, 
  setValue
}: BasicInformationSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
      <div className="space-y-4">
        <FormField name="project_title" control={control}>
          {({ field, error }) => (
            <FormInput
              {...field}
              label="Project Title"
              placeholder="e.g., Kitchen Renovation"
              required
              error={error}
            />
          )}
        </FormField>

        <FormField name="statement_of_work" control={control}>
          {({ field, error }) => (
            <FormTextarea
              {...field}
              label="Statement of Work"
              placeholder="Provide detailed description of the work to be done..."
              rows={4}
              required
              error={error}
            />
          )}
        </FormField>

        <FormField name="category" control={control}>
          {({ field, error }) => (
            <FormSelect
              label="Trade Categories"
              placeholder="Select categories"
              required
              options={[
                { value: "Electrical", label: "Electrical" },
                { value: "Framing", label: "Framing" },
                { value: "HVAC", label: "HVAC" },
                { value: "Plumbing", label: "Plumbing" },
                { value: "Roofing", label: "Roofing" },
                { value: "Masonry", label: "Masonry" },
              ]}
              onValueChange={(value) => {
                const currentCategories = watch("category") || []
                if (!currentCategories.includes(value)) {
                  setValue("category", [...currentCategories, value])
                }
              }}
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
                    (_: any, i: number) => i !== index
                  )
                  setValue("category", newCategories)
                }}
              />
            ))}
          </div>
        )}

        <FormField name="project_type" control={control}>
          {({ field, error }) => (
            <FormSelect
              label="Project Type"
              required
              options={[
                { value: "New Build", label: "New Build" },
                { value: "Renovation", label: "Renovation" },
                { value: "Maintenance", label: "Maintenance" },
                { value: "Repair", label: "Repair" },
                { value: "Inspection", label: "Inspection" },
              ]}
              value={field.value}
              onValueChange={field.onChange}
              error={error}
            />
          )}
        </FormField>

        <FormField name="pid" control={control}>
          {({ field, error }) => (
            <FormInput
              {...field}
              label="PID"
              placeholder="e.g., PID-12345-67890"
              required
              error={error}
            />
          )}
        </FormField>

        <FormField name="certificate_of_title" control={control}>
          {({ field, error }) => (
            <FormInput
              {...field}
              label="Certificate of Title (Optional)"
              type="url"
              placeholder="https://example.com/certificate.pdf"
              helperText="Link to property title certificate or ownership document"
              error={error}
            />
          )}
        </FormField>

        <FormFieldLocation
          name="location"
          control={control}
          label="Project Location"
          placeholder="Search for an address..."
          required
          helperText="Enter the project address to help contractors find your project"
        />
      </div>
    </div>
  )
}
