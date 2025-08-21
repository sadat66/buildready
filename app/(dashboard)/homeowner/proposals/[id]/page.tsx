'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Building, 
  User, 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText, 
  MapPin,
  Check,
  X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { PROPOSAL_STATUSES } from '@/lib/constants/proposals'
import { Proposal } from '@/lib/database/schemas/proposals'

interface ProposalViewPageProps {
  params: Promise<{
    id: string
  }>
}

// Use the schema-based Proposal type and add only the additional fields
// Create a database-compatible version that handles string dates from the database
type ProposalData = Omit<Proposal, 'createdAt' | 'updatedAt' | 'proposed_start_date' | 'proposed_end_date' | 'expiry_date' | 'deposit_due_on' | 'submitted_date' | 'accepted_date' | 'rejected_date' | 'withdrawn_date' | 'viewed_date' | 'last_updated' | 'rejected_by'> & {
  // Database returns string dates, not Date objects
  proposed_start_date: string | null
  proposed_end_date: string | null
  expiry_date: string | null
  deposit_due_on: string | null
  submitted_date: string | null
  accepted_date: string | null
  rejected_date: string | null
  withdrawn_date: string | null
  viewed_date: string | null
  last_updated: string
  // Override rejected_by to allow null (database can return null)
  rejected_by: string | null
  // Additional fields from the database query that aren't in the base schema
  project_details?: {
    id: string
    project_title: string
    statement_of_work: string
    category: string
    location: string
    status: string
    budget: number | null
    creator: string
  }
  contractor_details?: {
    id: string
    full_name: string
    email: string
    phone_number?: string
    address?: string
  }
}

export default function HomeownerProposalViewPage({ params }: ProposalViewPageProps) {
  const router = useRouter()
  const { user, userRole } = useAuth()
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [proposalId, setProposalId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProposalId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!proposalId || !user) return

    const fetchProposal = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('proposals')
          .select(`
            *,
            project_details:projects!proposals_project_fkey(
              id,
              project_title,
              statement_of_work,
              category,
              location,
              status,
              budget,
              creator
            ),
            contractor_details:users!proposals_contractor_fkey(
              id,
              full_name,
              email,
              phone_number,
              address
            )
          `)
          .eq('id', proposalId)
          .eq('homeowner', user.id)
          .single()

        if (error) {
          console.error('Error fetching proposal:', error)
          setError('Failed to load proposal')
          return
        }

        if (!data) {
          setError('Proposal not found or you do not have access to it')
          return
        }

        setProposal(data as ProposalData)
        
        // Mark proposal as viewed if not already viewed
        if (!data.viewed_date) {
          await supabase
            .from('proposals')
            .update({ viewed_date: new Date().toISOString() })
            .eq('id', proposalId)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [proposalId, user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadgeStyle = (status: string) => {
    const badgeStyles = {
      [PROPOSAL_STATUSES.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-300',
      [PROPOSAL_STATUSES.SUBMITTED]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [PROPOSAL_STATUSES.VIEWED]: 'bg-blue-100 text-blue-800 border-blue-300',
      [PROPOSAL_STATUSES.ACCEPTED]: 'bg-green-100 text-green-800 border-green-300',
      [PROPOSAL_STATUSES.REJECTED]: 'bg-red-100 text-red-800 border-red-300',
      [PROPOSAL_STATUSES.WITHDRAWN]: 'bg-gray-100 text-gray-800 border-gray-300',
      [PROPOSAL_STATUSES.EXPIRED]: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return badgeStyles[status as keyof typeof badgeStyles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getDisplayStatus = (status: string) => {
    return status === PROPOSAL_STATUSES.SUBMITTED ? 'pending' : status
  }

  const handleAcceptProposal = async () => {
    if (!proposal || actionLoading) return

    setActionLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('proposals')
        .update({
          status: PROPOSAL_STATUSES.ACCEPTED,
          accepted_date: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .eq('id', proposal.id)

      if (error) {
        console.error('Error accepting proposal:', error)
        toast.error('Failed to accept proposal')
        return
      }

      toast.success('Proposal accepted successfully!')
      setProposal(prev => prev ? {
        ...prev,
        status: PROPOSAL_STATUSES.ACCEPTED,
        accepted_date: new Date().toISOString()
      } : null)
    } catch (err) {
      console.error('Error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectProposal = async () => {
    if (!proposal || actionLoading) return

    setActionLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('proposals')
        .update({
          status: PROPOSAL_STATUSES.REJECTED,
          rejected_date: new Date().toISOString(),
          rejected_by: user?.id,
          last_updated: new Date().toISOString()
        })
        .eq('id', proposal.id)

      if (error) {
        console.error('Error rejecting proposal:', error)
        toast.error('Failed to reject proposal')
        return
      }

      toast.success('Proposal rejected')
      setProposal(prev => prev ? {
        ...prev,
        status: PROPOSAL_STATUSES.REJECTED,
        rejected_date: new Date().toISOString(),
        rejected_by: user?.id || null
      } : null)
    } catch (err) {
      console.error('Error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Proposal</h2>
          <p className="text-slate-600 mb-4">{error || 'Proposal not found'}</p>
          <Button 
            onClick={() => router.push('/homeowner/proposals')}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proposals
          </Button>
        </div>
      </div>
    )
  }

  if (userRole !== 'homeowner') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">You do not have permission to view this proposal.</p>
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-6">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/homeowner/proposals')}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 h-auto w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">{proposal.title as string}</h1>
                    <p className="text-slate-500 mt-2 font-medium">Proposal Details</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge 
                  variant="outline"
                  className={`capitalize text-sm px-4 py-2 text-base font-medium border ${getStatusBadgeStyle(proposal.status as string)}`}
                >
                  {getDisplayStatus(proposal.status as string)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Information */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-slate-600" />
                    </div>
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold text-lg text-slate-900">{proposal.project_details?.project_title || 'Untitled Project'}</h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">{proposal.project_details?.statement_of_work || 'No description provided'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Category</p>
                        <p className="font-semibold text-slate-900">{proposal.project_details?.category || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Location</p>
                        <p className="font-semibold text-slate-900">
                          {proposal.project_details?.location 
                            ? (() => {
                                try {
                                  const location = typeof proposal.project_details.location === 'string' 
                                    ? JSON.parse(proposal.project_details.location) 
                                    : proposal.project_details.location;
                                  return `${location.address || 'Unknown'}, ${location.city || 'Unknown'}, ${location.province || 'Unknown'}`;
                                } catch {
                                  return proposal.project_details.location || 'Not specified';
                                }
                              })()
                            : 'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Project Budget</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(proposal.project_details?.budget || 0)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Contractor</p>
                        <p className="font-semibold text-slate-900">{proposal.contractor_details?.full_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proposal Details */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    Proposal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-medium text-slate-900 mb-3">Description of Work</h4>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{proposal.description_of_work as string}</p>
                  </div>
                  
                  {(proposal.notes as string) && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium text-slate-900 mb-3">Additional Notes</h4>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{proposal.notes as string}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-slate-600" />
                    </div>
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="text-sm text-slate-500 font-medium mb-2">Proposed Start Date</h4>
                      <p className="font-semibold text-slate-900">
                        {proposal.proposed_start_date ? formatDate(proposal.proposed_start_date as string) : 'Not specified'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="text-sm text-slate-500 font-medium mb-2">Proposed End Date</h4>
                      <p className="font-semibold text-slate-900">
                        {proposal.proposed_end_date ? formatDate(proposal.proposed_end_date as string) : 'Not specified'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="text-sm text-slate-500 font-medium mb-2">Deposit Due Date</h4>
                      <p className="font-semibold text-slate-900">
                        {proposal.deposit_due_on ? formatDate(proposal.deposit_due_on as string) : 'Not specified'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="text-sm text-slate-500 font-medium mb-2">Proposal Expires</h4>
                      <p className="font-semibold text-slate-900">
                        {proposal.expiry_date ? formatDate(proposal.expiry_date as string) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Financial Summary */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                    </div>
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-600 font-medium">Subtotal</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(proposal.subtotal_amount || 0)}</span>
                      </div>
                      
                      {proposal.tax_included === 'yes' && (
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-slate-600 font-medium">Tax Included</span>
                          <span className="text-green-600 text-sm font-medium">✓ Yes</span>
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-slate-900">Total Amount</span>
                        <span className="font-bold text-lg text-slate-900">{formatCurrency(proposal.total_amount || 0)}</span>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Deposit Required</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(proposal.deposit_amount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proposal Status */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-600" />
                    </div>
                    Proposal Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-500 font-medium mb-3 block">Current Status</span>
                      <div className="mb-4">
                        <Badge 
                          variant="outline"
                          className={`capitalize px-3 py-2 text-sm font-medium border ${getStatusBadgeStyle(proposal.status)}`}
                        >
                          {getDisplayStatus(proposal.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-slate-500 font-medium">Submitted</span>
                          <p className="font-semibold text-slate-900">{formatDate(proposal.submitted_date as string)}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-slate-500 font-medium">Last Updated</span>
                          <p className="font-semibold text-slate-900">{formatDate(proposal.last_updated as string)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(proposal.status === PROPOSAL_STATUSES.SUBMITTED || proposal.status === PROPOSAL_STATUSES.VIEWED) && (
                      <>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleAcceptProposal}
                          disabled={actionLoading}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {actionLoading ? 'Accepting...' : 'Accept Proposal'}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          onClick={handleRejectProposal}
                          disabled={actionLoading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {actionLoading ? 'Rejecting...' : 'Reject Proposal'}
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      onClick={() => router.push('/homeowner/proposals')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Proposals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}