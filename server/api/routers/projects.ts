import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedureWithSupabase } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'

const projectSchema = z.object({
  project_title: z.string().min(1, 'Project title is required'),
  statement_of_work: z.string().min(1, 'Statement of work is required'),
  budget: z.number().positive('Budget must be a positive number'),
  category: z.array(z.string()).min(1, 'At least one category is required'),
  pid: z.string().min(1, 'PID is required'),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  project_type: z.enum(['New Build', 'Renovation', 'Maintenance', 'Repair', 'Inspection']),
  visibility_settings: z.enum(['Public', 'Private', 'Invitation Only']),
  start_date: z.date(),
  end_date: z.date(),
  expiry_date: z.date(),
  decision_date: z.date(),
  permit_required: z.boolean().default(false),
  substantial_completion: z.date().optional(),
  is_verified_project: z.boolean().default(false),
  project_photos: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string().min(1),
    url: z.string().url(),
    size: z.number().positive().optional(),
    mimeType: z.string().optional(),
    uploadedAt: z.date().optional(),
  })).min(1, 'At least one project photo is required'),
  certificate_of_title: z.string().url().optional(),
  files: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string().min(1),
    url: z.string().url(),
    size: z.number().positive().optional(),
    mimeType: z.string().optional(),
    uploadedAt: z.date().optional(),
  })).default([]),
})

export const projectsRouter = createTRPCRouter({
  // Create a new project
  create: protectedProcedure
    .input(projectSchema)
    .mutation(async ({ input, ctx }) => {

      console.log('input', input)
      const { data, error } = await ctx.supabase
        .from('projects')
        .insert({
          ...input,
          creator: ctx.user.id,
          status: 'Published',
          proposal_count: 0,
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      return data
    }),

  // Get all projects (public with filters)
  getAll: publicProcedureWithSupabase
    .input(
      z.object({
        category: z.string().optional(),
        location: z.string().optional(),
        minBudget: z.number().optional(),
        maxBudget: z.number().optional(),
        status: z.enum(['Draft', 'Published', 'Bidding', 'Awarded', 'In Progress', 'Completed', 'Cancelled']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = ctx.supabase

      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_creator_fkey (
            id,
            full_name,
            location
          )
        `)

      // Apply filters
      if (input.category) {
        query = query.eq('category', input.category)
      }

      if (input.location) {
        query = query.ilike('location', `%${input.location}%`)
      }

      if (input.minBudget !== undefined) {
        query = query.gte('budget', input.minBudget)
      }

      if (input.maxBudget !== undefined) {
        query = query.lte('budget', input.maxBudget)
      }

      if (input.status) {
        query = query.eq('status', input.status)
      }

      if (input.search) {
        query = query.or(
          `title.ilike.%${input.search}%,description.ilike.%${input.search}%`
        )
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

  // Get project by ID
  getById: publicProcedureWithSupabase
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = ctx.supabase || (() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Supabase client not available',
        })
      })()

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_creator_fkey (
            id,
            full_name,
            location
          ),
          proposals (
            id,
            contractor,
            amount,
            timeline,
            status,
            created_at,
            users!proposals_contractor_fkey (
              id,
              full_name
            )
          )
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      return data
    }),

  // Get user's projects
  getMy: protectedProcedure
    .input(
      z.object({
        status: z.enum(['Draft', 'Published', 'Bidding', 'Awarded', 'In Progress', 'Completed', 'Cancelled']).optional(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('projects')
        .select(`
          *,
          proposals (
            id,
            contractor_id,
            amount,
            status,
            users!proposals_contractor_fkey (
              id,
              full_name
            )
          )
        `)
        .eq('creator', ctx.user.id)

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

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        ...projectSchema.partial().shape,
        status: z.enum(['Draft', 'Published', 'Bidding', 'Awarded', 'In Progress', 'Completed', 'Cancelled']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Check if user owns the project
      const { data: existingProject, error: fetchError } = await ctx.supabase
        .from('projects')
        .select('creator')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      if (existingProject.creator !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own projects',
        })
      }

      const { data, error } = await ctx.supabase
        .from('projects')
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

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user owns the project
      const { data: existingProject, error: fetchError } = await ctx.supabase
        .from('projects')
        .select('creator')
        .eq('id', input.id)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      if (existingProject.creator !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own projects',
        })
      }

      const { error } = await ctx.supabase
        .from('projects')
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

  // Get project categories
  getCategories: publicProcedureWithSupabase.query(async ({ ctx }) => {
    const supabase = ctx.supabase

    const { data, error } = await supabase
      .from('projects')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))]
    return categories.sort()
  }),
})