'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { USER_ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FileText, Search, Grid3X3, Table2 } from 'lucide-react'
import { Breadcrumbs, LoadingSpinner, SharedPagination, ResultsSummary } from '@/components/shared'
import { ContractorProposalTable } from '@/components/features/projects/ContractorProposalTable'
import { ProposalCardGrid } from '@/components/features/proposals'

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



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              My Proposals
            </h1>
            <p className="text-muted-foreground">
              Track and manage your project proposals
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600">
              Only contractors can view their proposals.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/contractor/dashboard' },
          { label: 'My Proposals', href: '/contractor/proposals' },
        ]}
      />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Proposals
          </h1>
          <p className="text-muted-foreground">
            Track and manage your project proposals
          </p>
        </div>
      </div>

      {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
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

          {/* View Toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted">
            <Button
            variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 px-3"
            >
            <Table2 className="h-4 w-4" />
            </Button>
            <Button
            variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
            onClick={() => setViewMode("card")}
            className="h-8 px-3"
            >
            <Grid3X3 className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Results Summary */}
      <ResultsSummary
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredProposals.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Content */}
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
        <>
          {viewMode === 'table' ? (
            <ContractorProposalTable
              proposals={paginatedProposals}
              onProposalClick={handleViewDetails}
              onViewDetails={handleViewDetails}
              onEditProposal={handleEditProposal}
            />
          ) : (
            <ProposalCardGrid
              proposals={paginatedProposals}
              onViewDetails={handleViewDetails}
              onEditProposal={handleEditProposal}
              formatDate={formatDate}
              onBrowseProjects={() => router.push('/contractor/projects')}
            />
          )}

          {/* Shared Pagination */}
          <SharedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}
