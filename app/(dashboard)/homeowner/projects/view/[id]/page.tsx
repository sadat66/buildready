'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, CheckCircle, AlertCircle, Edit, Trash2, Camera, Paperclip, FileText } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Label } from '@/components/ui/label'

const LocationMap = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

interface Project {
  id: string
  project_title: string
  statement_of_work: string
  budget: number
  category: string[]
  pid: string
  location: {
    address: string
    city: string
    province: string
    postalCode: string
    latitude?: number | null
    longitude?: number | null
  }
  project_type: string
  status: string
  visibility_settings: string
  start_date: string
  end_date: string
  expiry_date: string
  decision_date: string
  substantial_completion: string | null
  permit_required: boolean
  is_verified_project: boolean
  certificate_of_title: string | null
  project_photos: Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>
  files: Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>
  creator: string
  proposal_count: number
  created_at: string
  updated_at: string
}

export default function ProjectViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

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
          .eq('creator', user.id)
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
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-500'
      case 'published': return 'bg-green-500'
      case 'bidding': return 'bg-blue-500'
      case 'awarded': return 'bg-purple-500'
      case 'in progress': return 'bg-yellow-500'
      case 'completed': return 'bg-green-600'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'Draft'
      case 'published': return 'Published'
      case 'bidding': return 'Bidding in Progress'
      case 'awarded': return 'Awarded to Contractor'
      case 'in progress': return 'In Progress'
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
    
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }
    
    setDeleting(true)
    
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .eq('creator', user.id)
      
      if (deleteError) {
        throw deleteError
      }
      
      toast.success('Project deleted successfully')
      router.push('/homeowner/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          {error || 'Project not found'}
        </div>
        <div className="text-center mt-4">
          <Link href="/homeowner/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.project_title}</h1>
          <p className="text-muted-foreground">
            Project ID: {project.pid} • Created {formatDate(project.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href={`/homeowner/projects/edit/${project.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleDeleteProject}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete Project'}
          </Button>
          <Link href="/homeowner/projects">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge 
              className={`${getStatusColor(project.status)} text-white px-3 py-1`}
            >
              {getStatusText(project.status)}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {project.visibility_settings}
            </Badge>
            {project.is_verified_project && (
              <Badge className="bg-green-500 text-white px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {project.proposal_count} proposal{project.proposal_count !== 1 ? 's' : ''} received
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Statement of Work</Label>
                <p className="mt-1 text-gray-900">{project.statement_of_work}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Project Type</Label>
                  <p className="mt-1 text-gray-900">{project.project_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Trade Categories</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {project.category.map((cat, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {formatBudget(project.budget)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="mt-1 text-gray-900">{project.location?.address}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">City</Label>
                  <p className="mt-1 text-gray-900">{project.location?.city}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Province</Label>
                  <p className="mt-1 text-gray-900">{project.location?.province}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                  <p className="mt-1 text-gray-900">{project.location?.postalCode}</p>
                </div>
              </div>

              {project.location?.latitude && project.location?.longitude && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Map</Label>
                  <div className="mt-2">
                    <LocationMap
                      onLocationSelect={() => {}} // Read-only
                      className="h-64"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="mt-1 text-gray-900">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="mt-1 text-gray-900">{formatDate(project.end_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Proposal Deadline</Label>
                  <p className="mt-1 text-gray-900">{formatDate(project.expiry_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Decision Date</Label>
                  <p className="mt-1 text-gray-900">{formatDate(project.decision_date)}</p>
                </div>
              </div>

              {project.substantial_completion && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Substantial Completion</Label>
                  <p className="mt-1 text-gray-900">{formatDate(project.substantial_completion)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files and Photos */}
          {(project.project_photos.length > 0 || project.files.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.project_photos.length > 0 && (
                  <div>
                    <Label className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>Photos ({project.project_photos.length})</span>
                    </Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {project.project_photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={typeof photo === 'string' ? photo : photo.url || ''}
                            alt={`Project photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.files.length > 0 && (
                  <div>
                    <Label className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                      <Paperclip className="h-4 w-4" />
                      <span>Documents ({project.files.length})</span>
                    </Label>
                    <div className="mt-2 space-y-2">
                      {project.files.map((file, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {typeof file === 'string' ? file : file.filename || ''}
                            </p>
                            {file.size && (
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge className={`${getStatusColor(project.status)} text-white mt-1`}>
                  {getStatusText(project.status)}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Visibility</Label>
                <p className="mt-1 text-gray-900">{project.visibility_settings}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Proposals</Label>
                <p className="mt-1 text-gray-900">{project.proposal_count} received</p>
              </div>

              {project.permit_required && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-700">Permits Required</span>
                </div>
              )}

              {project.certificate_of_title && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Certificate of Title</Label>
                  <a 
                    href={project.certificate_of_title} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 text-blue-600 hover:text-blue-800 text-sm block"
                  >
                    View Certificate
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/homeowner/projects/edit/${project.id}`} className="w-full">
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              </Link>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDeleteProject}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
