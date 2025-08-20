import * as React from "react"
import { Paperclip, Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FormField } from "./FormField"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

interface FormDocumentInputProps {
  name: keyof CreateProjectFormInputData
  label: string
  placeholder?: string
  required?: boolean
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function FormDocumentInput({
  name,
  label,
  placeholder = "Upload documents",
  required = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx",
  maxSize = 10,
  className = ""
}: FormDocumentInputProps) {
  const [dragActive, setDragActive] = React.useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  return (
    <FormField name={name}>
      {({ field, error }) => {
        const selectedFiles = field.value || []
        
        const handleFileChange = (files: FileList | null) => {
          if (!files) return

          const newFiles = Array.from(files).filter(file => {
            // Check file type based on extension
            const fileExtension = file.name.toLowerCase().split('.').pop()
            const allowedExtensions = accept.replace(/\./g, '').split(',')
            
            if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
              alert(`${file.name} is not a supported file type`)
              return false
            }
            
            // Check file size
            if (file.size > maxSize * 1024 * 1024) {
              alert(`${file.name} is larger than ${maxSize}MB`)
              return false
            }
            
            return true
          })

          // Convert File objects to file reference structure
          const newFileReferences = newFiles.map(file => ({
            id: crypto.randomUUID(), // Generate temporary ID
            filename: file.name,
            url: URL.createObjectURL(file), // Temporary blob URL
            size: file.size,
            mimeType: file.type,
            uploadedAt: new Date()
          }))

          // Update form field value
          field.onChange([...selectedFiles, ...newFileReferences])
        }

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)

          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files)
          }
        }

        const removeFile = (index: number) => {
          const updatedFiles = selectedFiles.filter((_: any, i: number) => i !== index)
          field.onChange(updatedFiles)
        }

        const formatFileSize = (bytes: number): string => {
          if (bytes === 0) return '0 Bytes'
          const k = 1024
          const sizes = ['Bytes', 'KB', 'MB', 'GB']
          const i = Math.floor(Math.log(bytes) / Math.log(k))
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        }

        return (
          <div className={className}>
            <Label
              htmlFor={`${name}_input`}
              className="flex items-center space-x-2"
            >
              <Paperclip className="h-4 w-4" />
              <span>{label} {required && "*"}</span>
            </Label>

            {/* Drag & Drop Area */}
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, DOC, XLS up to {maxSize}MB each
              </p>
              <Input
                id={`${name}_input`}
                type="file"
                multiple
                accept={accept}
                onChange={(e) => handleFileChange(e.target.files)}
                className="mt-4 bg-white"
              />
            </div>

            {/* File List */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Selected Files ({selectedFiles.length})
                </p>
                <div className="space-y-2">
                  {selectedFiles.map((file: any, index: number) => (
                    <div key={file.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        {/* File type icon */}
                        <div className="w-12 h-8 bg-white rounded border flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* File name as clickable link with tooltip */}
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block w-full text-left"
                            title={`Click to view: ${file.filename}`}
                            onClick={() => {
                              // Open file in new tab or download
                              window.open(file.url, '_blank')
                            }}
                          >
                            {file.filename}
                          </button>
                          {/* File size and type info */}
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {file.mimeType}
                          </p>
                        </div>
                      </div>
                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFile(index)}
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        )
      }}
    </FormField>
  )
}
