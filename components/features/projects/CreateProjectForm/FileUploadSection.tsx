import * as React from "react"
import { Control } from "react-hook-form"
import { Camera, Paperclip, FileText, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

interface FileUploadSectionProps {
  control: Control<CreateProjectFormInputData>
  dragActive: boolean
  selectedPhotos: File[]
  selectedFiles: File[]
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, type: "photos" | "documents") => void
  handleFileChange: (files: FileList | null, type: "photos" | "documents") => void
  removeFile: (index: number, type: "photos" | "documents") => void
}

export function FileUploadSection({
  control,
  dragActive,
  selectedPhotos,
  selectedFiles,
  handleDrag,
  handleDrop,
  handleFileChange,
  removeFile,
}: FileUploadSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Project Documentation</h3>

      <div className="space-y-6">
        {/* Project Photos */}
        <div>
          <Label
            htmlFor="project_photos"
            className="flex items-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Project Photos * (Required)</span>
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
            onDrop={(e) => handleDrop(e, "photos")}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop photos here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, GIF up to 5MB each
            </p>
            <Input
              id="project_photos"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files, "photos")}
              className="mt-4 bg-white"
            />
          </div>

          {/* Photo Previews */}
          {selectedPhotos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Selected Photos ({selectedPhotos.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedPhotos.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-white rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index, "photos")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Files */}
        <div>
          <Label
            htmlFor="project_files"
            className="flex items-center space-x-2"
          >
            <Paperclip className="h-4 w-4" />
            <span>Project Files (Optional)</span>
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
            onDrop={(e) => handleDrop(e, "documents")}
          >
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports PDF, DOC, XLS up to 10MB each
            </p>
            <Input
              id="project_files"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => handleFileChange(e.target.files, "documents")}
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
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index, "documents")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
