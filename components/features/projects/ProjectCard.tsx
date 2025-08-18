'use client'

import { Calendar, MapPin, DollarSign, Clock, Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Project } from '@/types'

interface ProjectCardProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
}

export default function ProjectCard({ projects, onProjectClick }: ProjectCardProps) {

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      open: { label: 'Open', variant: 'default' as const, color: 'bg-gray-100 text-gray-800' },
      bidding: { label: 'Bidding', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' },
      awarded: { label: 'Awarded', variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' },
      completed: { label: 'Completed', variant: 'outline' as const, color: 'bg-gray-900 text-white' },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-gray-100 text-gray-800' },
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.open
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
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
                    {project.project_title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {project.statement_of_work || 'No description available'}
                  </CardDescription>
                </div>
                <Badge variant={statusConfig.variant} className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Location */}
              {project.location?.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{project.location.address}</span>
                </div>
              )}
              
              {/* Budget */}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{formatBudget(project.budget)}</span>
              </div>
              
              {/* Deadline */}
              {project.expiry_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Due: {formatDate(project.expiry_date)}</span>
                </div>
              )}
              
              {/* Created Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Created: {formatDate(project.created_at)}</span>
              </div>
              
              {/* Owner */}
              {project.creator && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>Creator ID: {project.creator}</span>
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
