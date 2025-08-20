'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, DollarSign, MapPin, Plus, Eye, Building2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Project } from '@/types'

interface RecentOpportunitiesProps {
  projects: Project[]
}

function getStatusBadgeStyle(status: string) {
  const badgeStyles = {
      'Open for Proposals': 'bg-green-100 text-green-800 border-green-300',
      'Draft': 'bg-gray-100 text-gray-800 border-gray-300',
      'Open': 'bg-orange-100 text-orange-800 border-orange-300'
  }
  return badgeStyles[status as keyof typeof badgeStyles] || 'bg-gray-100 text-gray-800 border-gray-200'
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

export default function RecentOpportunities({ projects }: RecentOpportunitiesProps) {
  // Filter for recent projects (last 30 days) and take top 5
  const recentProjects = projects
    .filter(project => {
      const projectDate = new Date(project.created_at)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 30)
      return projectDate >= cutoffDate
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="py-4 sm:py-6 lg:py-8">
        {/* Main Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Recent Opportunities
                </h2>
                <p className="text-gray-600 text-sm sm:text-lg mt-1">
                  New projects posted in the last 30 days
                </p>
              </div>
            </div>
          </div>
          
          <Link href="/contractor/projects">
            <Button className="gap-2 bg-gray-600 hover:bg-gray-700 text-white">
              <Plus className="h-4 w-4" />
              Browse All Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {recentProjects.length === 0 ? (
        <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-12 w-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No recent opportunities</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
            No new projects have been posted in the last 30 days. Check back later for new opportunities!
          </p>
          <Link href="/contractor/projects">
            <Button className="gap-2 bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 px-4 py-2 text-sm">
              <Plus className="h-4 w-4" />
              Browse Projects
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Enhanced Project Cards for Mobile */}
          <div className="block lg:hidden space-y-4">
            {recentProjects.map((project) => (
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
                    </div>
                    <div className="ml-4">
                      <Badge className={`${getStatusBadgeStyle(project.status)} font-medium px-3 py-1 text-xs border shadow-sm`}>
                        {project.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Project description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.statement_of_work}
                  </p>
                  
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
                  
                  {/* Categories */}
                  {project.category && project.category.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(project.category) ? (
                          project.category.slice(0, 3).map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize">
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs capitalize">
                            {project.category}
                          </Badge>
                        )}
                        {Array.isArray(project.category) && project.category.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.category.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarDays className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">{getDaysAgo(project.created_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/contractor/projects/view/${project.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/contractor/projects/submit-proposal/${project.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-1" />
                          Submit Proposal
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Table for Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {project.project_title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                                {project.statement_of_work}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {project.budget ? formatCurrency(project.budget) : 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(project.category) ? (
                              project.category.slice(0, 2).map((cat, index) => (
                                <Badge key={index} variant="outline" className="text-xs capitalize">
                                  {cat}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs capitalize">
                                {project.category || 'Not specified'}
                              </Badge>
                            )}
                            {Array.isArray(project.category) && project.category.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.category.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.location?.address || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getDaysAgo(project.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/contractor/projects/view/${project.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/contractor/projects/submit-proposal/${project.id}`}>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="h-4 w-4 mr-1" />
                                Bid
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* View All button at bottom right */}
          <div className="flex justify-end pt-4">
            <Link href="/contractor/projects">
              <Button className="gap-2 bg-gray-600 hover:bg-gray-700 text-white">
                <Eye className="h-4 w-4" />
                Browse All Projects
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
