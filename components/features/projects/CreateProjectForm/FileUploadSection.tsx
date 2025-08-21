import * as React from "react"
import { FormPhotoInput, FormDocumentInput } from "@/components/shared/form-input"

export function FileUploadSection() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Project Documentation</h3>

      <div className="space-y-6">
        {/* Project Photos */}
        <FormPhotoInput
          name="project_photos"
          label="Project Photos"
          placeholder="Drag and drop photos here, or click to browse"
          required={true}
          accept="image/*"
          maxSize={5}
        />

        {/* Project Files */}
        <FormDocumentInput
          name="files"
          label="Project Files"
          placeholder="Drag and drop documents here, or click to browse"
          required={false}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          maxSize={10}
        />
      </div>
    </div>
  )
}
