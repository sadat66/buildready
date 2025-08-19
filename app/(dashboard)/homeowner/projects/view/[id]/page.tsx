'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, CheckCircle, AlertCircle, Edit, Trash2, Camera, Paperclip, FileText, User, DollarSign, Clock, ThumbsUp, ThumbsDown } from 'lucide-react'
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

interface Proposal {
  id: string
  title: string
  description_of_work: string
  project: string
  contractor: string
  homeowner: string
  subtotal_amount: number
  tax_included: 'yes' | 'no'
  total_amount: number
  deposit_amount: number
  deposit_due_on: string
  proposed_start_date: string
  proposed_end_date: string
  expiry_date: string
  status: 'draft' | 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  is_selected: 'yes' | 'no'
  submitted_date?: string
  accepted_date?: string
  rejected_date?: string
  rejection_reason?: 'price_too_high' | 'timeline_unrealistic' | 'experience_insufficient' | 'scope_mismatch' | 'other'
  rejection_reason_notes?: string
  clause_preview_html?: string
  attached_files: Array<{ id: string; filename: string; url: string; size?: number; mimeType?: string; uploadedAt?: Date }>
  notes?: string
  created_at: string
  updated_at: string
  contractor_profile?: {
    id: string
    full_name: string
    email: string
    phone_number?: string
    address?: string
  }
}

export default function ProjectViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [updatingProposal, setUpdatingProposal] = useState<string | null>(null)

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
    
    const fetchProposals = async () => {
      console.log('fetchProposals called - id:', id, 'user:', user)
      if (!id || !user) {
        console.log('Early return - missing id or user')
        setProposalsLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('proposals')
          .select(`
            *,
            contractor_profile:users!proposals_contractor_fkey (
              id,
              full_name,
              email,
              phone_number,
              address
            )
          `)
          .eq('project', id)
          .eq('homeowner', user.id)
          .eq('is_deleted', 'no')
          .in('status', ['submitted', 'viewed', 'accepted', 'rejected'])
          .order('created_at', { ascending: false })
        
        if (fetchError) {
          throw fetchError
        }
        
        setProposals(data || [])
      } catch (error) {
        console.error('Error fetching proposals:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        if (error && typeof error === 'object' && 'message' in error) {
          const errorObj = error as { message?: string; code?: string; hint?: string }
          console.error('Error message:', errorObj.message)
          console.error('Error code:', errorObj.code)
          console.error('Error hint:', errorObj.hint)
        }
      } finally {
        setProposalsLoading(false)
      }
    }
    
    fetchProject()
    fetchProposals()
  }, [id, user])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-500'
      case 'published': return 'bg-gray-500'
      case 'bidding': return 'bg-orange-500'
      case 'awarded': return 'bg-orange-500'
      case 'in progress': return 'bg-orange-500'
      case 'completed': return 'bg-gray-900'
      case 'cancelled': return 'bg-gray-500'
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

  const handleAcceptProposal = async (proposalId: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to accept this proposal? This will reject all other proposals for this project.')) {
      return
    }
    
    setUpdatingProposal(proposalId)
    
    try {
      const supabase = createClient()
      
      // First, mark the selected proposal as viewed (if not already)
      await supabase
        .from('proposals')
        .update({
          status: 'viewed',
          viewed_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('status', 'submitted')
      
      // Accept the selected proposal
      const { error: acceptError } = await supabase
        .from('proposals')
        .update({
          status: 'accepted',
          is_selected: 'yes',
          accepted_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('homeowner', user.id)
      
      if (acceptError) {
        throw acceptError
      }
      
      // Reject all other proposals for this project
      const { error: rejectError } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejected_date: new Date().toISOString(),
          rejection_reason: 'other',
          rejection_reason_notes: 'Another proposal was selected',
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('project', id)
        .neq('id', proposalId)
        .in('status', ['submitted', 'viewed'])
      
      if (rejectError) {
        throw rejectError
      }
      
      // Update project status to awarded
      await supabase
        .from('projects')
        .update({
          status: 'awarded',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      toast.success('Proposal accepted successfully')
      
      // Refresh proposals
      const { data: updatedProposals } = await supabase
        .from('proposals')
        .select(`
          *,
          contractor_profile:users!proposals_contractor_fkey (
            id,
            full_name,
            email,
            phone_number,
            address
          )
        `)
        .eq('project', id)
        .eq('homeowner', user.id)
        .eq('is_deleted', 'no')
        .in('status', ['submitted', 'viewed', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
      
      setProposals(updatedProposals || [])
      
    } catch (error) {
      console.error('Error accepting proposal:', error)
      toast.error('Failed to accept proposal')
    } finally {
      setUpdatingProposal(null)
    }
  }

  const handleRejectProposal = async (proposalId: string, reason?: string, notes?: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to reject this proposal?')) {
      return
    }
    
    setUpdatingProposal(proposalId)
    
    try {
      const supabase = createClient()
      
      // First, mark the proposal as viewed (if not already)
      await supabase
        .from('proposals')
        .update({
          status: 'viewed',
          viewed_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('status', 'submitted')
      
      // Reject the proposal
      const { error: rejectError } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejected_date: new Date().toISOString(),
          rejection_reason: reason || 'other',
          rejection_reason_notes: notes,
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('homeowner', user.id)
      
      if (rejectError) {
        throw rejectError
      }
      
      toast.success('Proposal rejected successfully')
      
      // Refresh proposals
      const { data: updatedProposals } = await supabase
        .from('proposals')
        .select(`
          *,
          contractor_profile:users!proposals_contractor_fkey (
            id,
            full_name,
            email,
            phone_number,
            address
          )
        `)
        .eq('project', id)
        .eq('homeowner', user.id)
        .eq('is_deleted', 'no')
        .in('status', ['submitted', 'viewed', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
      
      setProposals(updatedProposals || [])
      
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      toast.error('Failed to reject proposal')
    } finally {
      setUpdatingProposal(null)
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
              <Badge className="bg-gray-900 text-white px-3 py-1">
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

          {/* Proposals Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Proposals ({proposals.length})</span>
                {proposalsLoading && (
                  <div className="text-sm text-muted-foreground">Loading proposals...</div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposalsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading proposals...
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No proposals submitted yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{proposal.title}</CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{proposal.contractor_profile?.full_name || 'Unknown Contractor'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={`${
                                proposal.status === 'accepted' ? 'bg-green-500' :
                                proposal.status === 'rejected' ? 'bg-red-500' :
                                proposal.status === 'viewed' ? 'bg-blue-500' :
                                'bg-gray-500'
                              } text-white`}
                            >
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Description of Work</Label>
                          <p className="mt-1 text-gray-900">{proposal.description_of_work}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                              <p className="text-lg font-bold text-green-600">
                                ${proposal.total_amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
                              <p className="text-sm text-gray-900">
                                {new Date(proposal.proposed_start_date).toLocaleDateString()} - {new Date(proposal.proposed_end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-orange-600" />
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Deposit</Label>
                              <p className="text-sm text-gray-900">
                                ${proposal.deposit_amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {proposal.notes && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                            <p className="mt-1 text-gray-900">{proposal.notes}</p>
                          </div>
                        )}
                        
                        {proposal.attached_files.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Attached Files</Label>
                            <div className="mt-2 space-y-1">
                              {proposal.attached_files.map((file, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span>{file.filename}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {proposal.status === 'submitted' || proposal.status === 'viewed' ? (
                          <div className="flex space-x-3 pt-4 border-t">
                            <Button
                              onClick={() => handleAcceptProposal(proposal.id)}
                              disabled={updatingProposal === proposal.id}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {updatingProposal === proposal.id ? 'Accepting...' : 'Accept Proposal'}
                            </Button>
                            <Button
                              onClick={() => handleRejectProposal(proposal.id, 'other', 'Proposal declined by homeowner')}
                              disabled={updatingProposal === proposal.id}
                              variant="destructive"
                              className="flex-1"
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              {updatingProposal === proposal.id ? 'Rejecting...' : 'Reject Proposal'}
                            </Button>
                          </div>
                        ) : proposal.status === 'accepted' ? (
                          <div className="pt-4 border-t">
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">This proposal has been accepted</span>
                            </div>
                            {proposal.accepted_date && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Accepted on {new Date(proposal.accepted_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : proposal.status === 'rejected' ? (
                          <div className="pt-4 border-t">
                            <div className="flex items-center space-x-2 text-red-600">
                              <AlertCircle className="h-5 w-5" />
                              <span className="font-medium">This proposal has been rejected</span>
                            </div>
                            {proposal.rejected_date && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Rejected on {new Date(proposal.rejected_date).toLocaleDateString()}
                              </p>
                            )}
                            {proposal.rejection_reason_notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Reason: {proposal.rejection_reason_notes}
                              </p>
                            )}
                          </div>
                        ) : null}
                        
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Submitted on {new Date(proposal.created_at).toLocaleDateString()} at {new Date(proposal.created_at).toLocaleTimeString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
