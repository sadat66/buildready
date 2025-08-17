'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, DollarSign, MapPin, Plus, Eye, Edit, Clock, Star, TrendingUp, Building2, Sparkles, BarChart3, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Project } from '@/types/database'

interface RecentProjectsProps {
  projects: Project[]
}

function getStatusBadgeStyle(status: string) {
  const badgeStyles = {
    'Draft': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300',
    'Published': 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200',
    'Bidding': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
    'Awarded': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-pink-200',
    'In Progress': 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200',
    'Completed': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-emerald-200',
    'Cancelled': 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-rose-200'
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



function getDaysAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function RecentProjects({ projects }: RecentProjectsProps) {
  const recentProjects = projects.slice(0, 5)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border border-orange-200/60 shadow-2xl">
      {/* Consolidated background decoration - single layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-200/30 to-amber-200/20 rounded-full transform translate-x-40 -translate-y-40"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-200/20 to-orange-200/30 rounded-full transform -translate-x-32 translate-y-32"></div>
      </div>
      
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Enhanced Header Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Recent Projects
                  </h2>
                  <p className="text-orange-700/70 text-sm sm:text-lg mt-1">
                    Track your latest project activities and progress
                  </p>
                </div>
              </div>
            </div>
            
            <Link href="/homeowner/projects" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                View All Projects
              </Button>
            </Link>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-700">Total Projects</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-700">Accepted Proposals</p>
                                         <p className="text-xl sm:text-2xl font-bold text-green-900">{projects.filter(p => p.status === 'Awarded').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-md hover:shadow-lg transition-all duration-200 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-purple-700">Rejected Proposals</p>
                                         <p className="text-xl sm:text-2xl font-bold text-purple-900">{projects.filter(p => p.status === 'Cancelled').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      {recentProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Plus className="h-12 w-12 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-orange-800 mb-3">No projects yet</h3>
          <p className="text-orange-600/80 mb-8 max-w-md mx-auto text-lg leading-relaxed">
            Start your first project and connect with skilled contractors in your area. 
            It&apos;s time to bring your home improvement dreams to life!
          </p>
          <Link href="/homeowner/projects/create">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg">
              <Plus className="mr-3 h-5 w-5" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Enhanced Project Cards for Mobile */}
          <div className="block lg:hidden space-y-4">
            {recentProjects.map((project) => {
              const StatusIcon = getStatusIcon(project.status)
              
              return (
                <Card key={project.id} className="group bg-gradient-to-br from-white to-orange-50/30 border-orange-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                  <CardContent className="p-6">
                    {/* Header with project type */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-orange-500" />
                          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            {project.project_type || 'General'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-orange-900 mb-2 group-hover:text-orange-700 transition-colors line-clamp-1">
                          {project.project_title}
                        </h3>
                                                 <p className="text-orange-600/70 text-sm leading-relaxed mb-3 line-clamp-2">
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
                      <div className="flex items-center gap-2 text-orange-700 bg-orange-50/50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-orange-500" />
                                                 <span className="text-sm font-medium truncate">{project.location_address || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-700 bg-orange-50/50 p-2 rounded-lg">
                        <DollarSign className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium truncate">{project.budget ? formatCurrency(project.budget) : 'Not specified'}</span>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                      <div className="flex items-center gap-2 text-orange-600/80">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">{getDaysAgo(project.created_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/homeowner/projects/edit/${project.id}`}>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-orange-200 text-orange-600 hover:bg-orange-50 transition-all duration-200"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/homeowner/projects/view/${project.id}`}>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group"
                          >
                            <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
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
            <Card className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200/50 shadow-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200/50 hover:from-orange-150 hover:to-red-150 transition-all">
                    <TableHead className="text-orange-900 font-bold text-sm">Project Name</TableHead>
                    <TableHead className="text-orange-900 font-bold text-sm">Type</TableHead>
                    <TableHead className="text-orange-900 font-bold text-sm">Status</TableHead>
                    <TableHead className="text-orange-900 font-bold text-sm">Location</TableHead>
                    <TableHead className="text-orange-900 font-bold text-sm">Budget</TableHead>
                    <TableHead className="text-orange-900 font-bold text-sm">Created</TableHead>
                    <TableHead className="text-orange-900 font-bold text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProjects.map((project) => {
                    const StatusIcon = getStatusIcon(project.status)
                    
                    return (
                      <TableRow key={project.id} className="group hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-red-50/50 transition-all duration-200 border-orange-100/50">
                        <TableCell className="font-medium text-orange-900">
                          <div className="flex flex-col space-y-1">
                            <span className="font-bold text-base group-hover:text-orange-700 transition-colors">{project.project_title}</span>
                            <span className="text-sm text-orange-600/70 line-clamp-1 leading-relaxed">{project.statement_of_work}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 bg-orange-50/50 px-3 py-2 rounded-full w-fit">
                            <Building2 className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700">{project.project_type || 'General'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeStyle(project.status)} font-semibold px-3 py-2 text-xs border shadow-md hover:shadow-lg transition-all`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {project.status?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-orange-700">
                          <div className="flex items-center gap-2 bg-orange-50/30 px-3 py-2 rounded-lg w-fit">
                            <MapPin className="h-4 w-4 text-orange-500" />
                                                         <span className="text-sm font-medium">{project.location_address || 'Not specified'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-orange-700">
                          <div className="flex items-center gap-2 bg-green-50/50 px-3 py-2 rounded-lg w-fit">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">{project.budget ? formatCurrency(project.budget) : 'Not specified'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-orange-600/80">
                          <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-2 rounded-lg w-fit">
                            <CalendarDays className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">{getDaysAgo(project.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link href={`/homeowner/projects/view/${project.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                              >
                                <Eye className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/homeowner/projects/edit/${project.id}`}>
                              <Button 
                                 size="sm"
                                 className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group"
                               >
                                 <Edit className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
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
