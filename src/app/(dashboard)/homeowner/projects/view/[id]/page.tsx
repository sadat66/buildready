'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, DollarSign, FileText, Camera, Paperclip, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types/database'
import dynamic from 'next/dynamic'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const LocationMap = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

export default function ProjectViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) {
        setLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('homeowner_id', user.id)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [id, user])

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open for Bidding'
      case 'bidding': return 'Bidding in Progress'
      case 'awarded': return 'Awarded to Contractor'
      case 'completed': return 'Project Completed'
      case 'cancelled': return 'Project Cancelled'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatBudget = (budget: number) => {
    return `$${budget.toLocaleString()}`
  }

  const handleDeleteProject = async () => {
    if (!project || !user) return
    
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .eq('homeowner_id', user.id)
      
      if (deleteError) {
        throw deleteError
      }
      
      router.push('/homeowner/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Failed to delete project. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/homeowner/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading project details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/homeowner/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {error || 'Project not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/homeowner/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
          <Badge variant="outline" className="capitalize">
            {getStatusText(project.status)}
          </Badge>
        </div>
      </div>

      {/* Project Title and Status */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{project.title}</CardTitle>
              <CardDescription className="text-lg">
                {project.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{project.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Budget</p>
                <p className="text-sm text-gray-600">{formatBudget(project.budget)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Category</p>
                <p className="text-sm text-gray-600 capitalize">{project.category.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Proposal Deadline</span>
                <span className="text-sm font-medium">{formatDate(project.proposal_deadline)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Decision Date</span>
                <span className="text-sm font-medium">{formatDate(project.decision_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preferred Start</span>
                <span className="text-sm font-medium">{formatDate(project.preferred_start_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preferred End</span>
                <span className="text-sm font-medium">{formatDate(project.preferred_end_date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                {project.permit_required ? (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="text-sm">
                  {project.permit_required ? 'Permits required' : 'No permits required'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Posted on {formatDate(project.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Location Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Project Location</span>
            </CardTitle>
            <CardDescription>
              {project.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.latitude && project.longitude ? (
              <div className="h-48 border rounded-lg overflow-hidden">
                <LocationMap 
                  onLocationSelect={() => {}} // Read-only in view mode
                  initialCoordinates={{ lat: project.latitude, lng: project.longitude }}
                  className="h-full"
                  readOnly={true}
                />
              </div>
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-sm">Location coordinates not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Site Photos - Compact View */}
      {project.site_photos && project.site_photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Site Photos ({project.site_photos.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {project.site_photos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={photo}
                    alt={`Site photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Files */}
      {project.project_files && project.project_files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Paperclip className="h-5 w-5" />
              <span>Project Files</span>
            </CardTitle>
            <CardDescription>
              {project.project_files.length} file{project.project_files.length !== 1 ? 's' : ''} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.project_files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{file}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        <Link href="/homeowner/projects">
          <Button variant="outline">
            Back to Projects
          </Button>
        </Link>
        <Link href={`/homeowner/projects/edit/${project.id}`}>
          <Button>
            Edit Project
          </Button>
        </Link>
                 <Button 
           variant="destructive" 
           onClick={() => setShowDeleteDialog(true)}
         >
           Delete Project
                  </Button>
       </div>

       {/* Delete Confirmation Dialog */}
       <ConfirmDialog
         isOpen={showDeleteDialog}
         onClose={() => setShowDeleteDialog(false)}
         onConfirm={handleDeleteProject}
         title="Delete Project"
         message="Are you sure you want to delete this project? This action cannot be undone."
         confirmText="Delete Project"
         cancelText="Cancel"
       />
     </div>
   )
 }
