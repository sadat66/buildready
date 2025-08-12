'use client'

interface LoadingSpinnerProps {
  text?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'warning' | 'error'
  className?: string
}

export default function LoadingSpinner({ 
  text = "Loading...", 
  subtitle,
  size = 'md',
  variant = 'default',
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10', 
    lg: 'h-14 w-14'
  }

  const variantClasses = {
    default: {
      spinner: 'border-orange-600',
      text: 'text-gray-800',
      subtitle: 'text-gray-600'
    },
    warning: {
      spinner: 'border-yellow-500',
      text: 'text-yellow-800',
      subtitle: 'text-gray-700'
    },
    error: {
      spinner: 'border-red-500',
      text: 'text-red-700',
      subtitle: 'text-gray-700'
    }
  }

  const currentVariant = variantClasses[variant]

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 ${currentVariant.spinner} ${sizeClasses[size]} mb-4`}></div>
      <div className="text-center">
        <div className={`text-base font-semibold mb-1 ${currentVariant.text}`}>{text}</div>
        {subtitle && (
          <div className={`text-sm ${currentVariant.subtitle}`}>{subtitle}</div>
        )}
      </div>
    </div>
  )
}
