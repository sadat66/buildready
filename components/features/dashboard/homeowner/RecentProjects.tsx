'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, DollarSign, MapPin, Plus, Eye, Edit, Clock, Star, TrendingUp, Building2, Sparkles, XCircle } from "lucide-react"
import Link from "next/link"
import { Project } from '@/types'

interface RecentProjectsProps {
  projects: Project[]
}

function getStatusBadgeStyle(status: string) {
  const badgeStyles = {
    'Draft': 'bg-gray-100 text-gray-800 border-gray-300',
    'Published': 'bg-gray-100 text-gray-800 border-gray-300',
    'Bidding': 'bg-gray-100 text-gray-800 border-gray-300',
    'Awarded': 'bg-orange-100 text-orange-800 border-orange-300',
    'In Progress': 'bg-orange-100 text-orange-800 border-orange-300',
    'Completed': 'bg-gray-900 text-white border-gray-900',
    'Cancelled': 'bg-gray-100 text-gray-800 border-gray-300'
  }
  return badgeStyles[status as keyof typeof badgeStyles] || 'bg-gray-100 text-gray-800 border-gray-200'
}

function getStatusIcon(status: string) {
  const icons = {
    'Draft': Clock,
    'Published': Clock,
    'Bidding': TrendingUp,
    'Awarded': Star,
    'In Progress': TrendingUp,
    'Completed': Star,
    'Cancelled': XCircle
  }
  return icons[status as keyof typeof icons] || Clock
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getDaysAgo(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - dateObj.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Function to filter projects from the last 30 days
function getRecentProjects(projects: Project[], days: number = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return projects.filter(project => {
    const projectDate = new Date(project.created_at)
    return projectDate >= cutoffDate
  })
}

export default function RecentProjects({ projects }: RecentProjectsProps) {
  // Filter projects from the last 30 days
  const recentProjects = getRecentProjects(projects, 30)
  const displayProjects = recentProjects.slice(0, 5)

  return (
    <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm">
      
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Enhanced Header Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Recent Projects
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-lg mt-1">
                    Track your latest project activities and progress
                  </p>
                </div>
              </div>
            </div>
            
            <Link href="/homeowner/projects" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white transition-all duration-300 px-3 py-2 text-xs">
                <Eye className="mr-1 h-3 w-3" />
                View All
              </Button>
            </Link>
          </div>
          

        </div>
      </div>

      {/* Content */}
      {displayProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Plus className="h-12 w-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No recent projects</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
            {recentProjects.length === 0 
              ? "You haven't created any projects in the last 30 days. Start a new project to get started!"
              : "No projects to display from the last 30 days."
            }
          </p>
          <Link href="/homeowner/projects/create">
            <Button className="bg-gray-900 hover:bg-black text-white transition-all duration-300 px-4 py-2 text-sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Enhanced Project Cards for Mobile */}
          <div className="block lg:hidden space-y-4">
            {displayProjects.map((project) => {
              const StatusIcon = getStatusIcon(project.status)
              
              return (
                <Card key={project.id} className="group bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                  <CardContent className="p-6">
                    {/* Header with project type */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                            {project.project_type || 'General'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
                          {project.project_title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                          {project.statement_of_work}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Badge className={`${getStatusBadgeStyle(project.status)} font-medium px-3 py-1 text-xs border shadow-sm`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {project.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Project details grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium truncate">{project.location?.address || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium truncate">{project.budget ? formatCurrency(project.budget) : 'Not specified'}</span>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDays className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">{getDaysAgo(project.created_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/homeowner/projects/edit/${project.id}`}>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/homeowner/projects/view/${project.id}`}>
                          <Button 
                            size="sm"
                            className="bg-gray-900 hover:bg-black text-white transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Enhanced Table for Desktop */}
          <div className="hidden lg:block">
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all">
                    <TableHead className="text-gray-900 font-bold text-sm">Project Name</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Type</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Status</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Location</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Budget</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Created</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayProjects.map((project) => {
                    const StatusIcon = getStatusIcon(project.status)
                    
                    return (
                      <TableRow key={project.id} className="group hover:bg-gray-50 transition-all duration-200 border-gray-100">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex flex-col space-y-1">
                            <span className="font-bold text-base group-hover:text-orange-600 transition-colors">{project.project_title}</span>
                            <span className="text-sm text-gray-600 line-clamp-1 leading-relaxed">{project.statement_of_work}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full w-fit">
                            <Building2 className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{project.project_type || 'General'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeStyle(project.status)} font-semibold px-3 py-2 text-xs border shadow-md hover:shadow-lg transition-all`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {project.status?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-fit">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">{project.location?.address || 'Not specified'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-fit">
                            <DollarSign className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-bold text-gray-900">{project.budget ? formatCurrency(project.budget) : 'Not specified'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-fit">
                            <CalendarDays className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{getDaysAgo(project.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link href={`/homeowner/projects/view/${project.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/homeowner/projects/edit/${project.id}`}>
                              <Button 
                                variant="default"
                                size="sm"
                                className="bg-gray-900 hover:bg-black text-white transition-all duration-200"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
          
        </div>
      )}
    </div>
  )
}
