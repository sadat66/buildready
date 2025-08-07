'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Project } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, DollarSign, Calendar, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'

export default function SubmitProposalPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    bid_amount: '',
    description: '',
    timeline: ''
  })

    useEffect(() => {
    console.log('SubmitProposalPage useEffect triggered:', { projectId, profileRole: profile?.role, authLoading })
    
    // Don't proceed if auth is still loading
    if (authLoading) {
      console.log('Auth still loading, skipping fetch')
      return
    }
    
    // Reset states when projectId changes
    setLoading(true)
    setError('')
    setProject(null)

    // Redirect if not contractor
    if (profile?.role !== 'contractor') {
      router.push('/dashboard')
      return
    }

    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            homeowner:users!projects_homeowner_id_fkey(*)
          `)
          .eq('id', projectId)
          .single()

        if (error) throw error

        if (data.status !== 'open') {
          setError('This project is no longer accepting proposals')
          return
        }

        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      console.log('Fetching project for proposal submission, projectId:', projectId)
      fetchProject()
    } else {
      console.log('No projectId, setting loading to false')
      setLoading(false)
    }
  }, [projectId, profile?.role, router, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!profile) {
        setError('User profile not found')
        return
      }

      // Validate bid amount
      const bidAmount = parseFloat(formData.bid_amount)
      const minBid = Math.max(1, project?.budget_min || 0)
      const maxBid = Math.max(minBid + 1, (project?.budget_max || 0) * 1.5)

      if (isNaN(bidAmount) || bidAmount < minBid || bidAmount > maxBid) {
        setError(`Bid amount must be between ${formatCurrency(minBid)} and ${formatCurrency(maxBid)}`)
        return
      }

      // Check if contractor already submitted a proposal for this project
      const { data: existingProposal } = await supabase
        .from('proposals')
        .select('id')
        .eq('project_id', projectId)
        .eq('contractor_id', profile.id)
        .single()

      if (existingProposal) {
        setError('You have already submitted a proposal for this project')
        return
      }

      const { error } = await supabase
        .from('proposals')
        .insert([
          {
            project_id: projectId,
            contractor_id: profile.id,
            bid_amount: bidAmount,
            description: formData.description,
            timeline: formData.timeline,
            status: 'pending'
          }
        ])

      if (error) throw error

      router.push('/dashboard/proposals')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Show loading if auth is still loading or if we're loading project data
  if (authLoading || loading) {
    console.log('Rendering loading state for proposal submission:', projectId, { authLoading, loading })
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
    <div key={projectId} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Proposal</h1>
          <p className="text-gray-600 mt-2">
            Submit your proposal for: {project.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {project.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget: {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Category: {project.category}
                </div>
                {project.deadline && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Homeowner</h4>
                <p className="text-sm text-gray-600">{project.homeowner?.full_name}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Proposal</CardTitle>
              <CardDescription>
                Provide detailed information about your bid and approach to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="bid_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Amount ($) *
                  </label>
                  <Input
                    id="bid_amount"
                    name="bid_amount"
                    type="number"
                    required
                    min={Math.max(1, project.budget_min)}
                    max={Math.max(project.budget_min + 1, project.budget_max * 1.5)}
                    step="0.01"
                    value={formData.bid_amount}
                    onChange={handleChange}
                    placeholder="Enter your bid amount"
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Project budget: {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)} | 
                    Valid bid range: {formatCurrency(Math.max(1, project.budget_min))} - {formatCurrency(Math.max(project.budget_min + 1, project.budget_max * 1.5))}
                  </p>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Timeline *
                  </label>
                  <Input
                    id="timeline"
                    name="timeline"
                    type="text"
                    required
                    value={formData.timeline}
                    onChange={handleChange}
                    placeholder="e.g., 4-6 weeks, 2-3 months"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Proposal Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                                         placeholder="Describe your approach to this project, your experience with similar projects, materials you&apos;ll use, and any other relevant details..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                                     <p className="text-sm text-gray-500 mt-1">
                     Be detailed and specific about your approach, experience, and what&apos;s included in your bid.
                   </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {submitting ? 'Submitting Proposal...' : 'Submit Proposal'}
                  </Button>
                  <Link href="/dashboard/projects">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 