'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, DollarSign, MapPin, Plus, Eye, ArrowRight, Clock, Users, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Project } from '@/types/database'

interface RecentProjectsProps {
  projects: Project[]
}

function getStatusBadgeStyle(status: string) {
  const badgeStyles = {
    'open': 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200',
    'bidding': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
    'in_progress': 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200',
    'completed': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
    'cancelled': 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200',
    'awarded': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200'
  }
  return badgeStyles[status as keyof typeof badgeStyles] || 'bg-gray-100 text-gray-800 border-gray-200'
}

function getStatusIcon(status: string) {
  const icons = {
    'open': Clock,
    'bidding': TrendingUp,
    'in_progress': TrendingUp,
    'completed': Star,
    'cancelled': Clock, // Using Clock instead of emoji
    'awarded': Star     // Using Star instead of emoji
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Recent Projects
          </h2>
          <p className="text-orange-700/70 mt-1">
            Your latest {recentProjects.length} project activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            {projects.length} total
          </Badge>
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
            It's time to bring your home improvement dreams to life!
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
            {recentProjects.map((project, index) => {
              const StatusIcon = getStatusIcon(project.status)
              
              return (
                <div key={project.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-900 mb-2 hover:text-orange-700 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-orange-600/70 text-sm leading-relaxed mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Badge className={`${getStatusBadgeStyle(project.status)} font-medium px-3 py-1 text-xs border shadow-sm`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{project.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <DollarSign className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{project.budget ? formatCurrency(project.budget) : 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-600/80">
                      <CalendarDays className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{getDaysAgo(project.created_at)}</span>
                    </div>
                    <Link href={`/homeowner/projects/view/${project.id}`}>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Enhanced Table for Desktop */}
          <div className="rounded-xl overflow-hidden border border-orange-200/50 shadow-lg bg-white/80 backdrop-blur-sm">
            <Table>
              <TableHeader>
                                 <TableRow className="bg-gradient-to-r from-orange-100/80 to-amber-100/80 border-orange-200/50 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100">
                   <TableHead className="font-semibold text-orange-800 py-4 w-32">Project Details</TableHead>
                   <TableHead className="font-semibold text-orange-800 w-32">Status</TableHead>
                   <TableHead className="font-semibold text-orange-800 w-40">Location</TableHead>
                   <TableHead className="font-semibold text-orange-800 w-32">Budget</TableHead>
                   <TableHead className="font-semibold text-orange-800 w-36">Created</TableHead>
                   <TableHead className="font-semibold text-orange-800 text-right w-40">Actions</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project, index) => {
                  const StatusIcon = getStatusIcon(project.status)
                  
                  return (
                    <TableRow 
                      key={project.id} 
                      className={`border-orange-100/50 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white/60' : 'bg-orange-25/30'
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="font-semibold text-orange-900 hover:text-orange-700 transition-colors cursor-pointer">
                            {project.title}
                          </div>
                          <div className="text-sm text-orange-600/70 line-clamp-2 max-w-xs">
                            {project.description}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-orange-500">
                            <Users className="h-3 w-3" />
                            <span>Project ID: {project.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeStyle(project.status)} font-medium px-3 py-1 text-xs border shadow-sm flex items-center gap-1 w-fit`}>
                          <StatusIcon className="h-3 w-3" />
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-orange-700">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">{project.location || 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-orange-700">
                          <DollarSign className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{project.budget ? formatCurrency(project.budget) : 'Not specified'}</span>
                        </div>
                      </TableCell>
                                             <TableCell>
                         <div className="flex items-center gap-2">
                           <CalendarDays className="h-4 w-4 text-orange-500" />
                           <span className="text-sm font-medium">{formatDate(project.created_at)}</span>
                         </div>
                       </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/homeowner/projects/view/${project.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100/50 transition-all duration-200 group"
                            >
                              <Eye className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/homeowner/projects/edit/${project.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-orange-200 text-orange-600 hover:bg-orange-50 transition-all duration-200"
                            >
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
          </div>
          
                     {/* Enhanced View All Projects Button */}
           <div className="flex justify-end pt-4">
             <Link href="/homeowner/projects">
               <Button 
                 className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2 text-sm font-semibold rounded-lg"
               >
                 <Eye className="mr-2 h-4 w-4" />
                 View All
                 <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             </Link>
           </div>
        </div>
      )}
    </div>
  )
}
