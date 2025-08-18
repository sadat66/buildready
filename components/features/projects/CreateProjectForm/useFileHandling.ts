import { useState } from "react"
import { UseFormSetValue } from "react-hook-form"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

export function useFileHandling(setValue: UseFormSetValue<CreateProjectFormInputData>) {
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
        setValue("project_photos", photoObjects)
        console.log("Updated project_photos:", photoObjects)
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
        setValue("files", fileObjects)
        console.log("Updated files:", fileObjects)
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
      setValue("project_photos", photoObjects)
      console.log("Updated project_photos after removal:", photoObjects)
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
      setValue("files", fileObjects)
      console.log("Updated files after removal:", fileObjects)
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
