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
  Eye,
  Edit
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
  }
  homeowner_details?: {
    id: string
    full_name: string
    email: string
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
              creator
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

        // Manually fetch homeowner details
        let homeowner_details = null
        if (data.homeowner) {
          const { data: homeownerData, error: homeownerError } = await supabase
            .from('users')
            .select('id, full_name, email')
            .eq('id', data.homeowner)
            .single()
          
          if (!homeownerError && homeownerData) {
            homeowner_details = homeownerData
          }
        }

        // Transform the data to match our ProposalData interface
        const transformedData: ProposalData = {
          ...data,
          project_details: data.project,
          homeowner_details
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-slate-600 font-medium">Loading proposal...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-red-600 font-medium">Failed to load proposal</div>
      </div>
    )
  }

  if (!user || userRole !== 'contractor') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-slate-600 font-medium">Access denied. Only contractors can view their proposals.</div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-slate-600 font-medium">Proposal not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.back()}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
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
                  variant={getStatusVariant(proposal.status as string)}
                  className="capitalize text-sm px-4 py-2 text-base font-medium"
                >
                  {proposal.status as string}
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
                        <p className="text-sm text-slate-500 font-medium">Homeowner</p>
                        <p className="font-semibold text-slate-900">{proposal.homeowner_details?.full_name || 'Unknown'}</p>
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
                          variant={getStatusVariant(proposal.status)}
                          className="capitalize px-3 py-2 text-sm font-medium"
                        >
                          {proposal.status}
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
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      onClick={() => router.push(`/contractor/projects/${proposal.project}`)}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      View Project
                    </Button>
                    
                    {proposal.status === 'draft' && (
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        onClick={() => router.push(`/contractor/projects/submit-proposal/${proposal.project}?edit=${proposal.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Proposal
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      onClick={() => router.push('/contractor/proposals')}
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