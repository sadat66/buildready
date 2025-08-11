import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedureWithSupabase } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  budget_min: z.number().positive('Minimum budget must be positive'),
  budget_max: z.number().positive('Maximum budget must be positive'),
  location: z.string().min(1, 'Location is required'),
  timeline: z.string().min(1, 'Timeline is required'),
  requirements: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

export const projectsRouter = createTRPCRouter({
  // Create a new project
  create: protectedProcedure
    .input(projectSchema)
    .mutation(async ({ input, ctx }) => {
      // Validate budget range
      if (input.budget_min > input.budget_max) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum budget cannot be greater than maximum budget',
        })
      }

      const { data, error } = await ctx.supabase
        .from('projects')
        .insert({
          ...input,
          homeowner_id: ctx.user.id,
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

  // Get all projects (public with filters)
  getAll: publicProcedureWithSupabase
    .input(
      z.object({
        category: z.string().optional(),
        location: z.string().optional(),
        minBudget: z.number().optional(),
        maxBudget: z.number().optional(),
        status: z.enum(['pending', 'active', 'completed', 'cancelled']).optional(),
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
          profiles!projects_homeowner_id_fkey (
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
        query = query.gte('budget_min', input.minBudget)
      }

      if (input.maxBudget !== undefined) {
        query = query.lte('budget_max', input.maxBudget)
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
          profiles!projects_homeowner_id_fkey (
            id,
            full_name,
            location,
            bio
          ),
          proposals (
            id,
            contractor_id,
            amount,
            timeline,
            status,
            created_at,
            profiles!proposals_contractor_id_fkey (
              id,
              full_name,
              bio,
              hourly_rate,
              years_experience,
              skills
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
        status: z.enum(['pending', 'active', 'completed', 'cancelled']).optional(),
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
            profiles!proposals_contractor_id_fkey (
              id,
              full_name
            )
          )
        `)
        .eq('homeowner_id', ctx.user.id)

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
        status: z.enum(['pending', 'active', 'completed', 'cancelled']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Validate budget range if both are provided
      if (updateData.budget_min && updateData.budget_max && updateData.budget_min > updateData.budget_max) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum budget cannot be greater than maximum budget',
        })
      }

      // Check if user owns the project
      const { data: existingProject, error: fetchError } = await ctx.supabase
        .from('projects')
        .select('homeowner_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      if (existingProject.homeowner_id !== ctx.user.id) {
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
        .select('homeowner_id')
        .eq('id', input.id)
        .single()

      if (fetchError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      if (existingProject.homeowner_id !== ctx.user.id) {
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