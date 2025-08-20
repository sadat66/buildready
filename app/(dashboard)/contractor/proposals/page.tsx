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
import { Input } from '@/components/ui/input'
import { FileText, Clock, DollarSign, User, Building, Filter, Search, Table as TableIcon, Grid } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import LoadingSpinner from '@/components/shared/loading-spinner'
import { ContractorProposalTable } from '@/components/features/projects/ContractorProposalTable'

export default function ContractorProposalsPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
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
    }
    homeowner_details?: {
      id: string
      full_name: string
      email: string
    }
    contractor?: {
      id: string
      full_name: string
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
              creator:users (
                id,
                full_name
              )
            ),
            contractor:users!proposals_contractor_fkey (
              id,
              full_name
            )
          `)
          .eq('contractor', user.id)
          .eq('is_deleted', 'no')
          .order('created_at', { ascending: false })

        console.log('Join query result:', { data, error: fetchError })

        if (fetchError) {
          console.error('Join query error:', fetchError)
          setError(fetchError.message || 'Failed to fetch proposals')
          return
        }

        // Manually fetch homeowner details for each proposal
        const proposalsWithHomeowners = await Promise.all(
          (data || []).map(async (proposal) => {
            if (proposal.homeowner) {
              const { data: homeownerData, error: homeownerError } = await supabase
                .from('users')
                .select('id, full_name, email')
                .eq('id', proposal.homeowner)
                .single()
              
              if (!homeownerError && homeownerData) {
                return {
                  ...proposal,
                  homeowner_details: homeownerData
                }
              }
            }
            return proposal
          })
        )

        console.log('Final proposals with homeowner data:', proposalsWithHomeowners)
         setProposals(proposalsWithHomeowners)
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

  const handleViewDetails = (proposal: typeof proposals[0]) => {
    router.push(`/contractor/proposals/${proposal.id}`)
  }

  const handleEditProposal = (proposal: typeof proposals[0]) => {
    if (proposal.project?.id) {
      router.push(`/contractor/projects/submit-proposal/${proposal.project.id}?edit=${proposal.id}`)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  // Filter and search proposals
  const filteredProposals = proposals?.filter(proposal => {
    const matchesSearch = 
      proposal.project?.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.homeowner_details?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description_of_work?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  // Pagination calculations
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProposals = filteredProposals.slice(startIndex, endIndex)

  if (loading || proposalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-2">Failed to load proposals</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-gray-900 mb-2">Access Denied</div>
            <p className="text-gray-600">Only contractors can view their proposals.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/contractor/dashboard' },
          { label: 'My Proposals', href: '/contractor/proposals' },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Proposals</h1>
        <p className="text-gray-600">Track and manage your project proposals</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid className="w-4 h-4 mr-2" />
              Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredProposals.length)} of {filteredProposals.length} proposals
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
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
        <div className="space-y-6">
          {viewMode === 'table' ? (
            <ContractorProposalTable
              proposals={paginatedProposals}
              onProposalClick={handleViewDetails}
              onViewDetails={handleViewDetails}
              onEditProposal={handleEditProposal}
            />
          ) : (
            <div className="grid gap-6">
              {paginatedProposals.map((proposal) => (
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
                          <p className="font-semibold">{proposal.homeowner_details?.full_name || 'Unknown'}</p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
