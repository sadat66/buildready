'use client'

import { Calendar, MapPin, DollarSign, Clock, Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Project } from '@/types/database'

interface ProjectCardProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
}

export default function ProjectCard({ projects, onProjectClick }: ProjectCardProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-muted-foreground">
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new project.
        </p>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      open: { label: 'Open', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      bidding: { label: 'Bidding', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      awarded: { label: 'Awarded', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.open
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatBudget = (budget: number | null) => {
    if (!budget) return 'Not specified'
    return `$${budget.toLocaleString()}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const statusConfig = getStatusConfig(project.status)
        
        return (
          <Card 
            key={project.id} 
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
            onClick={() => onProjectClick?.(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {project.description || 'No description available'}
                  </CardDescription>
                </div>
                <Badge variant={statusConfig.variant} className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Location */}
              {project.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{project.location}</span>
                </div>
              )}
              
              {/* Budget */}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{formatBudget(project.budget)}</span>
              </div>
              
              {/* Deadline */}
              {project.proposal_deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Due: {formatDate(project.proposal_deadline)}</span>
                </div>
              )}
              
              {/* Created Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Created: {formatDate(project.created_at)}</span>
              </div>
              
              {/* Owner */}
              {project.homeowner_id && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>Owner ID: {project.homeowner_id}</span>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onProjectClick?.(project)
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
