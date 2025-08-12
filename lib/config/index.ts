/**
 * Modern Configuration Management (2024-2025)
 * Type-safe, validated configuration with environment-specific settings
 */

import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Features
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_MAPS: z.string().default('true').transform(val => val === 'true'),
  
  // Security
  NEXT_PUBLIC_ENABLE_DEBUG: z.string().default('false').transform(val => val === 'true'),
})

// Runtime environment validation
const env = envSchema.parse(process.env)

// Configuration object with computed values
export const config = {
  // Environment
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Database
  database: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
    },
    ssl: env.NODE_ENV === 'production',
  },
  
  // App
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    name: 'BuildReady',
    version: '1.0.0',
    description: 'Where Build-Ready Projects Meet Ready Builders',
  },
  
  // Features
  features: {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    maps: env.NEXT_PUBLIC_ENABLE_MAPS,
    debug: env.NEXT_PUBLIC_ENABLE_DEBUG,
  },
  
  // Security
  security: {
    enableDebug: env.NEXT_PUBLIC_ENABLE_DEBUG,
    cors: {
      origin: env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
  },
  
  // API
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    timeout: 30000, // 30 seconds
  },
} as const

// Type exports for use in other parts of the app
export type Config = typeof config
export type DatabaseConfig = Config['database']
export type AppConfig = Config['app']
export type FeaturesConfig = Config['features']

// Configuration validation helper
export function validateConfig(): void {
  try {
    envSchema.parse(process.env)
    console.log('✅ Configuration validated successfully')
  } catch (error) {
    console.error('❌ Configuration validation failed:', error)
    process.exit(1)
  }
}

// Environment-specific configuration getters
export const getConfig = () => config
export const getDatabaseConfig = () => config.database
export const getAppConfig = () => config.app
export const getFeaturesConfig = () => config.features

// Feature flags
export const isFeatureEnabled = (feature: keyof FeaturesConfig): boolean => {
  return config.features[feature]
}

// Development helpers
export const devOnly = <T>(value: T): T | undefined => {
  return config.isDev ? value : undefined
}

export const prodOnly = <T>(value: T): T | undefined => {
  return config.isProd ? value : undefined
}
