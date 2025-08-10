import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { createClient } from '@supabase/supabase-js'

export const authRouter = createTRPCRouter({
  // Sign up procedure
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        fullName: z.string().min(1),
        role: z.enum(['homeowner', 'contractor']),
      })
    )
    .mutation(async ({ input }) => {
      // Create Supabase client without cookies for authentication
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            role: input.role,
          },
        },
      })

      if (error) {
        // Provide more specific error messages for common sign-up failures
        let errorMessage = error.message
        
        if (error.message === 'User already registered') {
          errorMessage = 'An account with this email already exists. Please sign in instead.'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (error.message.includes('Unable to validate email address')) {
          errorMessage = 'Unable to validate email address. Please check your email and try again.'
        }

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: errorMessage,
        })
      }

      return {
        user: data.user,
        message: 'Check your email for the confirmation link!',
      }
    }),

  // Sign in procedure
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Create Supabase client without cookies for authentication
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      if (error) {
        // Provide more specific error messages for common auth failures
        let errorMessage = error.message
        
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message === 'Email not confirmed') {
          errorMessage = 'Your account is not yet confirmed. Please check your email and click the confirmation link before signing in.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many failed attempts. Please wait a moment before trying again.'
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please check your email or create a new account.'
        }

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: errorMessage,
        })
      }

      return {
        user: data.user,
        session: data.session,
      }
    }),

  // Sign out procedure
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return { success: true }
  }),

  // Reset password procedure
  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // Create Supabase client without cookies for authentication
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/confirm`,
      })

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      return {
        message: 'Check your email for the password reset link!',
      }
    }),

  // Update password procedure
  updatePassword: protectedProcedure
    .input(
      z.object({
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.auth.updateUser({
        password: input.password,
      })

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Get current user procedure
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user
  }),

  // Get current session procedure
  getSession: publicProcedure.query(async () => {
    // Create Supabase client without cookies for session check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return session
  }),
})