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
  MapPin
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ProposalViewPageProps {
  params: Promise<{
    id: string
  }>
}

// Define a proper type for the proposal data
interface ProposalData {
  id: string
  title: string
  description_of_work: string
  subtotal_amount: number | null
  tax_included: 'yes' | 'no'
  total_amount: number | null
  deposit_amount: number | null
  deposit_due_on: string | null
  proposed_start_date: string | null
  proposed_end_date: string | null
  expiry_date: string | null
  status: string
  is_selected: 'yes' | 'no'
  is_deleted: 'yes' | 'no'
  submitted_date: string | null
  accepted_date: string | null
  rejected_date: string | null
  withdrawn_date: string | null
  viewed_date: string | null
  last_updated: string
  rejected_by: string | null
  rejection_reason: string | null
  rejection_reason_notes: string | null
  clause_preview_html: string | null
  attached_files: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: string
  }>
  notes: string | null
  agreement: string | null
  proposals: string[]
  created_by: string
  last_modified_by: string
  visibility_settings: string
  project: string
  contractor: string
  homeowner: string
  project_details?: {
    id: string
    project_title: string
    statement_of_work: string
    category: string
    location: string
    status: string
    budget: number | null
    creator: string
    users?: {
      id: string
      full_name: string
    }
  }
}

export default function ProposalViewPage({ params }: ProposalViewPageProps) {
  const resolvedParams = React.use(params)
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [proposalLoading, setProposalLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProposal = async () => {
      if (loading) {
        return
      }

      if (!user) {
        router.push('/login')
        return
      }

      if (userRole !== 'contractor') {
        router.push(`/${userRole}/dashboard`)
        return
      }

      try {
        setProposalLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('proposals')
          .select(`
            *,
            project:projects (
              id,
              project_title,
              statement_of_work,
              category,
              location,
              status,
              budget,
              creator,
              users!projects_creator_fkey (
                id,
                full_name
              )
            )
          `)
          .eq('id', resolvedParams.id)
          .eq('contractor', user.id)
          .eq('is_deleted', 'no')
          .single()

        if (fetchError) {
          console.error('Error fetching proposal:', fetchError)
          setError(fetchError.message)
          return
        }

        // Transform the data to match our ProposalData interface
        const transformedData: ProposalData = {
          ...data,
          project_details: data.project
        }

        setProposal(transformedData)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setProposalLoading(false)
      }
    }

    fetchProposal()
  }, [loading, user, userRole, resolvedParams.id, supabase, router])

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'accepted':
        return 'default'
      case 'submitted':
      case 'viewed':
        return 'secondary'
      case 'rejected':
      case 'withdrawn':
      case 'expired':
        return 'destructive'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading || proposalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading proposal...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load proposal</div>
      </div>
    )
  }

  if (!user || userRole !== 'contractor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Access denied. Only contractors can view their proposals.</div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Proposal not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{proposal.title as string}</h1>
          <p className="text-gray-600 mt-1">Proposal Details</p>
        </div>
        <Badge 
          variant={getStatusVariant(proposal.status as string)}
          className="capitalize text-sm px-3 py-1"
        >
          {proposal.status as string}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                              <div>
                  <h3 className="font-semibold text-lg">{proposal.project_details?.project_title || 'Untitled Project'}</h3>
                  <p className="text-gray-600 mt-1">{proposal.project_details?.statement_of_work || 'No description provided'}</p>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <span className="font-medium">Category:</span> {proposal.project_details?.category || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <span className="font-medium">Location:</span> {
                        proposal.project_details?.location 
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
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <span className="font-medium">Project Budget:</span> {formatCurrency(proposal.project_details?.budget || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <span className="font-medium">Homeowner:</span> {proposal.project_details?.users?.full_name || 'Unknown'}
                    </span>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Proposal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description of Work</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.description_of_work as string}</p>
              </div>
              
              {(proposal.notes as string) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{proposal.notes as string}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Proposed Start Date</h4>
                  <p className="text-gray-700">
                    {proposal.proposed_start_date ? formatDate(proposal.proposed_start_date as string) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Proposed End Date</h4>
                  <p className="text-gray-700">
                    {proposal.proposed_end_date ? formatDate(proposal.proposed_end_date as string) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Deposit Due Date</h4>
                  <p className="text-gray-700">
                    {proposal.deposit_due_on ? formatDate(proposal.deposit_due_on as string) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Proposal Expires</h4>
                  <p className="text-gray-700">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(proposal.subtotal_amount || 0)}</span>
                </div>
                
                {proposal.tax_included === 'yes' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax Included</span>
                    <span className="text-green-600 text-sm">✓ Yes</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(proposal.total_amount || 0)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Deposit Required</span>
                  <span className="font-medium text-blue-600">{formatCurrency(proposal.deposit_amount || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Proposal Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">Current Status</span>
                  <div className="mt-1">
                    <Badge 
                      variant={getStatusVariant(proposal.status)}
                      className="capitalize"
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Submitted</span>
                  <p className="font-medium">{formatDate(proposal.submitted_date as string)}</p>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Last Updated</span>
                  <p className="font-medium">{formatDate(proposal.last_updated as string)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/contractor/projects/${proposal.project}`)}
              >
                <Building className="w-4 h-4 mr-2" />
                View Project
              </Button>
              
              {proposal.status === 'draft' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/contractor/projects/submit-proposal/${proposal.project}?edit=${proposal.id}`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Edit Proposal
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/contractor/proposals')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Proposals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}