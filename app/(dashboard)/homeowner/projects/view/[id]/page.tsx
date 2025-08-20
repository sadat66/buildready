'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { HomeownerProjectView } from '@/components/features/projects'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { USER_ROLES } from '@/lib/constants'
import { Project } from '@/types/database/projects'
import { Proposal } from '@/types/database/proposals'
import { User } from '@/types/database/auth'

export default function HomeownerProjectViewPage() {
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
    const fetchHomeownerProject = async () => {
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
        
        if (data) {
          // Transform the data to match the expected Project interface
          const transformedProject: Project = {
            ...data,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
            expiry_date: new Date(data.expiry_date),
            decision_date: data.decision_date ? new Date(data.decision_date) : undefined,
            substantial_completion: data.substantial_completion ? new Date(data.substantial_completion) : undefined,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
            // Ensure required fields are present with defaults if missing
            project_photos: data.project_photos || [],
            files: data.files || [],
            proposal_count: data.proposal_count || 0,
            is_verified_project: data.is_verified_project || false,
            permit_required: data.permit_required || false
          }
          setProject(transformedProject)
        }
      } catch (error) {
        console.error('Error fetching homeowner project:', error)
        setError('Failed to load your project details')
      } finally {
        setLoading(false)
      }
    }
    
    const fetchHomeownerProposals = async () => {
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
        
        if (data) {
          // Transform the data to match the expected Proposal interface
          const transformedProposals: Proposal[] = data.map(proposal => ({
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
            withdrawn_date: proposal.withdrawn_date ? new Date(proposal.withdrawn_date) : undefined,
            viewed_date: proposal.viewed_date ? new Date(proposal.viewed_date) : undefined,
            last_updated: new Date(proposal.updated_at),
            // Ensure required fields are present with defaults if missing
            attached_files: proposal.attached_files || [],
            proposals: proposal.proposals || [],
            visibility_settings: proposal.visibility_settings || 'private',
            created_by: proposal.created_by || proposal.contractor,
            last_modified_by: proposal.last_modified_by || proposal.contractor
          }))
          setProposals(transformedProposals)
        }
      } catch (error) {
        console.error('Error fetching homeowner proposals:', error)
      } finally {
        setProposalsLoading(false)
      }
    }
    
    fetchHomeownerProject()
    fetchHomeownerProposals()
  }, [id, user])

  const handleEditHomeownerProject = () => {
    if (project) {
      router.push(`/homeowner/projects/edit/${project.id}`)
    }
  }

  const handleDeleteHomeownerProject = async () => {
    if (!project || !user) return
    
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone and will remove all associated proposals.')) {
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
      
      toast.success('Your project has been deleted successfully')
      router.push('/homeowner/projects')
    } catch (error) {
      console.error('Error deleting homeowner project:', error)
      toast.error('Failed to delete your project')
    } finally {
      setDeleting(false)
    }
  }

  const handleAcceptContractorProposal = async (proposalId: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to accept this contractor\'s proposal? This will automatically reject all other proposals for this project.')) {
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
          rejection_reason_notes: 'Another proposal was selected by the homeowner',
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
      
      toast.success('Contractor proposal accepted successfully! Your project is now awarded.')
      
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
      
      if (updatedProposals) {
        const transformedProposals: Proposal[] = updatedProposals.map(proposal => ({
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
          withdrawn_date: proposal.withdrawn_date ? new Date(proposal.withdrawn_date) : undefined,
          viewed_date: proposal.viewed_date ? new Date(proposal.viewed_date) : undefined,
          last_updated: new Date(proposal.updated_at),
          attached_files: proposal.attached_files || [],
          proposals: proposal.proposals || [],
          visibility_settings: proposal.visibility_settings || 'private',
          created_by: proposal.created_by || proposal.contractor,
          last_modified_by: proposal.last_modified_by || proposal.contractor
        }))
        setProposals(transformedProposals)
      }
      
    } catch (error) {
      console.error('Error accepting contractor proposal:', error)
      toast.error('Failed to accept the contractor proposal')
    } finally {
      setUpdatingProposal(null)
    }
  }

  const handleRejectContractorProposal = async (proposalId: string, reason?: string, notes?: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to reject this contractor\'s proposal?')) {
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
      
      toast.success('Contractor proposal rejected successfully')
      
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
      
      if (updatedProposals) {
        const transformedProposals: Proposal[] = updatedProposals.map(proposal => ({
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
          withdrawn_date: proposal.withdrawn_date ? new Date(proposal.withdrawn_date) : undefined,
          viewed_date: proposal.viewed_date ? new Date(proposal.viewed_date) : undefined,
          last_updated: new Date(proposal.updated_at),
          attached_files: proposal.attached_files || [],
          proposals: proposal.proposals || [],
          visibility_settings: proposal.visibility_settings || 'private',
          created_by: proposal.created_by || proposal.contractor,
          last_modified_by: proposal.last_modified_by || proposal.contractor
        }))
        setProposals(transformedProposals)
      }
      
    } catch (error) {
      console.error('Error rejecting contractor proposal:', error)
      toast.error('Failed to reject the contractor proposal')
    } finally {
      setUpdatingProposal(null)
    }
  }

  const handleViewContractorProposal = (proposalId: string) => {
    // Navigate to proposal detail view for homeowner
    router.push(`/homeowner/proposals/${proposalId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          {error || 'Project not found or you don\'t have access to view it'}
        </div>
        <div className="text-center mt-4">
          <button 
            onClick={() => router.push('/homeowner/projects')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Your Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <HomeownerProjectView
      project={project} 
      proposals={proposals}
      user={user as unknown as User}
      userRole={USER_ROLES.HOMEOWNER}
      onEditProject={handleEditHomeownerProject}
      onDeleteProject={handleDeleteHomeownerProject}
      onAcceptProposal={handleAcceptContractorProposal}
      onRejectProposal={handleRejectContractorProposal}
      onViewProposal={handleViewContractorProposal}
      loading={loading}
      proposalsLoading={proposalsLoading}
      updatingProposal={updatingProposal}
    />
  )
}
