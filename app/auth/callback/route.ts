import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const accessToken = requestUrl.searchParams.get('access_token')
  const refreshToken = requestUrl.searchParams.get('refresh_token')
  
  // Handle Supabase email confirmation with tokens
  if (accessToken && refreshToken) {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Set the session using the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    
    if (!error && data.user) {
      // Get user's role from metadata
      const userRole = data.user.user_metadata?.role || 'homeowner'
      
      // Redirect to role-specific dashboard
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/${userRole}/dashboard`)
    }
  }
  
  // Handle traditional code-based confirmation
  if (code) {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Get user's role from metadata
      const userRole = data.user.user_metadata?.role || 'homeowner'
      
      // Redirect to role-specific dashboard
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/${userRole}/dashboard`)
    }
  }

  // If there's an error or no valid tokens/code, redirect to login page
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=confirmation_failed`)
}
