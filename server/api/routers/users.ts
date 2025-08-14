import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedureWithSupabase } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'

export const usersRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile, error } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', ctx.user.id)
      .single()

    if (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profile not found',
      })
    }

    return profile
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        first_name: z.string().min(1).optional(),
        last_name: z.string().min(1).optional(),
        phone_number: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ctx.user.id)
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

  // Get user by ID (public)
  getById: publicProcedureWithSupabase
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = ctx.supabase

      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          first_name,
          last_name,
          phone_number,
          address,
          user_role,
          created_at
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return profile
    }),

  // Search contractors
  searchContractors: publicProcedureWithSupabase
    .input(
      z.object({
        query: z.string().optional(),
        location: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = ctx.supabase

      let query = supabase
        .from('users')
        .select(`
          id,
          full_name,
          first_name,
          last_name,
          phone_number,
          address,
          user_role,
          created_at
        `)
        .eq('user_role', 'contractor')

      // Apply filters
      if (input.query) {
        query = query.or(
          `full_name.ilike.%${input.query}%,first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%`
        )
      }

      if (input.location) {
        query = query.ilike('address', `%${input.location}%`)
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

  // Get user statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    // Get project counts
    const { data: projectStats, error: projectError } = await ctx.supabase
      .from('projects')
      .select('status')
      .eq('homeowner_id', userId)

    if (projectError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: projectError.message,
      })
    }

    // Get proposal counts
    const { data: proposalStats, error: proposalError } = await ctx.supabase
      .from('proposals')
      .select('status')
      .eq('contractor_id', userId)

    if (proposalError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: proposalError.message,
      })
    }

    const projectCounts = {
      total: projectStats.length,
      active: projectStats.filter(p => p.status === 'active').length,
      completed: projectStats.filter(p => p.status === 'completed').length,
      pending: projectStats.filter(p => p.status === 'pending').length,
    }

    const proposalCounts = {
      total: proposalStats.length,
      pending: proposalStats.filter(p => p.status === 'pending').length,
      accepted: proposalStats.filter(p => p.status === 'accepted').length,
      rejected: proposalStats.filter(p => p.status === 'rejected').length,
    }

    return {
      projects: projectCounts,
      proposals: proposalCounts,
    }
  }),
})