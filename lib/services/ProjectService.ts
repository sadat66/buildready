import { createClient } from "@/lib/supabase"
import { CreateProjectFormInputData } from "@/lib/validation/projects"
import { PROJECT_STATUSES } from "@/lib/constants"

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
  substantial_completion: string | null
  is_verified_project: boolean
  project_photos: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: Date
  }>
  files: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: Date
  }>
  creator: string
  status: string
  proposal_count: number
  // Optional fields that might not be in the database schema
  decision_date?: string
  permit_required?: boolean
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
        category: Array.isArray(formData.category) ? formData.category : [formData.category],
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
        start_date: new Date(formData.start_date).toISOString().split('T')[0], // Convert to DATE format
        end_date: new Date(formData.end_date).toISOString().split('T')[0], // Convert to DATE format
        expiry_date: expiryDate.toISOString().split('T')[0], // Convert to DATE format
        substantial_completion: formData.substantial_completion
          ? new Date(formData.substantial_completion).toISOString().split('T')[0]
          : null,
        is_verified_project: formData.is_verified_project,
        project_photos: formData.project_photos || [],
        files: formData.files || [],
        creator: userId,
        status: PROJECT_STATUSES.DRAFT,
        proposal_count: 0,
        // Add missing fields that are in the form but not in the database schema
        decision_date: decisionDate.toISOString().split('T')[0], // Convert to DATE format
        permit_required: formData.permit_required,
      }

      console.log("projectData prepared:", projectData)
      console.log("projectData JSON:", JSON.stringify(projectData, null, 2))
      
      // Log each field individually to debug type issues
      console.log("Field types check:")
      console.log("- project_title:", typeof projectData.project_title, projectData.project_title)
      console.log("- statement_of_work:", typeof projectData.statement_of_work, projectData.statement_of_work)
      console.log("- budget:", typeof projectData.budget, projectData.budget)
      console.log("- category:", typeof projectData.category, Array.isArray(projectData.category), projectData.category)
      console.log("- pid:", typeof projectData.pid, projectData.pid)
      console.log("- location:", typeof projectData.location, projectData.location)
      console.log("- project_type:", typeof projectData.project_type, projectData.project_type)
      console.log("- status:", typeof projectData.status, projectData.status)
      console.log("- start_date:", typeof projectData.start_date, projectData.start_date)
      console.log("- end_date:", typeof projectData.end_date, projectData.end_date)
      console.log("- expiry_date:", typeof projectData.expiry_date, projectData.expiry_date)
      
      // Validate category field specifically
      if (!Array.isArray(projectData.category) || projectData.category.length === 0) {
        console.error("Category validation failed:", projectData.category)
        return {
          success: false,
          error: "Category must be a non-empty array",
        }
      }
      
      // Validate required fields
      const requiredFields = ['project_title', 'statement_of_work', 'budget', 'category', 'pid', 'location']
      const missingFields = requiredFields.filter(field => !projectData[field as keyof ProjectData])
      
      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields)
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        }
      }

      // Check if we have a valid Supabase client
      if (!this.supabase) {
        console.error("Supabase client is not initialized")
        return {
          success: false,
          error: "Database connection not available",
        }
      }

      console.log("Attempting to insert into projects table...")
      
      // Debug: Check what visibility settings value is being sent
      console.log("=== VISIBILITY SETTINGS DEBUG ===")
      console.log("Form visibility_settings:", formData.visibility_settings)
      console.log("Form visibility_settings type:", typeof formData.visibility_settings)
      console.log("Form visibility_settings length:", formData.visibility_settings?.length)
      console.log("Project data visibility_settings:", projectData.visibility_settings)
      console.log("Available visibility settings:", [
        'Private',
        'Shared With Target User', 
        'Shared With Participant',
        'Public To Invitees',
        'Public To Marketplace',
        'AdminOnly'
      ])
      
      // Check for potential case/format issues
      console.log("=== CASE/FORMAT DEBUG ===")
      console.log("Form value lowercase:", formData.visibility_settings?.toLowerCase())
      console.log("Form value uppercase:", formData.visibility_settings?.toUpperCase())
      console.log("Form value with spaces normalized:", formData.visibility_settings?.replace(/\s+/g, ' '))
      console.log("Form value without spaces:", formData.visibility_settings?.replace(/\s/g, ''))
      console.log("=== END CASE/FORMAT DEBUG ===")
      
      console.log("=== END VISIBILITY SETTINGS DEBUG ===")
      
      // Debug: Check budget value
      console.log("=== BUDGET DEBUG ===")
      console.log("Form budget:", formData.budget)
      console.log("Form budget type:", typeof formData.budget)
      console.log("Form budget length:", formData.budget?.toString().length)
      console.log("Project data budget:", projectData.budget)
      console.log("Project data budget type:", typeof projectData.budget)
      console.log("=== END BUDGET DEBUG ===")
      
      // Try different status values if the first one fails
      const possibleStatuses = [
        PROJECT_STATUSES.DRAFT,
        PROJECT_STATUSES.OPEN_FOR_PROPOSALS,
        PROJECT_STATUSES.PROPOSAL_SELECTED,
        PROJECT_STATUSES.IN_PROGRESS,
        PROJECT_STATUSES.COMPLETED,
        PROJECT_STATUSES.CANCELLED
      ]
      let insertSuccess = false
      let finalError: any = null
      let finalData: any = null
      
      console.log("=== STATUS DEBUG ===")
      console.log("Available statuses:", possibleStatuses)
      console.log("First status to try:", possibleStatuses[0])
      console.log("=== END STATUS DEBUG ===")
      
      for (const status of possibleStatuses) {
        try {
          console.log(`Trying to insert with status: "${status}"`)
          console.log("=== DATABASE INSERT DEBUG ===")
          console.log("Full insert data:", { ...projectData, status })
          console.log("Insert data JSON:", JSON.stringify({ ...projectData, status }, null, 2))
          console.log("=== END DATABASE INSERT DEBUG ===")
          
          const { error, data } = await this.supabase
            .from("projects")
            .insert({ ...projectData, status })
            .select()
          
          if (error) {
            console.log(`Status "${status}" failed:`, error.message)
            console.log(`Status "${status}" error details:`, {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
            finalError = error
          } else {
            console.log(`Status "${status}" succeeded!`)
            insertSuccess = true
            finalData = data
            break
          }
        } catch (err) {
          console.log(`Status "${status}" threw error:`, err)
          finalError = err
        }
      }
      
      if (!insertSuccess) {
        console.error("All status values failed. Final error:", finalError)
        return {
          success: false,
          error: `Database error: ${finalError?.message || "All status values failed"}`,
        }
      }
      
      const { error, data } = { error: finalError, data: finalData }

      console.log("Supabase response - data:", data)
      console.log("Supabase response - error:", error)

      if (error) {
        console.error("Database error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        
        // Provide more detailed error information
        let errorMessage = "Database error"
        if (error.message) {
          errorMessage += `: ${error.message}`
        }
        if (error.details) {
          errorMessage += ` (Details: ${error.details})`
        }
        if (error.hint) {
          errorMessage += ` (Hint: ${error.hint})`
        }
        if (error.code) {
          errorMessage += ` (Code: ${error.code})`
        }
        
        return {
          success: false,
          error: errorMessage,
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

  async getAvailableProjects() {
    try {
      const { data, error } = await this.supabase
        .from("projects")
        .select(`
          *,
          homeowner:users!creator(
            id,
            full_name,
            first_name,
            last_name,
            email
          )
        `)
        .in("status", [PROJECT_STATUSES.DRAFT])
        .eq("visibility_settings", "Public To Marketplace")
        .gte("expiry_date", new Date().toISOString())
        .order("created_at", { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Error fetching available projects:", error)
      return { success: false, error: "Failed to fetch available projects" }
    }
  }

  async getProjectsByContractor(contractorId: string) {
    try {
      const { data, error } = await this.supabase
        .from("proposals")
        .select(`
          *,
          project:projects(
            *,
            homeowner:users!creator(
              id,
              full_name,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq("contractor_id", contractorId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Error fetching contractor projects:", error)
      return { success: false, error: "Failed to fetch contractor projects" }
    }
  }

  // Debug method to check what status values are allowed by the database
  async checkDatabaseConstraints() {
    try {
      console.log("Checking database constraints...")
      
      // Try to get the table information
      const { data: tableInfo, error: tableError } = await this.supabase
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_name', 'projects')
        .eq('constraint_type', 'CHECK')
      
      if (tableError) {
        console.error("Error fetching table constraints:", tableError)
      } else {
        console.log("Table constraints:", tableInfo)
      }

      // Try to get existing projects to see what status values are currently used
      const { data: existingProjects, error: projectsError } = await this.supabase
        .from("projects")
        .select("status")
        .limit(10)
      
      if (projectsError) {
        console.error("Error fetching existing projects:", projectsError)
      } else {
        console.log("Existing project statuses:", existingProjects)
      }

      return { success: true }
    } catch (error) {
      console.error("Error checking database constraints:", error)
      return { success: false, error: "Failed to check constraints" }
    }
  }
}
