import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedureWithSupabase } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'

const proposalSchema = z.object({
  project_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  timeline: z.string().min(1, 'Timeline is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  materials_included: z.boolean().default(false),
  warranty_period: z.string().optional(),
  additional_notes: z.string().optional(),
})

export const proposalsRouter = createTRPCRouter({
  // Create a new proposal
  create: protectedProcedure
    .input(proposalSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if project exists and is not completed/cancelled
      const { data: project, error: projectError } = await ctx.supabase
        .from('projects')
        .select('id, status, homeowner_id')
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

      if (project.homeowner_id === ctx.user.id) {
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

      const { data, error } = await ctx.supabase
        .from('proposals')
        .insert({
          ...input,
          contractor_id: ctx.user.id,
          status: 'pending',
        })
        .select(`
          *,
          projects (
            id,
            title,
            homeowner_id,
            profiles!projects_homeowner_id_fkey (
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
        status: z.enum(['pending', 'accepted', 'rejected']).optional(),
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
            homeowner_id,
            profiles!projects_homeowner_id_fkey (
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
        status: z.enum(['pending', 'accepted', 'rejected']).optional(),
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
            homeowner_id
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
        .eq('projects.homeowner_id', ctx.user.id)

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
            homeowner_id,
            profiles!projects_homeowner_id_fkey (
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
      const isHomeowner = data.projects?.homeowner_id === ctx.user.id

      if (!isContractor && !isHomeowner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this proposal',
        })
      }

      return data
    }),

  // Update proposal status (homeowner only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['accepted', 'rejected']),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get proposal with project info
      const { data: proposal, error: fetchError } = await ctx.supabase
        .from('proposals')
        .select(`
          *,
          projects (
            id,
            homeowner_id,
            status
          )
        `)
        .eq('id', input.id)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        })
      }

      // Check if user is the homeowner
      if (proposal.projects?.homeowner_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the project owner can update proposal status',
        })
      }

      // Check if proposal is still pending
      if (proposal.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only update pending proposals',
        })
      }

      const { data, error } = await ctx.supabase
        .from('proposals')
        .update({
          status: input.status,
          feedback: input.feedback,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      // If proposal is accepted, update project status to active
      if (input.status === 'accepted') {
        await ctx.supabase
          .from('projects')
          .update({ status: 'active' })
          .eq('id', proposal.project_id)
      }

      return data
    }),

  // Update proposal (contractor only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        amount: z.number().positive().optional(),
        timeline: z.string().optional(),
        description: z.string().min(10).optional(),
        materials_included: z.boolean().optional(),
        warranty_period: z.string().optional(),
        additional_notes: z.string().optional(),
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

      const { data, error } = await ctx.supabase
        .from('proposals')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
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
})