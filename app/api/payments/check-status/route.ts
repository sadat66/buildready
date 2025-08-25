import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    // Get userType from query params
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('userType')

    if (!userType || !['homeowner', 'contractor'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Check if user has paid
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('payment_type', userType === 'homeowner' ? 'project_creation' : 'proposal_submission')
      .eq('status', 'succeeded')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking payment status:', error)
      return NextResponse.json(
        { error: 'Failed to check payment status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      hasPaid: !!payment,
      payment: payment || null,
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}