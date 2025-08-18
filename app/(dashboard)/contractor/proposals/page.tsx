'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, DollarSign, User, Building } from 'lucide-react'

interface Proposal {
  id: string
  project_id: string
  contractor_id: string
  bid_amount: number
  description: string
  timeline: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
  project?: {
    id: string
    title: string
    budget: number
    location: string
    category: string
    creator: string
    homeowner?: {
      full_name: string
      first_name: string
      last_name: string
    }
  }
}

export default function ContractorProposalsPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) {
        setProposalsLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('proposals')
          .select(`
            *,
            project:projects(
              id,
              title,
              budget,
              location,
              category,
              creator,
              homeowner:users!creator(
                full_name,
                first_name,
                last_name
              )
            )
          `)
          .eq('contractor_id', user.id)
          .order('created_at', { ascending: false })
        
        if (fetchError) {
          console.error('Supabase error:', fetchError)
          throw fetchError
        }
        
        console.log('Fetched proposals:', data)
        setProposals(data || [])
      } catch (error) {
        console.error('Error fetching proposals:', error)
        setError('Failed to load proposals')
      } finally {
        setProposalsLoading(false)
      }
    }
    
    if (!loading && user && userRole === 'contractor') {
      fetchProposals()
    }
  }, [user, userRole, loading])

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
        <div className="text-lg text-red-600">{error}</div>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'accepted':
        return 'bg-gray-900 text-white'
      case 'rejected':
        return 'bg-gray-100 text-gray-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getHomeownerName = (proposal: Proposal) => {
    if (proposal.project?.homeowner) {
      const homeowner = proposal.project.homeowner
      if (homeowner.first_name && homeowner.last_name) {
        return `${homeowner.first_name} ${homeowner.last_name}`.trim()
      } else if (homeowner.full_name) {
        return homeowner.full_name
      }
    }
    return 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
        <p className="text-gray-600">Track your submitted project proposals</p>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {proposal.project?.title || 'Project Title Unavailable'}
                  </CardTitle>
                  <CardDescription className="mt-2">{proposal.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {proposal.project?.category?.replace('_', ' ') || 'Unknown Category'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{getHomeownerName(proposal)}</p>
                    <p className="text-sm text-gray-600">Homeowner</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatCurrency(proposal.bid_amount)}</p>
                    <p className="text-sm text-gray-600">Your bid</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{proposal.timeline}</p>
                    <p className="text-sm text-gray-600">Timeline</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Project Budget: </span>
                    <span className="font-medium">
                      {proposal.project?.budget ? formatCurrency(proposal.project.budget) : 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location: </span>
                    <span className="font-medium">{proposal.project?.location || 'Not specified'}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Submitted: {formatDate(proposal.created_at)}
                </p>
                {proposal.updated_at !== proposal.created_at && (
                  <p className="text-sm text-gray-600">
                    Last updated: {formatDate(proposal.updated_at)}
                  </p>
                )}
              </div>

           
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {proposals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
            <p className="text-gray-600 mb-4">Submit your first proposal to get started</p>
            <Button onClick={() => router.push('/contractor/projects')}>
              <Building className="h-4 w-4 mr-2" />
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
