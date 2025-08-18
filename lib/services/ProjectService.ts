import { createClient } from "@/lib/supabase"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

export interface CreateProjectResult {
  success: boolean
  error?: string
  projectId?: string
}

export interface ProjectData {
  project_title: string
  statement_of_work: string
  budget: number
  category: string[]
  pid: string
  location: {
    address: string
    city: string
    province: string
    postalCode: string
    latitude: number | null
    longitude: number | null
  }
  certificate_of_title: string | null
  project_type: string
  visibility_settings: string
  start_date: string
  end_date: string
  expiry_date: string
  decision_date: string
  permit_required: boolean
  substantial_completion: string | null
  is_verified_project: boolean
  project_photos: any[]
  files: any[]
  creator: string
  status: string
  proposal_count: number
}

export class ProjectService {
  private supabase = createClient()

  async createProject(
    formData: CreateProjectFormInputData,
    userId: string
  ): Promise<CreateProjectResult> {
    try {
      console.log("ProjectService.createProject called")
      console.log("formData:", formData)
      console.log("userId:", userId)

      // Validate that decision_date comes after expiry_date
      const expiryDate = new Date(formData.expiry_date)
      const decisionDate = new Date(formData.decision_date)

      if (decisionDate <= expiryDate) {
        console.log("Date validation failed: decision_date <= expiry_date")
        return {
          success: false,
          error: "Decision date must be after proposal expiry date",
        }
      }

      // Extract location data from the form
      const locationData = formData.location

      // Prepare project data for database insertion
      const projectData: ProjectData = {
        project_title: formData.project_title,
        statement_of_work: formData.statement_of_work,
        budget: formData.budget,
        category: formData.category,
        pid: formData.pid,
        location: {
          address: locationData.address,
          city: locationData.city,
          province: locationData.province,
          postalCode: locationData.postalCode,
          latitude: locationData.latitude || null,
          longitude: locationData.longitude || null,
        },
        certificate_of_title: formData.certificate_of_title || null,
        project_type: formData.project_type,
        visibility_settings: formData.visibility_settings,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        expiry_date: expiryDate.toISOString(),
        decision_date: decisionDate.toISOString(),
        permit_required: formData.permit_required,
        substantial_completion: formData.substantial_completion
          ? new Date(formData.substantial_completion).toISOString()
          : null,
        is_verified_project: formData.is_verified_project,
        project_photos: formData.project_photos || [],
        files: formData.files || [],
        creator: userId,
        status: "Published",
        proposal_count: 0,
      }

      console.log("projectData prepared:", projectData)

      // Check if we have a valid Supabase client
      if (!this.supabase) {
        console.error("Supabase client is not initialized")
        return {
          success: false,
          error: "Database connection not available",
        }
      }

      console.log("Attempting to insert into projects table...")
      const { error, data } = await this.supabase
        .from("projects")
        .insert(projectData)
        .select()

      console.log("Supabase response - data:", data)
      console.log("Supabase response - error:", error)

      if (error) {
        console.error("Database error:", error)
        return {
          success: false,
          error: `Failed to create project: ${
            error.message || "Unknown database error"
          }`,
        }
      }

      console.log("Project created successfully in database")
      return { 
        success: true, 
        projectId: data?.[0]?.id 
      }
    } catch (error) {
      console.error("Unexpected error in ProjectService:", error)
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

  async getProject(projectId: string) {
    try {
      const { data, error } = await this.supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error("Error fetching project:", error)
      return { success: false, error: "Failed to fetch project" }
    }
  }

  async updateProject(projectId: string, updates: Partial<ProjectData>) {
    try {
      const { data, error } = await this.supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)
        .select()

      if (error) throw error
      return { success: true, data: data?.[0] }
    } catch (error) {
      console.error("Error updating project:", error)
      return { success: false, error: "Failed to update project" }
    }
  }
}
