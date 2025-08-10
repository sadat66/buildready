'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { UserRole } from '@/types/database'

interface ExtendedUser extends User {
  role?: UserRole
  full_name?: string
}

interface AuthContextType {
  user: ExtendedUser | null
  userRole: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: ExtendedUser | null; userRole: UserRole | null; error: string | null }>
  signOut: () => Promise<void>
  fetchUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUserRole(data.role)
        setUser(prev => prev ? { ...prev, role: data.role, full_name: data.full_name } : null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        // Fetch user profile data including role
        const { data, error } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setUserRole(data.role)
          setUser(prev => prev ? { ...prev, role: data.role, full_name: data.full_name } : null)
        }
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          // Fetch user profile data including role
          const { data, error } = await supabase
            .from('users')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single()

          if (!error && data) {
            setUserRole(data.role)
            setUser(prev => prev ? { ...prev, role: data.role, full_name: data.full_name } : null)
          }
        } else {
          setUser(null)
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    setUser(null)
    setUserRole(null)
    await supabase.auth.signOut()
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting sign-in process')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('AuthContext: Supabase response:', { data, error })

      if (error) {
        console.log('AuthContext: Sign-in error:', error.message)
        return { user: null, error: error.message }
      }

      if (data.user) {
        console.log('AuthContext: Setting user:', data.user)
        setUser(data.user)
        
        // Fetch user profile data including role
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single()

        if (!profileError && profileData) {
          setUserRole(profileData.role)
          setUser(prev => prev ? { ...prev, role: profileData.role, full_name: profileData.full_name } : null)
          return { user: data.user, userRole: profileData.role, error: null }
        }

        return { user: data.user, userRole: null, error: null }
      }

      console.log('AuthContext: No user in response')
      return { user: null, error: 'Sign-in failed' }
    } catch (error) {
      console.error('AuthContext: Sign-in error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }
  
  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      signIn,
      signOut,
      fetchUserProfile
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