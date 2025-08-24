'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ContractorProjectView } from '@/components/features/projects'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'
import { Project } from '@/types/database/projects'
import { User } from '@/types/database/auth'

export default function ContractorProjectViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchContractorProject = async () => {
      if (!id || !user) {
        setLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`
            *,
            homeowner:users!projects_creator_fkey (
              id,
              full_name,
              email,
              phone_number,
              address
            )
          `)
          .eq('id', id)
          .eq('status', PROJECT_STATUSES.OPEN_FOR_PROPOSALS)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        if (data) {
          // Transform the data to match the expected Project interface
          const transformedProject: Project = {
            ...data,
            start_date: data.start_date ? new Date(data.start_date) : undefined,
            end_date: data.end_date ? new Date(data.end_date) : undefined,
            expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
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
        console.error('Error fetching contractor project:', error)
        setError('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchContractorProject()
  }, [id, user])

  const handleSubmitProposal = () => {
    if (project) {
      router.push(`/contractor/projects/submit-proposal/${project.id}`)
    }
  }

  const handleContactHomeowner = () => {
    // TODO: Implement contact functionality
    console.log('Contact homeowner')
    toast.success('Contact functionality coming soon')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project details...</p>
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
            onClick={() => router.push('/contractor/projects')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <ContractorProjectView
      project={project}
      user={user as unknown as User}
      userRole={USER_ROLES.CONTRACTOR}
      onSubmitProposal={handleSubmitProposal}
      onContactHomeowner={handleContactHomeowner}
      loading={loading}
    />
  )
}
