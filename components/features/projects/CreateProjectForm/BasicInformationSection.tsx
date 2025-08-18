import * as React from "react"
import { Control } from "react-hook-form"
import { MapPin } from "lucide-react"
import { Label } from "@/components/ui/label"
import { FormField, FormInput, FormTextarea, FormSelect, FormBadge } from "@/components/shared/form-input"
import { TradeCategory } from "@/lib/database/schemas/projects"
import { CreateProjectFormInputData } from "@/lib/validation/projects"
import LocationMap from "../LocationMap"
 
interface BasicInformationSectionProps {
  control: Control<CreateProjectFormInputData>
  watch: any
  setValue: any
  errors: any
}

export function BasicInformationSection({ 
  control, 
  watch, 
  setValue, 
  errors 
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
                if (!currentCategories.includes(value as TradeCategory)) {
                  setValue("category", [
                    ...currentCategories,
                    value as TradeCategory,
                  ])
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

        <div>
          <Label className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Project Location *</span>
          </Label>
          <div className="mt-2">
            <LocationMap
              onLocationSelect={(coordinates: any) => {
                setValue("location", {
                  address: coordinates.address,
                  city: "Vancouver", // Default city - should be parsed from address
                  province: "BC", // Default province
                  postalCode: "V6B 1A1", // Default postal code - should be parsed from address
                  latitude: coordinates.lat,
                  longitude: coordinates.lng,
                })
              }}
              className="mt-2"
            />
          </div>
          {watch("location") && watch("location").address && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {watch("location").address}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Note: Only city will be visible to contractors for privacy
          </p>
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
