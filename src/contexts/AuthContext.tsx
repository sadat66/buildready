'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { UserRole } from '@/types/database'

interface ExtendedUser extends SupabaseUser {
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
        const initialUser: ExtendedUser = { ...session.user, role: undefined, full_name: undefined }
        setUser(initialUser)
        console.log('Fetching user profile for:', session.user.id)
        // Fetch user profile data including role
        const { data, error } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
        } else if (data) {
          console.log('User profile loaded:', data)
          setUserRole(data.role)
          setUser(prev => prev ? { ...prev, role: data.role, full_name: data.full_name } : null)
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
           const initialUser: ExtendedUser = { ...session.user, role: undefined, full_name: undefined }
           setUser(initialUser)
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

     return () => {
       subscription.unsubscribe()
     }
  }, [])

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
        const initialUser: ExtendedUser = { ...data.user, role: undefined, full_name: undefined }
        setUser(initialUser)
        
        // Fetch user profile data including role
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile during sign-in:', profileError)
        } else if (profileData) {
          setUserRole(profileData.role)
          const extendedUser = { ...data.user, role: profileData.role, full_name: profileData.full_name }
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