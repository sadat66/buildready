import { createClient } from "@/lib/supabase"
import { CreateProjectFormInputData } from "@/lib/validation/projects"

export class CreateProjectHandler {
  private supabase = createClient()

  async createProject(
    formData: CreateProjectFormInputData,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("CreateProjectHandler.createProject called")
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

      // Extract location data from the form - now using the new GeospatialLocation structure
      const locationData = formData.location

      // Only store essential database fields for project creation
      const projectData = {
        project_title: formData.project_title,
        statement_of_work: formData.statement_of_work,
        budget: formData.budget,
        category: formData.category,
        pid: formData.pid,
        // New location structure matching the schema
        location: {
          address: locationData.address,
          city: locationData.city,
          province: locationData.province,
          postalCode: locationData.postalCode,
          latitude: locationData.latitude || null,
          longitude: locationData.longitude || null,
        },
        // location_geom will be set automatically by the database trigger
        certificate_of_title: formData.certificate_of_title || null,
        project_type: formData.project_type,
        visibility_settings: formData.visibility_settings,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        expiry_date: expiryDate.toISOString(),
        // ✅ NEW WORKFLOW FIELDS
        decision_date: decisionDate.toISOString(),
        permit_required: formData.permit_required,
        substantial_completion: formData.substantial_completion
          ? new Date(formData.substantial_completion).toISOString()
          : null,
        is_verified_project: formData.is_verified_project,
        project_photos: formData.project_photos || [],
        files: formData.files || [],
        creator: userId,
        status: "Published" as const,
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
      return { success: true }
    } catch (error) {
      console.error("Unexpected error in CreateProjectHandler:", error)
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
