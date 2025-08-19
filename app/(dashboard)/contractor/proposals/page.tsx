'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { USER_ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Clock, DollarSign, User, Building, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function ContractorProposalsPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [proposals, setProposals] = useState<Array<{
    id: string
    title: string
    status: string
    subtotal_amount: number | null
    total_amount: number | null
    created_at: string
    description_of_work: string
    proposed_start_date: string | null
    proposed_end_date: string | null
    project?: {
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
  }>>([])
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProposals = async () => {
      console.log('fetchProposals called with:', { loading, user: !!user, userRole, userId: user?.id })
      
      if (loading) {
        console.log('Still loading auth state')
        return
      }
      
      if (!user) {
        console.log('No user found, redirecting to login')
        router.push('/login')
        return
      }
      
      if (userRole !== 'contractor') {
        console.log('User is not a contractor, redirecting to appropriate dashboard')
        router.push(`/${userRole}/dashboard`)
        return
      }

      try {
        setProposalsLoading(true)
        setError(null)

        console.log('Starting Supabase query for user:', user.id)
        
        // First, let's try a simple query without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from('proposals')
          .select('*')
          .eq('contractor', user.id)
          .eq('is_deleted', 'no')
          .order('created_at', { ascending: false })

        console.log('Simple query result:', { data: simpleData, error: simpleError })

        if (simpleError) {
          console.error('Simple query error:', simpleError)
          setError(simpleError.message || 'Database query failed')
          return
        }

        // If simple query works, try with joins
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
          .eq('contractor', user.id)
          .eq('is_deleted', 'no')
          .order('created_at', { ascending: false })

        console.log('Join query result:', { data, error: fetchError })

        if (fetchError) {
          console.error('Join query error:', fetchError)
          console.error('Error details:', JSON.stringify(fetchError, null, 2))
          // Fall back to simple data if join fails
          setProposals(simpleData || [])
          setError(`Join query failed: ${fetchError.message || 'Unknown error'}`)
          return
        }

        setProposals(data || [])
        console.log('Successfully set proposals:', data?.length || 0, 'items')
      } catch (err) {
        console.error('Unexpected error:', err)
        console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')
        setError('An unexpected error occurred')
      } finally {
        setProposalsLoading(false)
      }
    }

    fetchProposals()
  }, [loading, user, userRole, supabase, router])

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
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewProposal = (proposalId: string) => {
    router.push(`/contractor/proposals/${proposalId}`)
  }

  const filteredProposals = proposals?.filter(proposal => {
    if (statusFilter === 'all') return true
    return proposal.status === statusFilter
  }) || []

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
        <div className="text-lg text-red-600">Failed to load proposals</div>
      </div>
    )
  }

      if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Access denied. Only contractors can view their proposals.</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-600 mt-1">Track and manage your project proposals</p>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
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
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No proposals yet' : `No ${statusFilter} proposals`}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {statusFilter === 'all' 
                ? 'Start by browsing available projects and submitting your first proposal.'
                : `You don't have any ${statusFilter} proposals at the moment.`
              }
            </p>
            <Button onClick={() => router.push('/contractor/projects')}>
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProposals.map((proposal) => (
            <Card 
              key={proposal.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewProposal(proposal.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {proposal.project?.project_title || 'Project Title'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {proposal.project?.statement_of_work || 'No description available'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={getStatusVariant(proposal.status)}
                    className="capitalize ml-4"
                  >
                    {proposal.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Proposal Amount</p>
                      <p className="font-semibold">{formatCurrency(proposal.total_amount || 0)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Project Budget</p>
                      <p className="font-semibold">{formatCurrency(proposal.project?.budget || 0)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Homeowner</p>
                      <p className="font-semibold">{proposal.project?.users?.full_name || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-semibold">{formatDate(proposal.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
                {(proposal.proposed_start_date || proposal.proposed_end_date) && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Proposed Timeline</p>
                    <div className="flex items-center gap-4 text-sm">
                      {proposal.proposed_start_date && (
                        <span>
                          <span className="font-medium">Start:</span> {formatDate(proposal.proposed_start_date)}
                        </span>
                      )}
                      {proposal.proposed_end_date && (
                        <span>
                          <span className="font-medium">End:</span> {formatDate(proposal.proposed_end_date)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Description Preview */}
                {proposal.description_of_work && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-600 mb-1">Work Description</p>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {proposal.description_of_work}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
