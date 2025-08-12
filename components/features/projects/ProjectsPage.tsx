'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ProjectList from './ProjectList'
import { Project } from '@/types/database'

interface ProjectsPageProps {
  projects: Project[]
  userRole?: string
  className?: string
}

export default function ProjectsPage({ projects, userRole, className = '' }: ProjectsPageProps) {
  const router = useRouter()

  const handlePostProject = useCallback(() => {
    if (userRole === 'homeowner') {
      router.push('/homeowner/projects/create')
    } else {
      router.push('/projects/create')
    }
  }, [router, userRole])

  const handleProjectClick = useCallback((project: Project) => {
    if (userRole === 'homeowner') {
      router.push(`/homeowner/projects/view/${project.id}`)
    } else if (userRole === 'contractor') {
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
