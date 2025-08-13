'use client'

import { Briefcase, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Project } from '@/types/database'

interface RecentProjectsProps {
  projects: Project[]
}

export default function RecentProjects({ projects }: RecentProjectsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'bidding': return 'bg-blue-500'
      case 'awarded': return 'bg-purple-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Projects</h2>
        <Link href="/homeowner/projects">
          <Button variant="outline" size="sm">
            View All Projects
          </Button>
        </Link>
      </div>
      
      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                  <span className="text-sm font-medium capitalize">{project.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{project.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Budget: ${project.budget?.toLocaleString() || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Posted {new Date(project.created_at).toLocaleDateString()}
                </span>
                <Link href={`/homeowner/projects/view/${project.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2 text-muted-foreground">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first project to attract qualified contractors.
          </p>
          <Link href="/homeowner/projects/create">
            <Button>
              Post Your First Project
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
