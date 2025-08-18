'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Proposal } from '@/types'

interface Project {
  id: string
  title: string
  status?: string
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, DollarSign, Search, CheckCircle, XCircle, User, FileText, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Label } from '@/components/ui/label'

export default function HomeownerProposalsPage() {
  const { user, userRole } = useAuth()
  
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [projects, setProjects] = useState<Project[]>([])
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
          .eq('creator', user.id)
        
        if (projectsError) throw projectsError
        setProjects(projectsData || [])
        
        // Fetch proposals - first get project IDs for this homeowner
        const { data: projectIds, error: projectIdsError } = await supabase
          .from('projects')
          .select('id')
          .eq('creator', user.id)
        
        if (projectIdsError) throw projectIdsError
        
        if (projectIds && projectIds.length > 0) {
          const projectIdList = projectIds.map(p => p.id)
          console.log('Fetching proposals for projects:', projectIdList)
          
          // Fetch proposals for these projects
          const { data: proposalsData, error: proposalsError } = await supabase
            .from('proposals')
            .select(`
              *,
              project:projects!project_id (
                id,
                title,
                statement_of_work,
                category,
                location,
                status,
                budget
              ),
              contractor:users!contractor_id (
                id,
                full_name
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
      } catch (error: unknown) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
      } finally {
        setProposalsLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleStatusUpdate = async (proposalId: string, status: 'draft' | 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'expired', feedback?: string) => {
    if (!user) return
    
    setActionLoading(proposalId)
    
    try {
      const supabase = createClient()
      
      // Update proposal status
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ 
          status,
          ...(feedback && { rejection_reason_notes: feedback }),
          ...(status === 'rejected' && { rejected_date: new Date().toISOString() }),
          ...(status === 'accepted' && { accepted_date: new Date().toISOString() })
        })
        .eq('id', proposalId)
      
      if (updateError) throw updateError
      
      // If accepted, update project status to awarded
      if (status === 'accepted') {
        const proposal = proposals.find(p => p.id === proposalId)
        if (proposal) {
          const { error: projectError } = await supabase
            .from('projects')
            .update({ status: 'awarded' })
            .eq('id', proposal.project.id)
          
          if (projectError) throw projectError
        }
      }
      
      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { ...p, status, ...(feedback !== undefined && feedback !== null && { rejection_reason_notes: feedback }) }
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
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error("Failed to update proposal status. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.contractor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description_of_work?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    const matchesProject = projectFilter === 'all' || proposal.project?.id === projectFilter
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

  if (proposalsLoading) {
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

  if (!user || userRole !== 'homeowner') {
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="project-filter" className="text-sm font-medium">Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
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
                    {proposal.project?.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-2">
                    Proposal from <span className="font-medium">
                      {proposal.contractor?.full_name || 'Unknown Contractor'}
                    </span>
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
                  <Label className="text-xs font-medium text-gray-600">Subtotal</Label>
                  <p className="text-lg font-semibold text-green-600">
                    {proposal.subtotal_amount ? formatCurrency(proposal.subtotal_amount) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs font-medium text-gray-600">Tax</Label>
                  <p className="text-lg font-semibold text-orange-600">
                    {proposal.tax_included === 'yes' ? 'Included' : 'Not Included'}
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
                      ? `${formatDate(proposal.proposed_start_date.toString())} - ${formatDate(proposal.proposed_end_date.toString())}`
                      : 'Dates not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {proposal.proposed_start_date && proposal.proposed_end_date 
                      ? `${Math.ceil((new Date(proposal.proposed_end_date.toString()).getTime() - new Date(proposal.proposed_start_date.toString()).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : 'Duration not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>Due: {proposal.deposit_due_on ? formatDate(proposal.deposit_due_on.toString()) : 'Not specified'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Description of Work</Label>
                <p className="text-gray-600 text-sm">
                  {proposal.description_of_work || 'No description provided'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                {proposal.status === 'submitted' || proposal.status === 'viewed' ? (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate(proposal.id, 'accepted')}
                      disabled={actionLoading === proposal.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(proposal.id, 'rejected')}
                      disabled={actionLoading === proposal.id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                ) : proposal.status === 'accepted' ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accepted
                  </Badge>
                ) : proposal.status === 'rejected' ? (
                  <Badge variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="capitalize">
                    {proposal.status}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProposals.length === 0 && !proposalsLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t received any proposals yet. Check back later or create a new project to attract contractors.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
