'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Breadcrumbs } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Building, 
  User, 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText, 
  MapPin, 
  Award, 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Shield, 
  CalendarDays, 
  Clock3, 
  Building2, 
  UserCheck, 
  Clock4,
  CheckCircle,
  AlertTriangle,
  Info,
  Edit,
  FileText as FileTextIcon,
  Download as DownloadIcon,
  Building as BuildingIcon
} from 'lucide-react'
import { PROJECT_STATUSES, PROPOSAL_STATUSES, USER_ROLES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { getProjectStatusConfig } from '@/lib/helpers'
import { createClient } from '@/lib/supabase'

interface ContractorProposalData {
  id: string
  title: string
  description_of_work: string
  subtotal_amount: number | null
  tax_included: 'yes' | 'no'
  total_amount: number | null
  deposit_amount: number | null
  deposit_due_on: string | null
  proposed_start_date: string | null
  proposed_end_date: string | null
  expiry_date: string | null
  status: string
  is_selected: 'yes' | 'no'
  submitted_date: string | null
  accepted_date: string | null
  rejected_date: string | null
  withdrawn_date: string | null
  viewed_date: string | null
  last_updated: string
  rejected_by: string | null
  rejection_reason: string | null
  rejection_reason_notes: string | null
  clause_preview_html: string | null
  attached_files: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: string
  }>
  notes: string | null
  visibility_settings: string
  project: string
  contractor: string
  homeowner: string
  project_details?: {
    id: string
    project_title: string
    statement_of_work: string
    category: string[] | string
    location: any
    status: string
    budget: number | null
    start_date: string | null
    end_date: string | null
    permit_required: boolean
    creator: string
  }
  homeowner_details?: {
    id: string
    full_name: string
    email: string
    phone_number?: string
    address?: any
  }
}

export default function ContractorProposalViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, userRole } = useAuth()
  const [proposal, setProposal] = useState<ContractorProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const proposalId = resolvedParams.id

  useEffect(() => {
    if (!user) return

    const fetchProposal = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

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
              start_date,
              end_date,
              permit_required,
              creator
            )
          `)
          .eq('id', proposalId)
          .eq('contractor', user.id)
          .eq('is_deleted', 'no')
          .single()

        if (fetchError) {
          console.error('Error fetching proposal:', fetchError)
          setError(fetchError.message)
          return
        }

        // Manually fetch homeowner details
        let homeowner_details = null
        if (data.homeowner) {
          const { data: homeownerData, error: homeownerError } = await supabase
            .from('users')
            .select('id, full_name, email, phone_number, address')
            .eq('id', data.homeowner)
            .single()
          
          if (!homeownerError && homeownerData) {
            homeowner_details = homeownerData
          }
        }

        // Transform the data to match our ContractorProposalData interface
        const transformedData: ContractorProposalData = {
          ...data,
          project_details: data.project,
          homeowner_details
        }

        setProposal(transformedData)
      } catch (err) {
        setError('Failed to fetch proposal details')
        console.error('Error fetching proposal:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [user, proposalId])

  const getStatusConfig = (status: string) => {
    const statusConfigs: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
      [PROPOSAL_STATUSES.SUBMITTED]: { 
        label: 'Submitted', 
        icon: FileText, 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50' 
      },
      [PROPOSAL_STATUSES.ACCEPTED]: { 
        label: 'Accepted', 
        icon: CheckCircle2, 
        color: 'text-green-700', 
        bgColor: 'bg-green-50' 
      },
      [PROPOSAL_STATUSES.REJECTED]: { 
        label: 'Rejected', 
        icon: XCircle, 
        color: 'text-red-700', 
        bgColor: 'bg-red-50' 
      },
      [PROPOSAL_STATUSES.WITHDRAWN]: { 
        label: 'Withdrawn', 
        icon: AlertCircle, 
        color: 'text-gray-700', 
        bgColor: 'bg-gray-50' 
      },
      'viewed': { 
        label: 'Viewed', 
        icon: Eye, 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-50' 
      },
      'draft': { 
        label: 'Draft', 
        icon: FileText, 
        color: 'text-gray-700', 
        bgColor: 'bg-gray-50' 
      }
    }
    return statusConfigs[status] || statusConfigs[PROPOSAL_STATUSES.SUBMITTED]
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleEditProposal = () => {
    if (proposal) {
      router.push(`/contractor/projects/submit-proposal/${proposal.project}?edit=${proposal.id}`)
    }
  }



  const handleViewProject = () => {
    if (proposal?.project_details?.id) {
      router.push(`/contractor/projects/view/${proposal.project_details.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading proposal details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Proposal</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Proposal Not Found</h2>
          <p className="text-gray-600 mb-4">The requested proposal could not be found.</p>
          <Button onClick={() => router.push('/contractor/proposals')}>View All Proposals</Button>
        </div>
      </div>
    )
  }

  if (userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this proposal.</p>
        </div>
      </div>
    )
  }

  const proposalStatusConfig = getStatusConfig(proposal.status)
  const projectStatusConfig = proposal.project_details ? getProjectStatusConfig(proposal.project_details.status) : null
  const StatusIcon = proposalStatusConfig.icon

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/contractor/dashboard' },
              { label: 'Proposals', href: '/contractor/proposals' },
              { label: `Proposal #${proposal.id.slice(-8)}`, href: '#' }
            ]}
          />
        </div>

        {/* Proposal Header */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${proposalStatusConfig.bgColor}`}>
                  <StatusIcon className={`h-5 w-5 ${proposalStatusConfig.color}`} />
                </div>
                <Badge className={`${proposalStatusConfig.bgColor} ${proposalStatusConfig.color} border-0`}>
                  {proposalStatusConfig.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  Submitted {formatDate(proposal.submitted_date)}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {proposal.title || 'Proposal Details'}
              </h1>
              <p className="text-gray-600 text-lg">
                For project: {proposal.project_details?.project_title || 'Unknown Project'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {proposal.status === 'draft' && (
                <Button 
                  onClick={handleEditProposal}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Proposal
                </Button>
              )}
              
              <Button 
                onClick={handleViewProject}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Project
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Proposal & Project Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Financial Summary</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Your Proposal</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(proposal.total_amount || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Project Budget</p>
                  <p className="text-2xl font-semibold text-gray-700">
                    {proposal.project_details?.budget ? formatCurrency(proposal.project_details.budget) : 'Not specified'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Deposit Required</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(proposal.deposit_amount || 0)}</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="ml-2 font-semibold">{formatCurrency(proposal.subtotal_amount || 0)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tax Included:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {proposal.tax_included === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Work Description</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {proposal.description_of_work}
              </p>
              
              {proposal.notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Additional Notes
                  </h4>
                  <p className="text-blue-800">{proposal.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Timeline Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CalendarDays className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Proposed Start</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(proposal.proposed_start_date)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Proposed End</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(proposal.proposed_end_date)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Timer className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Proposal Expires</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(proposal.expiry_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Terms Preview */}
            {proposal.clause_preview_html && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <FileTextIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Contract Terms Preview</h2>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-indigo-800 leading-relaxed">
                    {proposal.clause_preview_html}
                  </p>
                </div>
              </div>
            )}

                          {/* Attached Files */}
              {proposal.attached_files && proposal.attached_files.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <DownloadIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Supporting Documents</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proposal.attached_files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileTextIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{file.filename}</p>
                            {file.size && (
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">File attached</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Project Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BuildingIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Project Summary</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">
                        {Array.isArray(proposal.project_details?.category) 
                          ? proposal.project_details.category.join(', ')
                          : proposal.project_details?.category || 'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">
                        {proposal.project_details?.budget ? formatCurrency(proposal.project_details.budget) : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Permit Required:</span>
                      <span className="font-medium">
                        {proposal.project_details?.permit_required ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleViewProject}
                  variant="outline" 
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Project
                </Button>
              </div>
            </div>

            {/* Proposal Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Proposal Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <Badge className={`${proposalStatusConfig.bgColor} ${proposalStatusConfig.color} border-0`}>
                      {proposalStatusConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <p className="font-medium">{formatDate(proposal.submitted_date)}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <p className="font-medium">{formatDate(proposal.last_updated)}</p>
                    </div>
                    
                    {proposal.viewed_date && (
                      <div>
                        <span className="text-gray-600">Viewed:</span>
                        <p className="font-medium">{formatDate(proposal.viewed_date)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Homeowner Information */}
            {proposal.homeowner_details && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Homeowner</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      {proposal.homeowner_details.full_name}
                    </h4>
                    {proposal.homeowner_details.email && (
                      <p className="text-sm text-gray-600">{proposal.homeowner_details.email}</p>
                    )}
                  </div>
                  
                  {/* Contact & Actions - Hidden/Commented as requested */}
                  {/* 
                  <div className="space-y-3">
                    <Button 
                      onClick={handleContactHomeowner}
                      variant="outline" 
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Homeowner
                    </Button>
                    
                    {proposal.homeowner_details.phone_number && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                      >
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        Call Homeowner
                      </Button>
                    )}
                  </div>
                  */}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
              </div>
              
              <div className="space-y-3">
                {proposal.status === 'draft' && (
                  <Button 
                    onClick={handleEditProposal}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Proposal
                  </Button>
                )}
                
                <Button 
                  onClick={handleViewProject}
                  variant="outline" 
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Project
                </Button>
                
                <Button 
                  onClick={() => router.push('/contractor/proposals')}
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Proposals
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}