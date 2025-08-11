'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Proposal } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, MapPin, Calendar, DollarSign, Search, CheckCircle, XCircle, Eye, User, FileText, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Label } from '@/components/ui/label'

export default function HomeownerProposalsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [projects, setProjects] = useState<any[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setProposalsLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        
        // Fetch projects first
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title')
          .eq('homeowner_id', user.id)
        
        if (projectsError) throw projectsError
        setProjects(projectsData || [])
        
        // Fetch proposals - first get project IDs for this homeowner
        const { data: projectIds, error: projectIdsError } = await supabase
          .from('projects')
          .select('id')
          .eq('homeowner_id', user.id)
        
        if (projectIdsError) throw projectIdsError
        
                if (projectIds && projectIds.length > 0) {
          const projectIdList = projectIds.map(p => p.id)
          console.log('Fetching proposals for projects:', projectIdList)
          
          // Fetch proposals for these projects
          const { data: proposalsData, error: proposalsError } = await supabase
            .from('proposals')
            .select(`
              *,
              projects (
                id,
                title,
                description,
                category,
                location,
                status,
                budget
              ),
              users!proposals_contractor_id_fkey (
                id,
                full_name,
                bio,
                location,
                rating,
                review_count
              )
            `)
            .in('project_id', projectIdList)
            .order('created_at', { ascending: false })
          
          if (proposalsError) {
            console.error('Proposals query error:', proposalsError)
            throw proposalsError
          }
          
          console.log('Proposals fetched successfully:', proposalsData?.length || 0)
          setProposals(proposalsData || [])
        } else {
          console.log('No projects found for homeowner, setting empty proposals')
          setProposals([])
        }
      } catch (error: any) {
        console.error('Error fetching data:', error)
        console.error('Error details:', {
          message: error?.message || 'Unknown error',
          code: error?.code || 'No code',
          details: error?.details || 'No details',
          hint: error?.hint || 'No hint'
        })
        setError('Failed to load proposals')
      } finally {
        setProposalsLoading(false)
      }
    }
    
    if (!loading && user && user.user_metadata?.role === 'homeowner') {
      fetchData()
    }
  }, [user, loading])

  const handleStatusUpdate = async (proposalId: string, status: 'accepted' | 'rejected', feedback?: string) => {
    if (!user) return
    
    setActionLoading(proposalId)
    
    try {
      const supabase = createClient()
      
      // Update proposal status
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }
      
      // Only include feedback if it's provided (field might not exist in DB yet)
      // Note: This field requires the migration to be applied first
      if (feedback !== undefined && feedback !== null) {
        updateData.feedback = feedback
      }
      
      // Try to update with feedback first, fallback to without feedback if field doesn't exist
      let { error: updateError } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', proposalId)
      
      // If feedback field doesn't exist, try without it
      if (updateError && updateError.message?.includes('feedback')) {
        console.log('Feedback field not found, updating without feedback field')
        const { feedback: _, ...updateDataWithoutFeedback } = updateData
        const { error: retryError } = await supabase
          .from('proposals')
          .update(updateDataWithoutFeedback)
          .eq('id', proposalId)
        
        if (retryError) throw retryError
      } else if (updateError) {
        throw updateError
      }
      
      // If accepted, update project status to awarded
      if (status === 'accepted') {
        const proposal = proposals.find(p => p.id === proposalId)
        if (proposal) {
          const { error: projectError } = await supabase
            .from('projects')
            .update({ status: 'awarded' })
            .eq('id', proposal.project_id)
          
          if (projectError) throw projectError
        }
      }
      
      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { ...p, status, ...(feedback !== undefined && feedback !== null && { feedback }) }
          : p
      ))
      
      toast.success(`Proposal ${status === 'accepted' ? 'Accepted!' : 'Rejected'}. ${
        status === 'accepted' 
          ? 'The contractor has been notified and the project is now awarded.'
          : 'The contractor has been notified of your decision.'
      }`)
      
    } catch (error) {
      console.error('Error updating proposal status:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', (error as any)?.message)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error("Failed to update proposal status. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.projects?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    const matchesProject = projectFilter === 'all' || proposal.project_id === projectFilter
    return matchesSearch && matchesStatus && matchesProject
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading || proposalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading proposals...</div>
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

  if (!user || user.user_metadata?.role !== 'homeowner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Access denied. Only homeowners can view project proposals.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Project Proposals
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage proposals from contractors for your projects
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredProposals.length} proposal(s) received
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search proposals by project, contractor, or description..."
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {proposal.projects?.title}
                    <Badge variant="outline" className="capitalize">
                      {proposal.projects?.category?.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Proposal from <span className="font-medium">{proposal.users?.full_name}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      proposal.status === 'accepted' ? 'default' : 
                      proposal.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {proposal.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Label className="text-xs font-medium text-gray-600">Net Amount</Label>
                  <p className="text-lg font-semibold text-green-600">
                    {proposal.net_amount ? formatCurrency(proposal.net_amount) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs font-medium text-gray-600">Tax</Label>
                  <p className="text-lg font-semibold text-orange-600">
                    {proposal.tax_amount ? formatCurrency(proposal.tax_amount) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs font-medium text-gray-600">Total</Label>
                  <p className="text-xl font-bold text-blue-600">
                    {proposal.total_amount ? formatCurrency(proposal.total_amount) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs font-medium text-gray-600">Deposit</Label>
                  <p className="text-lg font-semibold text-purple-600">
                    {proposal.deposit_amount ? formatCurrency(proposal.deposit_amount) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Timeline and Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    {proposal.proposed_start_date && proposal.proposed_end_date 
                      ? `${formatDate(proposal.proposed_start_date)} - ${formatDate(proposal.proposed_end_date)}`
                      : 'Dates not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {proposal.estimated_days ? `${proposal.estimated_days} days` : 'Duration not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>Due: {proposal.deposit_due_date ? formatDate(proposal.deposit_due_date) : 'Not specified'}</span>
                </div>
              </div>

              {/* Contractor Info */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{proposal.users?.full_name}</span>
                    {proposal.users?.rating && (
                      <span className="text-sm">⭐ {proposal.users.rating} ({proposal.users.review_count} reviews)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{proposal.users?.location || 'Location not specified'}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {proposal.users?.bio && `${proposal.users.bio.substring(0, 50)}...`}
                </div>
              </div>

              {/* Description */}
              <div className="pt-2 border-t">
                <Label className="text-sm font-medium text-gray-600">Proposal Description</Label>
                <p className="text-sm text-gray-700 mt-1">{proposal.description}</p>
              </div>

              {/* Additional Details */}
              {(proposal.materials_included || proposal.warranty_period || proposal.additional_notes) && (
                <div className="pt-2 border-t space-y-2">
                  {proposal.materials_included && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Materials included in price</span>
                    </div>
                  )}
                  {proposal.warranty_period && (
                    <div className="text-sm">
                      <span className="font-medium">Warranty:</span> {proposal.warranty_period}
                    </div>
                  )}
                  {proposal.additional_notes && (
                    <div className="text-sm">
                      <span className="font-medium">Additional Notes:</span> {proposal.additional_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Penalties */}
              {(proposal.delay_penalty || proposal.abandonment_penalty) && (
                <div className="pt-2 border-t">
                  <Label className="text-sm font-medium text-gray-600">Penalties & Guarantees</Label>
                  <div className="flex gap-4 mt-1">
                    {proposal.delay_penalty && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Delay: {formatCurrency(proposal.delay_penalty)}/day</span>
                      </div>
                    )}
                    {proposal.abandonment_penalty && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Abandonment: {formatCurrency(proposal.abandonment_penalty)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Files */}
              {proposal.uploaded_files && proposal.uploaded_files.length > 0 && (
                <div className="pt-2 border-t">
                  <Label className="text-sm font-medium text-gray-600">Supporting Documents</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {proposal.uploaded_files.map((file, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {proposal.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleStatusUpdate(proposal.id, 'accepted')}
                    disabled={actionLoading === proposal.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === proposal.id ? 'Processing...' : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Proposal
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(proposal.id, 'rejected')}
                    disabled={actionLoading === proposal.id}
                  >
                    {actionLoading === proposal.id ? 'Processing...' : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Proposal
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Feedback Display */}
              {proposal.feedback && (
                <div className="pt-2 border-t">
                  <Label className="text-sm font-medium text-gray-600">Your Feedback</Label>
                  <p className="text-sm text-gray-700 mt-1">{proposal.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredProposals.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No proposals have been submitted for your projects yet. Contractors will submit proposals once you post projects.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
