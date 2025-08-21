'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { USER_ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Calendar, DollarSign, Building, User, FileText, Clock, Eye, Briefcase } from 'lucide-react'
import { Project } from '@/types'
import { PaymentModal } from '@/components/shared/modals'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const { user, userRole, loading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !user) {
        setProjectLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`
            *,
            homeowner:users!creator(
              full_name,
              first_name,
              last_name,
              email
            )
          `)
          .eq('id', projectId)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project details')
      } finally {
        setProjectLoading(false)
      }
    }
    
    if (!loading && user && userRole === USER_ROLES.CONTRACTOR) {
      fetchProject()
    }
  }, [projectId, user, userRole, loading])

  // Handle payment success
  const handlePaymentSuccess = () => {
    setHasPaid(true)
    setShowPaymentModal(false)
    toast.success('Payment successful! You can now submit your proposal.')
    
    if (project) {
      router.push(`/contractor/projects/submit-proposal/${project.id}`)
    }
  }

  // Handle submit proposal click
  const handleSubmitProposal = () => {
    if (!hasPaid) {
      setShowPaymentModal(true)
    } else {
      router.push(`/contractor/projects/submit-proposal/${project?.id}`)
    }
  }

  if (loading || projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-slate-600 font-medium">Loading project details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-red-600 font-medium">{error}</div>
      </div>
    )
  }

  if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-slate-600 font-medium">Access denied. Only contractors can view project details.</div>
      </div>
    )
  }

  // Check if contractor has paid before allowing access to project details
  if (!hasPaid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-xl font-semibold text-slate-800">Payment Required</div>
          <p className="text-slate-600 leading-relaxed">You need to pay $9.99 to access project details and submit proposals.</p>
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 h-auto font-medium"
          >
            Pay $9.99 to Continue
          </Button>
          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
                     <PaymentModal
             isOpen={showPaymentModal}
             onClose={() => setShowPaymentModal(false)}
             onPaymentSuccess={() => {
               setHasPaid(true)
               setShowPaymentModal(false)
               toast.success('Payment successful! You can now access project details.')
             }}
             userType="contractor"
             projectTitle={project?.project_title}
           />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg text-slate-600 font-medium">Project not found.</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                      {project.project_title}
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                      Project Details
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitProposal}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 h-auto font-medium shadow-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Submit Proposal
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Project Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Description */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    Project Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed text-base">
                    {project.statement_of_work}
                  </p>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Budget</p>
                        <p className="text-lg font-semibold text-slate-900">{formatCurrency(project.budget)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Deadline</p>
                        <p className="text-lg font-semibold text-slate-900">{formatDate(project.expiry_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Timeline</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {project.start_date && project.end_date 
                            ? `${formatDate(project.start_date)} - ${formatDate(project.end_date)}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Project Type</p>
                        <p className="text-lg font-semibold text-slate-900 capitalize">
                          {project.project_type || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              {project.location && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-slate-800">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-slate-600" />
                      </div>
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-slate-700 font-medium">
                        {[project.location.address, project.location.city, project.location.province]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {project.location.postalCode && (
                        <p className="text-slate-500 text-sm mt-2">
                          Postal Code: {project.location.postalCode}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Information */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800">Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 font-medium mb-2">Permit Required</p>
                      <Badge 
                        variant={project.permit_required ? "default" : "secondary"}
                        className={project.permit_required ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : "bg-slate-100 text-slate-800"}
                      >
                        {project.permit_required ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 font-medium mb-2">Verified Project</p>
                      <Badge 
                        variant={project.is_verified_project ? "default" : "secondary"}
                        className={project.is_verified_project ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-slate-100 text-slate-800"}
                      >
                        {project.is_verified_project ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status and Category */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800">Project Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-3">Status</p>
                    <Badge 
                      variant="default" 
                      className="capitalize bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-1.5 text-sm font-medium"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-3">Category</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(project.category) ? (
                        project.category.map((cat, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="capitalize border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            {cat}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="border-slate-200 text-slate-700">Not specified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Homeowner Information */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    Homeowner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 font-medium mb-2">Posted by</p>
                    <p className="text-slate-900 font-semibold">
                      {project.homeowner ? 
                        (() => {
                          const homeowner = project.homeowner as { first_name?: string; last_name?: string; full_name?: string }
                          if (homeowner.first_name && homeowner.last_name) {
                            return `${homeowner.first_name} ${homeowner.last_name}`.trim()
                          } else if (homeowner.full_name) {
                            return homeowner.full_name
                          } else {
                            return 'Unknown'
                          }
                        })()
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Timeline */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 font-medium mb-2">Created</p>
                    <p className="text-slate-900 font-semibold">{formatDate(project.created_at)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 font-medium mb-2">Last Updated</p>
                    <p className="text-slate-900 font-semibold">{formatDate(project.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
             {/* Payment Modal */}
       <PaymentModal
         isOpen={showPaymentModal}
         onClose={() => setShowPaymentModal(false)}
         onPaymentSuccess={handlePaymentSuccess}
         userType="contractor"
         projectTitle={project?.project_title}
       />
    </div>
  )
}
