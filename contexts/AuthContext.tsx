'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { UserRole } from '@/types/database'

export interface ExtendedUser extends SupabaseUser {
  role?: UserRole
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: ExtendedUser | null
  userRole: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: ExtendedUser | null; userRole: UserRole | null; error: string | null }>
  signOut: () => Promise<void>
  fetchUserProfile: () => Promise<void>
  createUserProfile: (userId: string, role: UserRole, profileData: Record<string, unknown>) => Promise<{ error: string | null }>
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
        .select('user_role, first_name, last_name')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUserRole(data.user_role)
        setUser(prev => prev ? { ...prev, role: data.user_role, first_name: data.first_name, last_name: data.last_name } : null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth timeout reached, forcing loading to false')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session ? 'User found' : 'No user')
      if (session?.user) {
        // Set initial user without extended properties
        const initialUser: ExtendedUser = { ...session.user, role: undefined, first_name: undefined, last_name: undefined }
        setUser(initialUser)
        console.log('Fetching user profile for:', session.user.id)
        // Fetch user profile data including role
        const { data, error } = await supabase
          .from('users')
          .select('user_role, first_name, last_name')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
        } else if (data) {
          console.log('User profile loaded:', data)
          setUserRole(data.user_role)
          setUser(prev => prev ? { ...prev, role: data.user_role, first_name: data.first_name, last_name: data.last_name } : null)
        } else {
          console.log('No user profile data found')
        }
      }
      console.log('Setting loading to false')
      setLoading(false)
    })

    return () => clearTimeout(timeout)

         // Listen for auth changes
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         if (session?.user) {
           // Set initial user without extended properties
           const initialUser: ExtendedUser = { ...session.user, role: undefined, first_name: undefined, last_name: undefined }
           setUser(initialUser)
           // Fetch user profile data including role
           const { data, error } = await supabase
             .from('users')
             .select('user_role, first_name, last_name')
             .eq('id', session.user.id)
             .single()

           if (!error && data) {
             setUserRole(data.user_role)
             setUser(prev => prev ? { ...prev, role: data.user_role, first_name: data.first_name, last_name: data.last_name } : null)
           }
         } else {
           setUser(null)
           setUserRole(null)
         }
         setLoading(false)
       }
     )

     return () => {
       subscription.unsubscribe()
     }
   }, [supabase, loading])

  const signOut = async () => {
    setUser(null)
    setUserRole(null)
    await supabase.auth.signOut()
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, userRole: null, error: error.message }
      }

      if (data.user) {
        // Set initial user without extended properties
        const initialUser: ExtendedUser = { ...data.user, role: undefined, first_name: undefined, last_name: undefined }
        setUser(initialUser)
        
        // Fetch user profile data including role
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('role, first_name, last_name')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile during sign-in:', profileError)
        } else if (profileData) {
          setUserRole(profileData.role)
          const extendedUser = { ...data.user, role: profileData.role, first_name: profileData.first_name, last_name: profileData.last_name }
          setUser(extendedUser)
          return { user: extendedUser, userRole: profileData.role, error: null }
        }

        return { user: initialUser, userRole: null, error: null }
      }

      return { user: null, userRole: null, error: 'Sign-in failed' }
    } catch (error) {
      console.error('AuthContext: Sign-in error:', error)
      return { user: null, userRole: null, error: 'An unexpected error occurred' }
    }
  }

  const createUserProfile = async (userId: string, role: UserRole, profileData: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          role: role,
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating user profile:', error)
        return { error: error.message }
      }

      // Refresh user profile after creation
      await fetchUserProfile()
      return { error: null }
    } catch (error) {
      console.error('Unexpected error creating user profile:', error)
      return { error: 'An unexpected error occurred' }
    }
  }
  
  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      signIn,
      signOut,
      fetchUserProfile,
      createUserProfile
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