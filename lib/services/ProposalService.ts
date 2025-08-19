import { createClient } from "@/lib/supabase"
import { ProposalCreate, ProposalUpdate } from "@/types/database/proposals"
import { validateProposalCreate } from "@/lib/database/schemas/proposals"

export interface CreateProposalResult {
  success: boolean
  error?: string
  proposalId?: string
  data?: any
}

export interface UpdateProposalResult {
  success: boolean
  error?: string
  data?: any
}

export class ProposalService {
  private supabase = createClient()

  async createProposal(
    proposalData: ProposalCreate,
    userId: string
  ): Promise<CreateProposalResult> {
    try {
      console.log("ProposalService.createProposal called")
      console.log("proposalData:", proposalData)
      console.log("userId:", userId)

      // Validate proposal data
      const validatedData = validateProposalCreate(proposalData)

      // Check if project exists and is active
      const { data: project, error: projectError } = await this.supabase
        .from('projects')
        .select('id, status, creator')
        .eq('id', validatedData.project)
        .single()

      if (projectError) {
        console.log("Project validation failed:", projectError)
        return {
          success: false,
          error: "Project not found",
        }
      }

      if (project.status === 'completed' || project.status === 'cancelled') {
        return {
          success: false,
          error: "Cannot submit proposal for completed or cancelled projects",
        }
      }

      if (project.creator === userId) {
        return {
          success: false,
          error: "You cannot submit a proposal for your own project",
        }
      }

      // Check if user already has a proposal for this project
      const { data: existingProposal } = await this.supabase
        .from('proposals')
        .select('id')
        .eq('project', validatedData.project)
        .eq('contractor', userId)
        .neq('status', 'withdrawn')
        .single()

      if (existingProposal) {
        return {
          success: false,
          error: "You already have a proposal for this project",
        }
      }

      // Prepare proposal data for database insertion
      const proposalInsertData = {
        title: validatedData.title,
        description_of_work: validatedData.description_of_work,
        project: validatedData.project,
        contractor: validatedData.contractor,
        homeowner: validatedData.homeowner,
        subtotal_amount: validatedData.subtotal_amount,
        tax_included: validatedData.tax_included,
        total_amount: validatedData.total_amount,
        deposit_amount: validatedData.deposit_amount,
        deposit_due_on: validatedData.deposit_due_on,
        proposed_start_date: validatedData.proposed_start_date,
        proposed_end_date: validatedData.proposed_end_date,
        expiry_date: validatedData.expiry_date,
        clause_preview_html: validatedData.clause_preview_html,
        attached_files: validatedData.attached_files || [],
        notes: validatedData.notes,
        visibility_settings: validatedData.visibility_settings || 'private',
        status: 'submitted',
        created_by: userId,
        last_modified_by: userId,
        last_updated: new Date(),
        submitted_date: new Date(),
      }

      console.log("Inserting proposal data:", proposalInsertData)

      const { data, error } = await this.supabase
        .from('proposals')
        .insert(proposalInsertData)
        .select(`
          *,
          project:projects (
            id,
            project_title,
            creator,
            users!projects_creator_fkey (
              id,
              full_name
            )
          ),
          contractor:users!proposals_contractor_fkey (
            id,
            full_name
          )
        `)
        .single()

      if (error) {
        console.error("Database insertion error:", error)
        return {
          success: false,
          error: error.message || "Failed to create proposal",
        }
      }

      console.log("Proposal created successfully:", data.id)
      return {
        success: true,
        proposalId: data.id,
        data: data,
      }
    } catch (error: unknown) {
      console.error("ProposalService.createProposal error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  async updateProposal(
    proposalId: string,
    updateData: ProposalUpdate,
    userId: string
  ): Promise<UpdateProposalResult> {
    try {
      console.log("ProposalService.updateProposal called")
      console.log("proposalId:", proposalId)
      console.log("updateData:", updateData)
      console.log("userId:", userId)

      // Check if user owns the proposal and it's still editable
      const { data: existingProposal, error: fetchError } = await this.supabase
        .from('proposals')
        .select('contractor, status')
        .eq('id', proposalId)
        .single()

      if (fetchError) {
        return {
          success: false,
          error: "Proposal not found",
        }
      }

      if (existingProposal.contractor !== userId) {
        return {
          success: false,
          error: "You can only update your own proposals",
        }
      }

      if (!['draft', 'submitted'].includes(existingProposal.status)) {
        return {
          success: false,
          error: "Can only update draft or submitted proposals",
        }
      }

      const finalUpdateData = {
        ...updateData,
        last_updated: new Date(),
        last_modified_by: userId,
      }

      const { data, error } = await this.supabase
        .from('proposals')
        .update(finalUpdateData)
        .eq('id', proposalId)
        .select()
        .single()

      if (error) {
        console.error("Database update error:", error)
        return {
          success: false,
          error: error.message || "Failed to update proposal",
        }
      }

      console.log("Proposal updated successfully:", data.id)
      return {
        success: true,
        data: data,
      }
    } catch (error: unknown) {
      console.error("ProposalService.updateProposal error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  async getProposalById(proposalId: string, userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('proposals')
        .select(`
          *,
          project:projects (
            id,
            project_title,
            statement_of_work,
            category,
            location,
            status,
            budget,
            creator,
            users!projects_creator_fkey (
              id,
              full_name,
              location
            )
          ),
          contractor:users!proposals_contractor_fkey (
            id,
            full_name
          )
        `)
        .eq('id', proposalId)
        .eq('is_deleted', 'no')
        .single()

      if (error) {
        return {
          success: false,
          error: "Proposal not found",
        }
      }

      // Check if user has access to this proposal
      const isContractor = data.contractor === userId
      const isHomeowner = data.project.creator === userId

      if (!isContractor && !isHomeowner) {
        return {
          success: false,
          error: "You do not have access to this proposal",
        }
      }

      return {
        success: true,
        data: data,
      }
    } catch (error: unknown) {
      console.error("ProposalService.getProposalById error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }
}

export const proposalService = new ProposalService()