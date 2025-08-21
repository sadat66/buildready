'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { USER_ROLES } from '@/lib/constants'
import ProjectList from './ProjectList'
import { Project } from '@/types'
import { PaymentModal } from '@/components/shared/modals'
import toast from 'react-hot-toast'

interface ProjectsPageProps {
  projects: Project[]
  userRole?: string
  className?: string
}

export default function ProjectsPage({ projects, userRole, className = '' }: ProjectsPageProps) {
  const router = useRouter()
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Handle payment success
  const handlePaymentSuccess = () => {
    setHasPaid(true)
    setShowPaymentModal(false)
    toast.success('Demo payment successful! Redirecting to create project...')
    if (userRole === USER_ROLES.HOMEOWNER) {
      router.push('/homeowner/projects/create')
    } else {
      router.push('/projects/create')
    }
  }

  const handlePostProject = useCallback(() => {
    if (userRole === USER_ROLES.HOMEOWNER) {
      if (!hasPaid) {
        setShowPaymentModal(true)
      } else {
        router.push('/homeowner/projects/create')
      }
    } else {
      router.push('/projects/create')
    }
  }, [router, userRole, hasPaid])

  const handleProjectClick = useCallback((project: Project) => {
    if (userRole === USER_ROLES.HOMEOWNER) {
      router.push(`/homeowner/projects/view/${project.id}`)
    } else if (userRole === USER_ROLES.CONTRACTOR) {
      router.push(`/contractor/projects/view/${project.id}`)
    } else {
      router.push(`/projects/view/${project.id}`)
    }
  }, [router, userRole])

  return (
    <div className={`space-y-6 ${className}`}>
      <ProjectList
        projects={projects}
        onPostProject={handlePostProject}
        onProjectClick={handleProjectClick}
      />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        userType="homeowner"
      />
    </div>
  )
}
