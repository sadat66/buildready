'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { User as AppUser } from '@/types/database'
import { clearSupabaseStorage, isRefreshTokenError } from '@/lib/auth-utils'

interface AuthContextType {
  user: User | null
  profile: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, this is normal for new signups
          console.log('User profile not found, may need to be created')
          setProfile(null)
          return
        }
        console.error('Error fetching profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        setProfile(null)
        return
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    // Set mounted immediately to show content
    setMounted(true)
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout, setting loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          // If it's a refresh token error, clear the session and storage
          if (isRefreshTokenError(error)) {
            console.log('Refresh token error detected, clearing session and storage')
            clearSupabaseStorage()
            await supabase.auth.signOut()
          }
          setLoading(false)
          return
        }
        
        console.log('Session retrieved:', session ? 'User logged in' : 'No session')
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error getting session:', error)
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, session ? 'User present' : 'No user')
          
          // Handle token refresh errors
          if (event === 'TOKEN_REFRESHED' && !session) {
            console.log('Token refresh failed, signing out')
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
          }
          
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          setLoading(false)
        } catch (error) {
          console.error('Error handling auth state change:', error)
          // If there's an error with token refresh, clear the session and storage
          if (isRefreshTokenError(error)) {
            console.log('Refresh token error in auth state change, clearing session and storage')
            clearSupabaseStorage()
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('AuthContext useEffect cleanup')
      subscription.unsubscribe()
    }
  }, [mounted, fetchProfile])

  const signOut = async () => {
    try {
      console.log('Signing out user')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
      // Clear local state regardless of API response
      setUser(null)
      setProfile(null)
      setLoading(false)
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      // Clear local state even if sign out fails
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Always provide the context, even when not mounted
  console.log('AuthContext render:', { user: !!user, profile: !!profile, loading, mounted })
  
  // Ensure loading is false if we have a user but no profile after a reasonable time
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('User exists but no profile, attempting to fetch profile')
      fetchProfile(user.id)
    }
  }, [user, profile, loading, fetchProfile])
  
  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}