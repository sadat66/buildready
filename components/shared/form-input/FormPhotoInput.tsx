import * as React from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormField } from "./FormField";
import { CreateProjectFormInputData } from "@/lib/validation/projects";

interface FormPhotoInputProps {
  name: keyof CreateProjectFormInputData;
  label: string;
  placeholder?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FormPhotoInput({
  name,
  label,
  placeholder = "Upload photos",
  required = false,
  accept = "image/*",
  maxSize = 5,
  className = "",
}: FormPhotoInputProps) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <FormField name={name}>
      {({ field, error }) => {
        const selectedPhotos = field.value || [];

        const handleFileChange = (files: FileList | null) => {
          if (!files) return;

          const newFiles = Array.from(files).filter((file) => {
            // Check file type
            if (!file.type.startsWith("image/")) {
              alert(`${file.name} is not an image file`);
              return false;
            }

            // Check file size
            if (file.size > maxSize * 1024 * 1024) {
              alert(`${file.name} is larger than ${maxSize}MB`);
              return false;
            }

            return true;
          });

          // Convert File objects to file reference structure
          const newFileReferences = newFiles.map((file) => ({
            id: crypto.randomUUID(), // Generate temporary ID
            filename: file.name,
            url: URL.createObjectURL(file), // Temporary blob URL
            size: file.size,
            mimeType: file.type,
            uploadedAt: new Date(),
          }));

          // Update form field value
          field.onChange([...selectedPhotos, ...newFileReferences]);
        };

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);

          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files);
          }
        };

        const removePhoto = (index: number) => {
          const updatedPhotos = selectedPhotos.filter(
            (_: any, i: number) => i !== index
          );
          field.onChange(updatedPhotos);
        };

        return (
          <div className={className}>
            <Label
              htmlFor={`${name}_input`}
              className="flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>
                {label} {required && "*"}
              </span>
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
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG, GIF up to {maxSize}MB each
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

            {/* Photo Previews */}
            {selectedPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Selected Photos ({selectedPhotos.length})
                </p>
                <div className="space-y-2">
                  {selectedPhotos.map((photo: any, index: number) => (
                    <div
                      key={photo.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Tiny rectangular image preview */}
                        <div className="w-12 h-8 bg-white rounded border overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Image name as clickable link with tooltip */}
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block w-full text-left"
                            title={`Click to view: ${photo.filename}`}
                            onClick={() => {
                              // Open image in new tab or modal
                              window.open(photo.url, "_blank");
                            }}
                          >
                            {photo.filename}
                          </button>
                          {/* File size and type info */}
                          <p className="text-xs text-gray-500">
                            {(photo.size / 1024 / 1024).toFixed(2)} MB •{" "}
                            {photo.mimeType}
                          </p>
                        </div>
                      </div>
                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removePhoto(index)}
                        title="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      }}
    </FormField>
  );
}
