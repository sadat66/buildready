'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { USER_ROLES } from '@/lib/constants'
import ProjectList from './ProjectList'
import { Project } from '@/types'

interface ProjectsPageProps {
  projects: Project[]
  userRole?: string
  className?: string
}

export default function ProjectsPage({ projects, userRole, className = '' }: ProjectsPageProps) {
  const router = useRouter()

  const handlePostProject = useCallback(() => {
    if (userRole === USER_ROLES.HOMEOWNER) {
      router.push('/homeowner/projects/create')
    } else {
      router.push('/projects/create')
    }
  }, [router, userRole])

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
    </div>
  )
}
