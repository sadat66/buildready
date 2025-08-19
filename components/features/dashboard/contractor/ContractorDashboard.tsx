'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'

import ContractorStats from './ContractorStats'
import RecentProposals from './RecentProposals'
import RecentOpportunities from './RecentOpportunities'
import { useAuth } from '@/contexts/AuthContext'

interface Proposal {
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
}

export default function ContractorDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const currentUser = user || (await supabase.auth.getUser()).data.user
        
        if (!currentUser) {
          console.log('No authenticated user found, skipping data fetch')
          setLoading(false)
          return
        }
        
        console.log('Fetching contractor dashboard data for user:', currentUser.id)
        
        // Fetch available projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id,
            project_title,
            statement_of_work,
            budget,
            category,
            pid,
            location,
            project_type,
            status,
            start_date,
            end_date,
            expiry_date,
            created_at,
            updated_at
          `)
          .in('status', ['Published', 'Bidding', 'Open'])
          .order('created_at', { ascending: false })
        
        if (projectsError) {
          throw projectsError
        }
        
        // Cast the data to Project type (we know the structure matches)
        setProjects((projectsData || []) as Project[])

        // Fetch contractor's proposals
        try {
          const { data: proposalsData, error: proposalsError } = await supabase
            .from('proposals')
            .select(`
              id,
              title,
              status,
              subtotal_amount,
              total_amount,
              created_at,
              description_of_work,
              proposed_start_date,
              proposed_end_date,
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
            .eq('contractor', currentUser.id)
            .eq('is_deleted', 'no')
            .order('created_at', { ascending: false })
          
          if (proposalsError) {
            console.warn('Proposals table query failed:', proposalsError)
            setProposals([])
          } else {
            // Transform the data to match our Proposal interface
            const transformedProposals = (proposalsData || []).map(proposal => ({
              ...proposal,
              project: Array.isArray(proposal.project) ? proposal.project[0] : proposal.project
            }))
            setProposals(transformedProposals as Proposal[])
          }
        } catch (proposalsError) {
          console.warn('Proposals table might not exist yet:', proposalsError)
          setProposals([])
        }
        
      } catch (error) {
        // Only log errors if we have a user (avoid logging auth-related errors)
        if (user) {
          console.error('Error fetching contractor dashboard data:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
        // Don't set error state - render dashboard with empty data instead
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            {/* Minimalist Loading Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Loading Your Dashboard</h2>
              <p className="text-gray-600">Preparing your contractor overview...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate contractor statistics
  const totalProposals = proposals.length
  const activeProposals = proposals.filter(p => ['pending', 'under_review'].includes(p.status)).length
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length
  const winRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0
  
  // Calculate earnings from accepted proposals
  const totalEarnings = proposals
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + (p.total_amount || p.subtotal_amount || 0), 0)
  
  const averageProjectValue = acceptedProposals > 0 
    ? Math.round(totalEarnings / acceptedProposals) 
    : 0

  const stats = {
    totalProposals,
    activeProposals,
    acceptedProposals,
    totalEarnings,
    winRate,
    averageProjectValue
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Contractor Statistics */}
          <ContractorStats stats={stats} />

          {/* Recent Proposals */}
          <RecentProposals proposals={proposals} />

          {/* Recent Opportunities */}
          <RecentOpportunities projects={projects} />
        </div>
      </div>
    </div>
  )
}