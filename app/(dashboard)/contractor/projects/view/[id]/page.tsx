'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { USER_ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Calendar, DollarSign, Building, User, FileText, Clock } from 'lucide-react'
import { Project } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const { user, userRole, loading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !user) {
        setProjectLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`
            *,
            homeowner:users!creator(
              full_name,
              first_name,
              last_name,
              email
            )
          `)
          .eq('id', projectId)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project details')
      } finally {
        setProjectLoading(false)
      }
    }
    
    if (!loading && user && userRole === USER_ROLES.CONTRACTOR) {
      fetchProject()
    }
  }, [projectId, user, userRole, loading])

  if (loading || projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading project details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Access denied. Only contractors can view project details.</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Project not found.</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8" />
              {project.project_title}
            </h1>
            <p className="text-gray-600 mt-2">
              Project Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/contractor/projects/submit-proposal/${project.id}`)}
          >
            Submit Proposal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Project Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {project.statement_of_work}
              </p>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-medium">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-medium">{formatDate(project.expiry_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Timeline</p>
                    <p className="font-medium">
                      {project.start_date && project.end_date 
                        ? `${formatDate(project.start_date)} - ${formatDate(project.end_date)}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Project Type</p>
                    <p className="font-medium capitalize">
                      {project.project_type || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {project.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {[project.location.address, project.location.city, project.location.province]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {project.location.postalCode && (
                  <p className="text-gray-500 text-sm mt-1">
                    Postal Code: {project.location.postalCode}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Permit Required</p>
                  <p className="font-medium">
                    {project.permit_required ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified Project</p>
                  <p className="font-medium">
                    {project.is_verified_project ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Category */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <Badge variant="default" className="capitalize">
                  {project.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(project.category) ? (
                    project.category.map((cat, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {cat}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">Not specified</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Homeowner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Homeowner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Posted by</p>
                <p className="font-medium">
                  {project.homeowner ? 
                    (() => {
                      const homeowner = project.homeowner as { first_name?: string; last_name?: string; full_name?: string }
                      if (homeowner.first_name && homeowner.last_name) {
                        return `${homeowner.first_name} ${homeowner.last_name}`.trim()
                      } else if (homeowner.full_name) {
                        return homeowner.full_name
                      } else {
                        return 'Unknown'
                      }
                    })()
                    : 'Unknown'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{formatDate(project.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{formatDate(project.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
