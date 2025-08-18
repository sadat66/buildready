import { useState } from "react"
import { UseFormSetValue } from "react-hook-form"

// Generic interface for file handling - can be reused across different forms
export interface FileHandlingOptions {
  onFileChange?: (files: any[], type: string) => void
  onFileRemove?: (index: number, type: string) => void
  maxFileSize?: number
  allowedTypes?: string[]
}

export function useFileHandling<T extends Record<string, any>>(
  setValue: UseFormSetValue<T>,
  options: FileHandlingOptions = {}
) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (
    files: FileList | null,
    type: "photos" | "documents"
  ) => {
    if (files) {
      const newFiles = Array.from(files)

      if (type === "photos") {
        setSelectedPhotos((prev) => [...prev, ...newFiles])
        // Create proper file objects for the validation schema
        const allPhotos = [...selectedPhotos, ...newFiles]
        const photoObjects = allPhotos.map((f) => ({
          id: crypto.randomUUID(),
          filename: f.name,
          url: URL.createObjectURL(f), // Temporary URL for preview
          size: f.size,
          mimeType: f.type,
          uploadedAt: new Date(),
        }))
        
        // Update form state - this is generic and will work with any form
        setValue("project_photos" as keyof T, photoObjects as any)
        console.log("Updated project_photos:", photoObjects)
        
        // Call custom callback if provided
        options.onFileChange?.(photoObjects, type)
      } else {
        setSelectedFiles((prev) => [...prev, ...newFiles])
        // Create proper file objects for the validation schema
        const allFiles = [...selectedFiles, ...newFiles]
        const fileObjects = allFiles.map((f) => ({
          id: crypto.randomUUID(),
          filename: f.name,
          url: URL.createObjectURL(f), // Temporary URL for preview
          size: f.size,
          mimeType: f.type,
          uploadedAt: new Date(),
        }))
        
        // Update form state
        setValue("files" as keyof T, fileObjects as any)
        console.log("Updated files:", fileObjects)
        
        // Call custom callback if provided
        options.onFileChange?.(fileObjects, type)
      }
    }
  }

  const removeFile = (index: number, type: "photos" | "documents") => {
    if (type === "photos") {
      const newPhotos = selectedPhotos.filter((_, i) => i !== index)
      setSelectedPhotos(newPhotos)
      const photoObjects = newPhotos.map((f) => ({
        id: crypto.randomUUID(),
        filename: f.name,
        url: URL.createObjectURL(f),
        size: f.size,
        mimeType: f.type,
        uploadedAt: new Date(),
      }))
      
      setValue("project_photos" as keyof T, photoObjects as any)
      console.log("Updated project_photos after removal:", photoObjects)
      
      // Call custom callback if provided
      options.onFileRemove?.(index, type)
    } else {
      const newFiles = selectedFiles.filter((_, i) => i !== index)
      setSelectedFiles(newFiles)
      const fileObjects = newFiles.map((f) => ({
        id: crypto.randomUUID(),
        filename: f.name,
        url: URL.createObjectURL(f),
        size: f.size,
        mimeType: f.type,
        uploadedAt: new Date(),
      }))
      
      setValue("files" as keyof T, fileObjects as any)
      console.log("Updated files after removal:", fileObjects)
      
      // Call custom callback if provided
      options.onFileRemove?.(index, type)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, type: "photos" | "documents") => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files, type)
    }
  }

  return {
    dragActive,
    selectedPhotos,
    selectedFiles,
    handleFileChange,
    removeFile,
    handleDrag,
    handleDrop,
  }
}
