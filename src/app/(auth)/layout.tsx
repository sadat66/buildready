import { AuthHeader } from '@/components/features/auth/auth-header'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <AuthHeader />
        <main className="px-4 sm:px-6 lg:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
