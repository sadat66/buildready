/**
 * Utility functions for handling authentication issues
 */

/**
 * Clear all Supabase-related data from browser storage
 * This helps resolve persistent refresh token issues
 */
export function clearSupabaseStorage() {
  try {
    // Clear localStorage items related to Supabase
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`Cleared localStorage key: ${key}`)
    })
    
    // Clear sessionStorage items related to Supabase
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('sb-')) {
        sessionKeysToRemove.push(key)
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key)
      console.log(`Cleared sessionStorage key: ${key}`)
    })
    
    console.log('Supabase storage cleared successfully')
  } catch (error) {
    console.error('Error clearing Supabase storage:', error)
  }
}

/**
 * Check if the error is related to refresh token issues
 */
export function isRefreshTokenError(error: unknown): boolean {
  if (!error) return false
  
  const errorMessage = (error as Error)?.message || String(error)
  const refreshTokenErrors = [
    'refresh token not found',
    'invalid refresh token',
    'refresh_token_not_found',
    'invalid_grant',
    'token_expired'
  ]
  
  return refreshTokenErrors.some(errorType => 
    errorMessage.toLowerCase().includes(errorType.toLowerCase())
  )
}