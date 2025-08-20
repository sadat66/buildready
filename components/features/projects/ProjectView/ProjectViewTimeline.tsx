'use client'

import { Project } from '@/types/database/projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MapPin,
  Users,
  FileText,
  TrendingUp,
  Flag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { USER_ROLES } from '@/lib/constants'

interface ProjectViewTimelineProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
}

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: Date
  status: 'completed' | 'in-progress' | 'upcoming' | 'delayed'
  type: 'milestone' | 'task' | 'decision' | 'payment'
  assignee?: string
  notes?: string
}

export function ProjectViewTimeline({ project, userRole }: ProjectViewTimelineProps) {
  // Mock timeline data - replace with actual data
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Project Created',
      description: 'Project was created and published to marketplace',
      date: new Date(project.created_at),
      status: 'completed',
      type: 'milestone'
    },
    {
      id: '2',
      title: 'Proposal Deadline',
      description: 'Deadline for contractors to submit proposals',
      date: new Date(project.expiry_date),
      status: 'upcoming',
      type: 'milestone'
    },
    {
      id: '3',
      title: 'Contractor Selection',
      description: 'Homeowner to review and select winning proposal',
      date: new Date(project.decision_date),
      status: 'upcoming',
      type: 'decision'
    },
    {
      id: '4',
      title: 'Project Kickoff',
      description: 'Selected contractor begins work on project',
      date: new Date(project.start_date),
      status: 'upcoming',
      type: 'milestone'
    },
    {
      id: '5',
      title: 'Project Completion',
      description: 'Project work completed and final inspection',
      date: new Date(project.end_date),
      status: 'upcoming',
      type: 'milestone'
    }
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'upcoming': return 'bg-gray-500'
      case 'delayed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'in-progress': return 'In Progress'
      case 'upcoming': return 'Upcoming'
      case 'delayed': return 'Delayed'
      default: return 'Unknown'
    }
  }

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return <Flag className="h-4 w-4" />
      case 'task': return <CheckCircle className="h-4 w-4" />
      case 'decision': return <Users className="h-4 w-4" />
      case 'payment': return <FileText className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return 'bg-purple-100 text-purple-800'
      case 'task': return 'bg-blue-100 text-blue-800'
      case 'decision': return 'bg-orange-100 text-orange-800'
      case 'payment': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProjectProgress = () => {
    const completedEvents = timelineEvents.filter(event => event.status === 'completed').length
    return (completedEvents / timelineEvents.length) * 100
  }

  const getDaysUntilNextEvent = () => {
    const upcomingEvents = timelineEvents.filter(event => event.status === 'upcoming')
    if (upcomingEvents.length === 0) return null
    
    const nextEvent = upcomingEvents[0]
    const today = new Date()
    const eventDate = new Date(nextEvent.date)
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return { days: diffDays, event: nextEvent }
  }

  const nextEvent = getDaysUntilNextEvent()

  return (
    <div className="space-y-6">
      {/* Project Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{getProjectProgress().toFixed(0)}%</span>
            </div>
            <Progress value={getProjectProgress()} className="h-3" />
          </div>

          {/* Key Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-semibold text-blue-600">
                {formatDate(new Date(project.start_date))}
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-semibold text-orange-600">
                {formatDate(new Date(project.end_date))}
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold text-green-600 capitalize">
                {project.status}
              </p>
            </div>
          </div>

          {/* Next Event Alert */}
          {nextEvent && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Next Event: {nextEvent.event.title}
                  </p>
                  <p className="text-xs text-orange-700">
                    {nextEvent.days === 0 ? 'Today' : `${nextEvent.days} day${nextEvent.days !== 1 ? 's' : ''} remaining`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline Events */}
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm",
                    getStatusColor(event.status)
                  )}>
                    {getTypeIcon(event.type)}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <Card className={cn(
                      "transition-all duration-200 hover:shadow-md",
                      event.status === 'completed' && "border-l-4 border-l-green-500 bg-green-50/50",
                      event.status === 'delayed' && "border-l-4 border-l-red-500 bg-red-50/50"
                    )}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Event Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getTypeColor(event.type))}
                                >
                                  {event.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge 
                                className={cn(
                                  getStatusColor(event.status),
                                  "text-white text-xs"
                                )}
                              >
                                {getStatusText(event.status)}
                              </Badge>
                              <div className="text-right text-xs text-muted-foreground">
                                <div>{formatDate(event.date)}</div>
                                <div>{formatTime(event.date)}</div>
                              </div>
                            </div>
                          </div>

                          {/* Event Details */}
                          {event.assignee && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>Assigned to: {event.assignee}</span>
                            </div>
                          )}

                          {event.notes && (
                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              <strong>Notes:</strong> {event.notes}
                            </div>
                          )}

                          {/* Event Actions */}
                          {event.status === 'upcoming' && userRole === 'homeowner' && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                                <Calendar className="h-3 w-3 mr-2" />
                                Reschedule
                              </Button>
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <FileText className="h-3 w-3 mr-2" />
                                Add Notes
                              </Button>
                            </div>
                          )}

                          {event.status === 'in-progress' && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Mark Complete
                              </Button>
                              <Button size="sm" variant="outline">
                                <Clock className="h-3 w-3 mr-2" />
                                Update Progress
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Legend */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Timeline Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>In Progress</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Delayed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
