'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Camera,
  Paperclip,
  X,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import dynamic from "next/dynamic"
import { TradeCategory } from "@/lib/database/schemas/projects"
import {
  createProjectFormInputSchema,
  CreateProjectFormInputData,
} from "@/lib/validation/projects"
import { ExtendedUser } from "@/contexts/AuthContext"

// Force client-side rendering to avoid React 19 SSR issues
const LocationMap = dynamic(
  () =>
    import("@/components/features/projects").then((mod) => ({
      default: mod.LocationMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
)

// Business logic handler
class CreateProjectHandler {
  private supabase = createClient()

  async createProject(
    formData: CreateProjectFormInputData,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate that decision_date comes after expiry_date
      const expiryDate = new Date(formData.expiry_date)
      const decisionDate = new Date(formData.decision_date)

      if (decisionDate <= expiryDate) {
        return {
          success: false,
          error: "Decision date must be after proposal expiry date",
        }
      }

      // Only store essential database fields for project creation
      const projectData = {
        project_title: formData.project_title,
        statement_of_work: formData.statement_of_work,
        budget: formData.budget,
        category: formData.category,
        pid: formData.pid,
        location: formData.location,
        project_type: formData.project_type,
        visibility_settings: formData.visibility_settings,
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
        expiry_date: expiryDate,
        project_photos: formData.project_photos || [],
        creator: userId,
        status: "Draft" as const,
        proposal_count: 0,
      }

      const { error } = await this.supabase
        .from("projects")
        .insert(projectData)

      if (error) {
        console.error("Database error:", error)
        return {
          success: false,
          error: `Failed to create project: ${
            error.message || "Unknown database error"
          }`,
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Unexpected error:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    }
  }

  async uploadFiles(files: File[]): Promise<string[]> {
    // This is a placeholder implementation
    // In a real app, you'd upload to Supabase Storage or similar
    return files.map((file) => `placeholder_url_${file.name}`)
  }
}

interface CreateProjectFormProps {
  user: ExtendedUser
  className?: string
}

export default function CreateProjectForm({ user, className = '' }: CreateProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const projectHandler = new CreateProjectHandler()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateProjectFormInputData>({
    resolver: zodResolver(
      createProjectFormInputSchema
    ) as Resolver<CreateProjectFormInputData>,
    defaultValues: {
      project_title: "",
      statement_of_work: "",
      budget: 0,
      category: [],
      pid: "",
      location: "",
      certificate_of_title: "",
      project_type: "Renovation",
      visibility_settings: "Public",
      start_date: "",
      end_date: "",
      expiry_date: "",
      decision_date: "",
      substantial_completion: "",
      permit_required: false,
      is_verified_project: false,
      project_photos: [],
      files: [],
    },
  })

  const handleLocationSelect = (coordinates: {
    lat: number
    lng: number
    address: string
  }) => {
    setValue("location", coordinates.address)
  }

  const handleFileChange = (
    files: FileList | null,
    type: "photos" | "documents"
  ) => {
    if (files) {
      const newFiles = Array.from(files)

      if (type === "photos") {
        setSelectedPhotos((prev) => [...prev, ...newFiles])
        setValue(
          "project_photos",
          [...selectedPhotos, ...newFiles].map((f) => f.name)
        )
      } else {
        setSelectedFiles((prev) => [...prev, ...newFiles])
        setValue(
          "files",
          [...selectedFiles, ...newFiles].map((f) => f.name)
        )
      }
    }
  }

  const removeFile = (index: number, type: "photos" | "documents") => {
    if (type === "photos") {
      const newPhotos = selectedPhotos.filter((_, i) => i !== index)
      setSelectedPhotos(newPhotos)
      setValue(
        "project_photos",
        newPhotos.map((f) => f.name)
      )
    } else {
      const newFiles = selectedFiles.filter((_, i) => i !== index)
      setSelectedFiles(newFiles)
      setValue(
        "files",
        newFiles.map((f) => f.name)
      )
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

  const onSubmit = async (data: CreateProjectFormInputData) => {
    if ((user.user_metadata?.role || "homeowner") !== "homeowner") {
      setError("Only homeowners can create projects")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Upload files first
      const photoUrls = await projectHandler.uploadFiles(selectedPhotos)
      const fileUrls = await projectHandler.uploadFiles(selectedFiles)

      // Update form data with uploaded URLs
      const updatedData = {
        ...data,
        project_photos: photoUrls,
        files: fileUrls,
      }

      const result = await projectHandler.createProject(updatedData, user.id)

      if (result.success) {
        router.push("/homeowner/projects")
      } else {
        setError(result.error || "Failed to create project")
      }
    } catch (error) {
      console.error("Error creating project:", error)
      setError("Failed to create project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post a Project</h1>
          <p className="text-muted-foreground">
            Create a detailed project request to attract quality contractors
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-gray-100 rounded-lg border border-red-200 p-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Project Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project_title">Project Title *</Label>
              <Controller
                name="project_title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g., Kitchen Renovation"
                    className={`bg-gray-100 ${errors.project_title ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.project_title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.project_title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="statement_of_work">Statement of Work *</Label>
              <Controller
                name="statement_of_work"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Provide detailed description of the work to be done..."
                    rows={4}
                    className={`bg-gray-100 ${errors.statement_of_work ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.statement_of_work && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.statement_of_work.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Trade Categories *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      const currentCategories = field.value || []
                      if (
                        !currentCategories.includes(value as TradeCategory)
                      ) {
                        field.onChange([
                          ...currentCategories,
                          value as TradeCategory,
                        ])
                      }
                    }}
                  >
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue placeholder="Select categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "Electrical",
                          "Framing",
                          "HVAC",
                          "Plumbing",
                          "Roofing",
                          "Masonry",
                        ] as const
                      ).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {watch("category") && watch("category").length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watch("category").map((cat, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => {
                          const newCategories = watch("category").filter(
                            (_, i) => i !== index
                          )
                          setValue("category", newCategories)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="project_type">Project Type *</Label>
              <Controller
                name="project_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "New Build",
                          "Renovation",
                          "Maintenance",
                          "Repair",
                          "Inspection",
                        ] as const
                      ).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="pid">Project ID *</Label>
              <Controller
                name="pid"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g., PRJ-2024-001"
                    className={`bg-gray-100 ${errors.pid ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.pid && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pid.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="certificate_of_title">
                Certificate of Title (Optional)
              </Label>
              <Controller
                name="certificate_of_title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://example.com/certificate.pdf"
                    className={`bg-gray-100 ${errors.certificate_of_title ? "border-red-500" : ""}`}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to property title certificate or ownership document
              </p>
              {errors.certificate_of_title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.certificate_of_title.message}
                </p>
              )}
            </div>

            <div>
              <Label className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Project Location *</span>
              </Label>
              <div className="mt-2">
                <LocationMap
                  onLocationSelect={handleLocationSelect}
                  className="mt-2"
                />
              </div>
              {watch("location") && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {watch("location")}
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

        {/* Budget */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5" />
            <span>Budget</span>
          </h3>

          <div>
            <Label htmlFor="budget">Project Budget *</Label>
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="15000"
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                  className={`bg-gray-100 ${errors.budget ? "border-red-500" : ""}`}
                />
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your total budget for this project
            </p>
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">
                {errors.budget.message}
              </p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5" />
            <span>Timeline</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className={`bg-gray-100 ${errors.start_date ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className={`bg-gray-100 ${errors.end_date ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry_date">Proposal Deadline *</Label>
                <Controller
                  name="expiry_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className={`bg-gray-100 ${errors.expiry_date ? "border-red-500" : ""}`}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Date when contractors can no longer submit proposals
                </p>
                {errors.expiry_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expiry_date.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="decision_date">Decision Date *</Label>
                <Controller
                  name="decision_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className={`bg-gray-100 ${errors.decision_date ? "border-red-500" : ""}`}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Date when you must choose the winning contractor
                </p>
                {errors.decision_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.decision_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="substantial_completion">
                  Substantial Completion Date (Optional)
                </Label>
                <Controller
                  name="substantial_completion"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" className="bg-gray-100" />}
                />
              </div>
              <div>
                <Label htmlFor="permit_required">Permit Required</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Controller
                    name="permit_required"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    Project requires building permits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">Visibility Settings</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="visibility_settings">
                Project Visibility *
              </Label>
              <Controller
                name="visibility_settings"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        ["Public", "Private", "Invitation Only"] as const
                      ).map((setting) => (
                        <SelectItem key={setting} value={setting}>
                          {setting}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="is_verified_project"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="is_verified_project"
                className="text-sm font-medium"
              >
                Verified Project
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Mark this project as verified by a professional inspector or
              engineer
            </p>
          </div>
        </div>

        {/* File Uploads */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">Project Documentation</h3>

          <div className="space-y-6">
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
                    : errors.project_photos
                    ? "border-red-500 bg-red-50"
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
                  className="mt-4 bg-gray-100"
                />
              </div>

              {errors.project_photos && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.project_photos.message}
                </p>
              )}

              {/* Photo Previews */}
              {selectedPhotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Selected Photos ({selectedPhotos.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedPhotos.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
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
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => removeFile(index, "photos")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Include photos showing site access, current conditions, and
                areas to be worked on
              </p>
            </div>

            <div>
              <Label htmlFor="files" className="flex items-center space-x-2">
                <Paperclip className="h-4 w-4" />
                <span>Project Files (Optional)</span>
              </Label>

              {/* Drag & Drop Area for Project Files */}
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
                <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, DOC, DWG, images up to 10MB each
                </p>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.dwg,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileChange(e.target.files, "documents")
                  }
                  className="mt-4 bg-gray-100"
                />
              </div>

              {/* Project Files List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Selected Files ({selectedFiles.length})
                  </p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
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
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Upload plans, specifications, or other relevant documents
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <Link href="/homeowner/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating Project..." : "Post Project"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
