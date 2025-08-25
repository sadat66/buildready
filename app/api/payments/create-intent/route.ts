import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { StripeService } from '@/lib/services/StripeService'
import { z } from 'zod'

const createPaymentIntentSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().default('usd'),
  description: z.string(),
  userType: z.enum(['homeowner', 'contractor']),
  metadata: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Get the user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createPaymentIntentSchema.parse(body)

    // Get user profile for customer creation
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('email, full_name, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Create Stripe customer if needed
    const stripeService = new StripeService()
    const customer = await stripeService.createOrGetCustomer({
      email: userProfile.email,
      name: userProfile.full_name || `${userProfile.first_name} ${userProfile.last_name}`,
      metadata: {
        supabase_user_id: user.id,
        user_type: validatedData.userType,
      },
    })

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: validatedData.amount,
      currency: validatedData.currency,
      customer: customer.id,
      description: validatedData.description,
      metadata: {
        user_id: user.id,
        user_type: validatedData.userType,
        payment_type: validatedData.userType === 'homeowner' ? 'project_creation' : 'proposal_submission',
        ...validatedData.metadata,
      },
    })

    // Store payment record in database
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        id: paymentIntent.id,
        user_id: user.id,
        stripe_customer_id: customer.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'pending',
        payment_type: validatedData.userType === 'homeowner' ? 'project_creation' : 'proposal_submission',
        description: validatedData.description,
        metadata: validatedData.metadata || {},
      })

    if (insertError) {
      console.error('Error storing payment record:', insertError)
      // Continue anyway, as the payment intent was created successfully
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}