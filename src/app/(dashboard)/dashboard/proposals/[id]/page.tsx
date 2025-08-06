'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Proposal, Project } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MessageCircle,
  Phone
} from 'lucide-react'
import Link from 'next/link'

export default function ViewProposalPage() {
  const { profile, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const proposalId = params.id as string
  const supabase = createClient()
  
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  
  const isHomeowner = profile?.role === 'homeowner'
  const isContractor = profile?.role === 'contractor'

  useEffect(() => {
    console.log('ViewProposalPage useEffect triggered:', { proposalId, isHomeowner, isContractor, profileId: profile?.id, authLoading })
    
    // Don't proceed if auth is still loading
    if (authLoading) {
      console.log('Auth still loading, skipping fetch')
      return
    }
    
    // Reset states when proposalId changes
    setLoading(true)
    setError('')
    setProposal(null)
    setProject(null)

    const fetchProposalDetails = async () => {
      try {
        // Fetch proposal with related data
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            *,
            contractor:users!proposals_contractor_id_fkey(*),
            project:projects!proposals_project_id_fkey(
              *,
              homeowner:users!projects_homeowner_id_fkey(*)
            )
          `)
          .eq('id', proposalId)
          .single()

        if (proposalError) throw proposalError

        // Check if user has permission to view this proposal
        if (isHomeowner && proposalData.project.homeowner_id !== profile?.id) {
          setError('You do not have permission to view this proposal')
          return
        }

        if (isContractor && proposalData.contractor_id !== profile?.id) {
          setError('You do not have permission to view this proposal')
          return
        }

        setProposal(proposalData)
        setProject(proposalData.project)
      } catch (error) {
        console.error('Error fetching proposal details:', error)
        setError('Failed to load proposal details')
      } finally {
        setLoading(false)
      }
    }

    if (proposalId) {
      console.log('Fetching proposal details for proposalId:', proposalId)
      fetchProposalDetails()
    } else {
      console.log('No proposalId, setting loading to false')
      setLoading(false)
    }
  }, [proposalId, isHomeowner, isContractor, profile?.id, authLoading])

  const handleProposalAction = async (action: 'accept' | 'reject') => {
    if (!proposal) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', proposalId)

      if (error) throw error

      // Update local state
      setProposal(prev => prev ? { ...prev, status: action === 'accept' ? 'accepted' : 'rejected' } : null)

      // Show success message and redirect
      setTimeout(() => {
        router.push('/dashboard/proposals')
      }, 1500)
    } catch (error) {
      console.error('Error updating proposal:', error)
      setError('Failed to update proposal status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'accepted': return CheckCircle
      case 'rejected': return XCircle
      default: return Clock
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ))
  }

  // Show loading if auth is still loading or if we're loading proposal data
  if (authLoading || loading) {
    console.log('Rendering loading state for proposal:', proposalId, { authLoading, loading })
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Loading user profile...' : 'Loading proposal details...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/dashboard/proposals">
          <Button>Back to Proposals</Button>
        </Link>
      </div>
    )
  }

  if (!proposal || !project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Proposal Not Found</h2>
        <p className="text-gray-600 mb-4">The proposal you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/dashboard/proposals">
          <Button>Back to Proposals</Button>
        </Link>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(proposal.status)

  return (
    <div key={proposalId} className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/proposals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proposals
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">Proposal Details</h1>
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-4 h-4 text-gray-400" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                {proposal.status}
              </span>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            {isHomeowner 
              ? `Proposal from ${proposal.contractor?.full_name} for ${project.title}`
              : `Your proposal for ${project.title}`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Proposal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(proposal.bid_amount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                  <p className="text-lg font-medium text-gray-900">{proposal.timeline}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Description</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                  <p className="text-gray-600">{formatDate(proposal.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-gray-600">{formatDate(proposal.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
                <p className="text-gray-600 mt-1">{project.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Budget: {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Category: {project.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Posted: {formatDate(project.created_at)}</span>
                </div>
              </div>
              
              {project.deadline && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contractor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                {isHomeowner ? 'Contractor' : 'Your Profile'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{proposal.contractor?.full_name}</h4>
                  <p className="text-sm text-gray-600">{proposal.contractor?.email}</p>
                </div>
              </div>

              {proposal.contractor?.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{proposal.contractor.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(proposal.contractor?.rating || 0)}
                </div>
                <span className="text-sm text-gray-600">
                  ({proposal.contractor?.rating || 0}/5)
                </span>
              </div>

              <div className="text-sm text-gray-600">
                {proposal.contractor?.review_count || 0} reviews
              </div>

              {proposal.contractor?.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <p className="text-sm text-gray-600">{proposal.contractor.bio}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
                {proposal.contractor?.phone && (
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Homeowner Information (for contractors) */}
          {isContractor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Homeowner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{project.homeowner?.full_name}</h4>
                    <p className="text-sm text-gray-600">{project.homeowner?.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {isHomeowner && proposal.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Accept or reject this proposal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleProposalAction('accept')}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {updating ? 'Accepting...' : 'Accept Proposal'}
                </Button>
                <Button 
                  onClick={() => handleProposalAction('reject')}
                  disabled={updating}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {updating ? 'Rejecting...' : 'Reject Proposal'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          {proposal.status !== 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-5 h-5 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                    {proposal.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {proposal.status === 'accepted' 
                    ? 'This proposal has been accepted by the homeowner.'
                    : 'This proposal has been rejected by the homeowner.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 