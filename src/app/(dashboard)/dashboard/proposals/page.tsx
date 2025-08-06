'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Proposal } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Calendar,
  User,
  Eye
} from 'lucide-react'
import Link from 'next/link'

export default function ProposalsPage() {
  const { profile } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const supabase = createClient()
  const isHomeowner = profile?.role === 'homeowner'

  const fetchProposals = useCallback(async () => {
    try {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          contractor:users!proposals_contractor_id_fkey(*),
          project:projects!proposals_project_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (isHomeowner) {
        // Homeowners see proposals for their projects
        query = query.eq('project.homeowner_id', profile?.id)
      } else {
        // Contractors see their own proposals
        query = query.eq('contractor_id', profile?.id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching proposals:', error)
        return
      }

      setProposals(data || [])
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, isHomeowner, supabase])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

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

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.contractor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isHomeowner ? 'Project Proposals' : 'My Proposals'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isHomeowner 
            ? 'Review and manage proposals from contractors'
            : 'Track your submitted proposals and their status'
          }
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={isHomeowner ? "Search by project or contractor..." : "Search by project..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isHomeowner ? 'No proposals yet' : 'No proposals submitted'}
            </h3>
            <p className="text-gray-600">
              {isHomeowner 
                ? 'Proposals from contractors will appear here once they submit them'
                : 'Submit proposals for available projects to see them here'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const StatusIcon = getStatusIcon(proposal.status)
            return (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {proposal.project?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {isHomeowner 
                          ? `Proposal from ${proposal.contractor?.full_name}`
                          : `Project by ${proposal.project?.homeowner?.full_name}`
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="w-4 h-4 text-gray-400" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="font-medium">{formatCurrency(proposal.bid_amount)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{proposal.timeline}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>
                        {isHomeowner 
                          ? `${proposal.contractor?.rating || 0}/5 (${proposal.contractor?.review_count || 0} reviews)`
                          : `Posted ${formatDate(proposal.created_at)}`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-700">{proposal.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/proposals/${proposal.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    
                    {isHomeowner && proposal.status === 'pending' && (
                      <>
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
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 