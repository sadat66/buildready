'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Project, Proposal } from '@/types/database'
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
  Eye
} from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const { profile, loading: authLoading } = useAuth()
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()
  
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasSubmittedProposal, setHasSubmittedProposal] = useState(false)
  
  const isHomeowner = profile?.role === 'homeowner'

  useEffect(() => {
    console.log('ProjectDetailPage useEffect triggered:', { projectId, isHomeowner, profileId: profile?.id, authLoading })
    
    // Don't proceed if auth is still loading
    if (authLoading) {
      console.log('Auth still loading, skipping fetch')
      return
    }
    
    // Reset states when projectId changes
    setLoading(true)
    setError('')
    setProject(null)
    setProposals([])
    setHasSubmittedProposal(false)

    const fetchProjectDetails = async () => {
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            homeowner:users!projects_homeowner_id_fkey(*)
          `)
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError
        setProject(projectData)

        // Fetch proposals if homeowner
        if (isHomeowner) {
          const { data: proposalsData, error: proposalsError } = await supabase
            .from('proposals')
            .select(`
              *,
              contractor:users!proposals_contractor_id_fkey(*)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

          if (proposalsError) throw proposalsError
          setProposals(proposalsData || [])
        } else {
          // Check if contractor has already submitted a proposal
          const { data: existingProposal } = await supabase
            .from('proposals')
            .select('id')
            .eq('project_id', projectId)
            .eq('contractor_id', profile?.id)
            .single()

          setHasSubmittedProposal(!!existingProposal)
        }
      } catch (error) {
        console.error('Error fetching project details:', error)
        setError('Failed to load project details')
      } finally {
        console.log('Setting loading to false in finally block')
        setLoading(false)
      }
    }

    if (projectId) {
      console.log('Fetching project details for projectId:', projectId)
      fetchProjectDetails()
    } else {
      console.log('No projectId, setting loading to false')
      setLoading(false)
    }
  }, [projectId, isHomeowner, profile?.id, authLoading])

  const handleProposalAction = async (proposalId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', proposalId)

      if (error) throw error

      // Update local state
      setProposals(prev => prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, status: action === 'accept' ? 'accepted' : 'rejected' }
          : proposal
      ))
    } catch (error) {
      console.error('Error updating proposal:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'bidding': return 'bg-blue-100 text-blue-800'
      case 'awarded': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProposalStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'accepted': return CheckCircle
      case 'rejected': return XCircle
      default: return Clock
    }
  }

  // Show loading if auth is still loading or if we're loading project data
  if (authLoading || loading) {
    console.log('Rendering loading state for project:', projectId, { authLoading, loading })
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Loading user profile...' : 'Loading project details...'}
          </p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
        <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/dashboard/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div key={projectId} className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{project.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="font-medium">Budget:</span>
                  <span className="ml-2">{formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Category:</span>
                  <span className="ml-2">{project.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Posted:</span>
                  <span className="ml-2">{formatDate(project.created_at)}</span>
                </div>
              </div>
              
              {project.deadline && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Deadline:</span>
                  <span className="ml-2">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposals Section */}
          {isHomeowner && (
            <Card>
              <CardHeader>
                <CardTitle>Proposals ({proposals.length})</CardTitle>
                <CardDescription>
                  Review proposals from contractors for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                    <p className="text-gray-600">
                      Proposals from contractors will appear here once they submit them
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => {
                      const StatusIcon = getProposalStatusIcon(proposal.status)
                      return (
                        <div key={proposal.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {proposal.contractor?.full_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Rating: {proposal.contractor?.rating || 0}/5 ({proposal.contractor?.review_count || 0} reviews)
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="w-4 h-4 text-gray-400" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {proposal.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="text-sm">
                              <span className="font-medium">Bid Amount:</span>
                              <span className="ml-2 text-green-600 font-semibold">
                                {formatCurrency(proposal.bid_amount)}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Timeline:</span>
                              <span className="ml-2">{proposal.timeline}</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <p className="text-sm text-gray-700">{proposal.description}</p>
                          </div>
                          
                          {proposal.status === 'pending' && (
                                                       <div className="flex gap-2">
                             <Link href={`/dashboard/proposals/${proposal.id}`}>
                               <Button variant="outline" size="sm">
                                 <Eye className="w-4 h-4 mr-1" />
                                 View Details
                               </Button>
                             </Link>
                             <Button 
                               size="sm" 
                               onClick={() => handleProposalAction(proposal.id, 'accept')}
                               className="bg-green-600 hover:bg-green-700"
                             >
                               <CheckCircle className="w-4 h-4 mr-1" />
                               Accept
                             </Button>
                             <Button 
                               size="sm" 
                               variant="destructive"
                               onClick={() => handleProposalAction(proposal.id, 'reject')}
                             >
                               <XCircle className="w-4 h-4 mr-1" />
                               Reject
                             </Button>
                           </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Homeowner Info */}
          <Card>
            <CardHeader>
              <CardTitle>Homeowner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{project.homeowner?.full_name}</h4>
                  <p className="text-sm text-gray-600">{project.homeowner?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons for Contractors */}
          {!isHomeowner && project.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Proposal</CardTitle>
                <CardDescription>
                  Submit your bid for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasSubmittedProposal ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">You have already submitted a proposal for this project</p>
                    <Link href="/dashboard/proposals" className="mt-3 inline-block">
                      <Button variant="outline" size="sm">
                        View My Proposals
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={`/dashboard/projects/${project.id}/propose`}>
                    <Button className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Submit Proposal
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 