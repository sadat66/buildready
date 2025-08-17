import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedureWithSupabase } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'

const proposalSchema = z.object({
  project_id: z.string().uuid(),
  
  // Financial details
  net_amount: z.number().positive('Net amount must be positive'),
  tax_amount: z.number().min(0, 'Tax amount must be non-negative'),
  total_amount: z.number().positive('Total amount must be positive'),
  deposit_amount: z.number().min(0, 'Deposit amount must be non-negative'),
  deposit_due_date: z.string().min(1, 'Deposit due date is required'),
  
  // Timeline details
  proposed_start_date: z.string().min(1, 'Proposed start date is required'),
  proposed_end_date: z.string().min(1, 'Proposed end date is required'),
  estimated_days: z.number().positive('Estimated days must be positive'),
  
  // Penalties
  delay_penalty: z.number().min(0, 'Delay penalty must be non-negative'),
  abandonment_penalty: z.number().min(0, 'Abandonment penalty must be non-negative'),
  
  // Description and additional info
  description: z.string().min(10, 'Description must be at least 10 characters'),
  timeline: z.string().min(1, 'Timeline is required'),
  materials_included: z.boolean().default(false),
  warranty_period: z.string().optional(),
  additional_notes: z.string().optional(),
  
  // Files
  uploaded_files: z.array(z.string()).optional(),
})

export const proposalsRouter = createTRPCRouter({
  // Create a new proposal
  create: protectedProcedure
    .input(proposalSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if project exists and is not completed/cancelled
      const { data: project, error: projectError } = await ctx.supabase
        .from('projects')
        .select('id, status, creator')
        .eq('id', input.project_id)
        .single()

      if (projectError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      if (project.status === 'completed' || project.status === 'cancelled') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot submit proposal for completed or cancelled projects',
        })
      }

      if (project.creator === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot submit a proposal for your own project',
        })
      }

      // Check if user already has a proposal for this project
      const { data: existingProposal } = await ctx.supabase
        .from('proposals')
        .select('id')
        .eq('project_id', input.project_id)
        .eq('contractor_id', ctx.user.id)
        .single()

      if (existingProposal) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already submitted a proposal for this project',
        })
      }

      // Calculate total amount if not provided
      const calculatedTotal = input.total_amount || (input.net_amount + input.tax_amount)
      
      // Calculate estimated days if not provided
      const startDate = new Date(input.proposed_start_date)
      const endDate = new Date(input.proposed_end_date)
      const calculatedDays = input.estimated_days || Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const { data, error } = await ctx.supabase
        .from('proposals')
        .insert({
          ...input,
          total_amount: calculatedTotal,
          estimated_days: calculatedDays,
          contractor_id: ctx.user.id,
          status: 'pending',
        })
        .select(`
          *,
          projects (
            id,
            title,
            creator,
            profiles!projects_creator_fkey (
              id,
              full_name
            )
          ),
          profiles!proposals_contractor_id_fkey (
            id,
            full_name,
            bio,
            hourly_rate,
            years_experience
          )
        `)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      return data
    }),

  // Get proposals for a project
  getByProject: publicProcedureWithSupabase
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = ctx.supabase

      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          profiles!proposals_contractor_id_fkey (
            id,
            full_name,
            bio,
            location,
            hourly_rate,
            years_experience,
            skills,
            license_number,
            insurance_verified
          )
        `)
        .eq('project_id', input.projectId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get user's proposals (contractor view)
  getMy: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('proposals')
        .select(`
          *,
          projects (
            id,
            title,
            description,
            category,
            location,
            status,
            budget,
            creator,
            profiles!projects_creator_fkey (
              id,
              full_name,
              location
            )
          )
        `)
        .eq('contractor_id', ctx.user.id)

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data, error } = await query
        .range(input.offset, input.offset + input.limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get proposals received (homeowner view)
  getReceived: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid().optional(),
        status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('proposals')
        .select(`
          *,
          projects!inner (
            id,
            title,
            description,
            category,
            location,
            status,
            budget,
            creator
          ),
          profiles!proposals_contractor_id_fkey (
            id,
            full_name,
            bio,
            location,
            hourly_rate,
            years_experience,
            skills,
            license_number,
            insurance_verified
          )
        `)
        .eq('projects.creator', ctx.user.id)

      if (input.projectId) {
        query = query.eq('project_id', input.projectId)
      }

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data, error } = await query
        .range(input.offset, input.offset + input.limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get proposal by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('proposals')
        .select(`
          *,
          projects (
            id,
            title,
            description,
            category,
            location,
            status,
            budget,
            creator,
            profiles!projects_creator_fkey (
              id,
              full_name,
              location
            )
          ),
          profiles!proposals_contractor_id_fkey (
            id,
            full_name,
            bio,
            location,
            hourly_rate,
            years_experience,
            skills,
            license_number,
            insurance_verified
          )
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        })
      }

      // Check if user has access to this proposal
      const isContractor = data.contractor_id === ctx.user.id
      const isHomeowner = data.projects?.creator === ctx.user.id

      if (!isContractor && !isHomeowner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this proposal',
        })
      }

      return data
    }),

  // Note: updateStatus endpoint removed - proposal status updates now handled directly via Supabase in frontend

  // Update proposal (contractor only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        
        // Financial details
        net_amount: z.number().positive().optional(),
        tax_amount: z.number().min(0).optional(),
        total_amount: z.number().positive().optional(),
        deposit_amount: z.number().min(0).optional(),
        deposit_due_date: z.string().optional(),
        
        // Timeline details
        proposed_start_date: z.string().optional(),
        proposed_end_date: z.string().optional(),
        estimated_days: z.number().positive().optional(),
        
        // Penalties
        delay_penalty: z.number().min(0).optional(),
        abandonment_penalty: z.number().min(0).optional(),
        
        // Description and additional info
        timeline: z.string().optional(),
        description: z.string().min(10).optional(),
        materials_included: z.boolean().optional(),
        warranty_period: z.string().optional(),
        additional_notes: z.string().optional(),
        
        // Files
        uploaded_files: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Check if user owns the proposal and it's still pending
      const { data: existingProposal, error: fetchError } = await ctx.supabase
        .from('proposals')
        .select('contractor_id, status')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        })
      }

      if (existingProposal.contractor_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own proposals',
        })
      }

      if (existingProposal.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only update pending proposals',
        })
      }

      // Calculate total amount and estimated days if relevant fields are updated
      const finalUpdateData = { ...updateData, updated_at: new Date().toISOString() }
      
      if (updateData.net_amount !== undefined || updateData.tax_amount !== undefined) {
        const { data: currentProposal } = await ctx.supabase
          .from('proposals')
          .select('net_amount, tax_amount')
          .eq('id', id)
          .single()
        
        const netAmount = updateData.net_amount ?? currentProposal?.net_amount
        const taxAmount = updateData.tax_amount ?? currentProposal?.tax_amount
        
        if (netAmount !== undefined && taxAmount !== undefined) {
          finalUpdateData.total_amount = netAmount + taxAmount
        }
      }
      
      if (updateData.proposed_start_date !== undefined || updateData.proposed_end_date !== undefined) {
        const { data: currentProposal } = await ctx.supabase
          .from('proposals')
          .select('proposed_start_date, proposed_end_date')
          .eq('id', id)
          .single()
        
        const startDate = updateData.proposed_start_date ?? currentProposal?.proposed_start_date
        const endDate = updateData.proposed_end_date ?? currentProposal?.proposed_end_date
        
        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          finalUpdateData.estimated_days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        }
      }
      
      const { data, error } = await ctx.supabase
        .from('proposals')
        .update(finalUpdateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      return data
    }),

  // Delete proposal (contractor only)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user owns the proposal and it's still pending
      const { data: existingProposal, error: fetchError } = await ctx.supabase
        .from('proposals')
        .select('contractor_id, status')
        .eq('id', input.id)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        })
      }

      if (existingProposal.contractor_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own proposals',
        })
      }

      if (existingProposal.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only delete pending proposals',
        })
      }

      const { error } = await ctx.supabase
        .from('proposals')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Resubmit proposal (contractor only)
  resubmit: protectedProcedure
    .input(
      z.object({
        originalProposalId: z.string().uuid(),
        ...proposalSchema.omit({ project_id: true }).shape,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { originalProposalId, ...proposalData } = input

      // Get the original proposal to check status and get project_id
      const { data: originalProposal, error: fetchError } = await ctx.supabase
        .from('proposals')
        .select('project_id, contractor_id, status')
        .eq('id', originalProposalId)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Original proposal not found',
        })
      }

      // Check if user owns the original proposal
      if (originalProposal.contractor_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only resubmit your own proposals',
        })
      }

      // Check if original proposal is rejected or withdrawn
      if (!['rejected', 'withdrawn'].includes(originalProposal.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only resubmit rejected or withdrawn proposals',
        })
      }

      // Check if there's already a pending proposal for this project
      const { data: existingPending } = await ctx.supabase
        .from('proposals')
        .select('id')
        .eq('project_id', originalProposal.project_id)
        .eq('contractor_id', ctx.user.id)
        .eq('status', 'pending')
        .single()

      if (existingPending) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have a pending proposal for this project',
        })
      }

      // Calculate total amount and estimated days
      const totalAmount = proposalData.net_amount + proposalData.tax_amount
      const startDate = new Date(proposalData.proposed_start_date)
      const endDate = new Date(proposalData.proposed_end_date)
      const estimatedDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      // Create new proposal
      const { data, error } = await ctx.supabase
        .from('proposals')
        .insert({
          project_id: originalProposal.project_id,
          contractor_id: ctx.user.id,
          ...proposalData,
          total_amount: totalAmount,
          estimated_days: estimatedDays,
          status: 'pending',
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      return data
    }),
})