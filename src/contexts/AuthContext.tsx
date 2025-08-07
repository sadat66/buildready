'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { User as AppUser } from '@/types/database'

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
    
    return () => {
      console.log('AuthContext component unmounting, resetting states')
      setLoading(false)
      setUser(null)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    console.log('AuthContext useEffect triggered, mounted:', mounted)

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Auth loading timeout reached, setting loading to false')
      setLoading(false)
    }, 10000) // 10 second timeout

    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
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
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          setLoading(false)
        } catch (error) {
          console.error('Error handling auth state change:', error)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('AuthContext useEffect cleanup')
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [mounted, fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
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