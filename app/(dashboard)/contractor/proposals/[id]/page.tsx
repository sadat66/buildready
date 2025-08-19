'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Phone,
  Mail
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ProposalViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProposalViewPage({ params }: ProposalViewPageProps) {
  const resolvedParams = React.use(params)
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [proposal, setProposal] = useState<any>(null)
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

        setProposal(data)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setProposalLoading(false)
      }
    }

    fetchProposal()
  }, [loading, user, userRole, resolvedParams.id, supabase])

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
          <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
          <p className="text-gray-600 mt-1">Proposal Details</p>
        </div>
        <Badge 
          variant={getStatusVariant(proposal.status)}
          className="capitalize text-sm px-3 py-1"
        >
          {proposal.status}
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
                <h3 className="font-semibold text-lg">{proposal.project?.project_title}</h3>
                <p className="text-gray-600 mt-1">{proposal.project?.statement_of_work}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Category:</span> {proposal.project?.category || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Location:</span> {
                      proposal.project?.location 
                        ? `${proposal.project.location.address}, ${proposal.project.location.city}, ${proposal.project.location.province}` 
                        : 'Not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Project Budget:</span> {formatCurrency(proposal.project?.budget || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Homeowner:</span> {proposal.project?.users?.full_name || 'Unknown'}
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
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.description_of_work}</p>
              </div>
              
              {proposal.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{proposal.notes}</p>
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
                    {proposal.proposed_start_date ? formatDate(proposal.proposed_start_date) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Proposed End Date</h4>
                  <p className="text-gray-700">
                    {proposal.proposed_end_date ? formatDate(proposal.proposed_end_date) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Deposit Due Date</h4>
                  <p className="text-gray-700">
                    {proposal.deposit_due_on ? formatDate(proposal.deposit_due_on) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Proposal Expires</h4>
                  <p className="text-gray-700">
                    {proposal.expiry_date ? formatDate(proposal.expiry_date) : 'Not specified'}
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
                
                {proposal.tax_included && (
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
                  <p className="font-medium">{formatDate(proposal.created_at)}</p>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Last Updated</span>
                  <p className="font-medium">{formatDate(proposal.last_updated)}</p>
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