'use client'

import { use } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { HomeownerDashboard, ContractorDashboard, RoleSelector } from '@/components/features/dashboard'

interface DashboardPageProps {
  params: Promise<{
    role: string
  }>
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { user } = useAuth()
  const resolvedParams = use(params)
  const { role } = resolvedParams

  // Show role selector if no specific role is requested or if role is 'dashboard'
  if (!role || role === 'dashboard' || role === 'select') {
    return <RoleSelector />
  }

  // Render role-specific dashboard component based on URL role
  switch (role) {
    case 'contractor':
      return <ContractorDashboard userEmail={user?.email} />
    
    case 'homeowner':
      return <HomeownerDashboard userEmail={user?.email} />
    
    case 'admin':
      // For now, show role selector for admin until admin dashboard is created
      return <RoleSelector />
    
    default:
      // Default to role selector for unknown roles
      return <RoleSelector />
  }
}