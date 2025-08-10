'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    setUser(null)
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
        return { user: data.user, error: null }
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
      loading,
      signIn,
      signOut
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