'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProjectView } from '@/components/features/projects'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { USER_ROLES } from '@/lib/constants'

interface Project {
  id: string
  project_title: string
  statement_of_work: string
  budget: number
  category: string[]
  pid: string
  location: {
    address: string
    city: string
    province: string
    postalCode: string
    latitude?: number
    longitude?: number
  }
  project_type: string
  status: string
  visibility_settings: string
  start_date: string
  end_date: string
  expiry_date: string
  decision_date: string
  substantial_completion: string | null
  permit_required: boolean
  is_verified_project: boolean
  certificate_of_title: string | null
  project_photos: Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>
  files: Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>
  creator: string
  proposal_count: number
  created_at: string
  updated_at: string
}

interface Proposal {
  id: string
  title: string
  description_of_work: string
  project: string
  contractor: string
  homeowner: string
  subtotal_amount: number
  tax_included: 'yes' | 'no'
  total_amount: number
  deposit_amount: number
  deposit_due_on: string
  proposed_start_date: string
  proposed_end_date: string
  expiry_date: string
  status: 'draft' | 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  is_selected: 'yes' | 'no'
  submitted_date?: string
  accepted_date?: string
  rejected_date?: string
  rejection_reason?: 'price_too_high' | 'timeline_unrealistic' | 'experience_insufficient' | 'scope_mismatch' | 'other'
  rejection_reason_notes?: string
  clause_preview_html?: string
  attached_files: Array<{ id: string; filename: string; url: string; size?: number; mimeType?: string; uploadedAt?: Date }>
  notes?: string
  created_at: string
  updated_at: string
  contractor_profile?: {
    id: string
    full_name: string
    email: string
    phone_number?: string
    address?: string
  }
}

export default function ProjectViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [updatingProposal, setUpdatingProposal] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) {
        setLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('creator', user.id)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }
    
    const fetchProposals = async () => {
      if (!id || !user) {
        setProposalsLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('proposals')
          .select(`
            *,
            contractor_profile:users!proposals_contractor_fkey (
              id,
              full_name,
              email,
              phone_number,
              address
            )
          `)
          .eq('project', id)
          .eq('homeowner', user.id)
          .eq('is_deleted', 'no')
          .in('status', ['submitted', 'viewed', 'accepted', 'rejected'])
          .order('created_at', { ascending: false })
        
        if (fetchError) {
          throw fetchError
        }
        
        setProposals(data || [])
      } catch (error) {
        console.error('Error fetching proposals:', error)
      } finally {
        setProposalsLoading(false)
      }
    }
    
    fetchProject()
    fetchProposals()
  }, [id, user])

  const handleEditProject = () => {
    router.push(`/homeowner/projects/edit/${project?.id}`)
  }

  const handleDeleteProject = async () => {
    if (!project || !user) return
    
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }
    
    setDeleting(true)
    
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .eq('creator', user.id)
      
      if (deleteError) {
        throw deleteError
      }
      
      toast.success('Project deleted successfully')
      router.push('/homeowner/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  const handleAcceptProposal = async (proposalId: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to accept this proposal? This will reject all other proposals for this project.')) {
      return
    }
    
    setUpdatingProposal(proposalId)
    
    try {
      const supabase = createClient()
      
      // First, mark the selected proposal as viewed (if not already)
      await supabase
        .from('proposals')
        .update({
          status: 'viewed',
          viewed_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('status', 'submitted')
      
      // Accept the selected proposal
      const { error: acceptError } = await supabase
        .from('proposals')
        .update({
          status: 'accepted',
          is_selected: 'yes',
          accepted_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('homeowner', user.id)
      
      if (acceptError) {
        throw acceptError
      }
      
      // Reject all other proposals for this project
      const { error: rejectError } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejected_date: new Date().toISOString(),
          rejection_reason: 'other',
          rejection_reason_notes: 'Another proposal was selected',
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('project', id)
        .neq('id', proposalId)
        .in('status', ['submitted', 'viewed'])
      
      if (rejectError) {
        throw rejectError
      }
      
      // Update project status to awarded
      await supabase
        .from('projects')
        .update({
          status: 'awarded',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      toast.success('Proposal accepted successfully')
      
      // Refresh proposals
      const { data: updatedProposals } = await supabase
        .from('proposals')
        .select(`
          *,
          contractor_profile:users!proposals_contractor_fkey (
            id,
            full_name,
            email,
            phone_number,
            address
          )
        `)
        .eq('project', id)
        .eq('homeowner', user.id)
        .eq('is_deleted', 'no')
        .in('status', ['submitted', 'viewed', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
      
      setProposals(updatedProposals || [])
      
    } catch (error) {
      console.error('Error accepting proposal:', error)
      toast.error('Failed to accept proposal')
    } finally {
      setUpdatingProposal(null)
    }
  }

  const handleRejectProposal = async (proposalId: string, reason?: string, notes?: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to reject this proposal?')) {
      return
    }
    
    setUpdatingProposal(proposalId)
    
    try {
      const supabase = createClient()
      
      // First, mark the proposal as viewed (if not already)
      await supabase
        .from('proposals')
        .update({
          status: 'viewed',
          viewed_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('status', 'submitted')
      
      // Reject the proposal
      const { error: rejectError } = await supabase
        .from('proposals')
        .update({
          status: 'rejected',
          rejected_date: new Date().toISOString(),
          rejection_reason: reason || 'other',
          rejection_reason_notes: notes,
          last_updated: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', proposalId)
        .eq('homeowner', user.id)
      
      if (rejectError) {
        throw rejectError
      }
      
      toast.success('Proposal rejected successfully')
      
      // Refresh proposals
      const { data: updatedProposals } = await supabase
        .from('proposals')
        .select(`
          *,
          contractor_profile:users!proposals_contractor_fkey (
            id,
            full_name,
            email,
            phone_number,
            address
          )
        `)
        .eq('project', id)
        .eq('homeowner', user.id)
        .eq('is_deleted', 'no')
        .in('status', ['submitted', 'viewed', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
      
      setProposals(updatedProposals || [])
      
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      toast.error('Failed to reject proposal')
    } finally {
      setUpdatingProposal(null)
    }
  }

  const handleViewProposal = (proposalId: string) => {
    // Navigate to proposal detail view
    router.push(`/homeowner/proposals/${proposalId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          {error || 'Project not found'}
        </div>
        <div className="text-center mt-4">
          <button 
            onClick={() => router.push('/homeowner/projects')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  // Transform project data to match the expected interface
  const transformedProject = {
    ...project,
    start_date: new Date(project.start_date),
    end_date: new Date(project.end_date),
    expiry_date: new Date(project.expiry_date),
    decision_date: project.decision_date ? new Date(project.decision_date) : null,
    substantial_completion: project.substantial_completion ? new Date(project.substantial_completion) : null,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at)
  }

  // Transform proposals data to match the expected interface
  const transformedProposals = proposals.map(proposal => ({
    ...proposal,
    createdAt: new Date(proposal.created_at),
    updatedAt: new Date(proposal.updated_at),
    proposed_start_date: new Date(proposal.proposed_start_date),
    proposed_end_date: new Date(proposal.proposed_end_date),
    expiry_date: new Date(proposal.expiry_date),
    deposit_due_on: new Date(proposal.deposit_due_on),
    submitted_date: proposal.submitted_date ? new Date(proposal.submitted_date) : undefined,
    accepted_date: proposal.accepted_date ? new Date(proposal.accepted_date) : undefined,
    rejected_date: proposal.rejected_date ? new Date(proposal.rejected_date) : undefined,
    last_updated: new Date(proposal.updated_at)
  }))

  return (
    <ProjectView
      project={transformedProject}
      proposals={transformedProposals}
      user={user}
      userRole={USER_ROLES.HOMEOWNER}
      onEditProject={handleEditProject}
      onDeleteProject={handleDeleteProject}
      onAcceptProposal={handleAcceptProposal}
      onRejectProposal={handleRejectProposal}
      onViewProposal={handleViewProposal}
      loading={loading}
      proposalsLoading={proposalsLoading}
      updatingProposal={updatingProposal}
    />
  )
}
