'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { USER_ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar, DollarSign, FileText, AlertTriangle, Upload, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SubmitProposalPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [projectLoading, setProjectLoading] = useState(true)
  const [error, setError] = useState('')

  
  // Form state
  const [formData, setFormData] = useState({
    // Financial details
    net_amount: '',
    tax_amount: '',
    total_amount: '',
    deposit_amount: '',
    deposit_due_date: '',
    
    // Timeline details
    proposed_start_date: '',
    proposed_end_date: '',
    estimated_days: '',
    
    // Penalties
    delay_penalty: '',
    abandonment_penalty: '',
    
    // Description and additional info
    description: '',
    timeline: '',
    materials_included: false,
    warranty_period: '',
    additional_notes: '',
    
    // Files
    uploaded_files: [] as File[],
  })

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return
      
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`
            *,
            homeowner:users!creator(
              full_name
            )
          `)
          .eq('id', projectId)
          .eq('status', 'open')
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

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value }
      
      // Auto-calculate total amount when net or tax amounts change
      if (field === 'net_amount' || field === 'tax_amount') {
        const netAmount = field === 'net_amount' ? parseFloat(value as string) || 0 : parseFloat(prev.net_amount) || 0
        const taxAmount = field === 'tax_amount' ? parseFloat(value as string) || 0 : parseFloat(prev.tax_amount) || 0
        newFormData.total_amount = (netAmount + taxAmount).toString()
      }
      
      // Auto-calculate estimated days when dates change
      if (field === 'proposed_start_date' || field === 'proposed_end_date') {
        const startDate = field === 'proposed_start_date' ? value as string : prev.proposed_start_date
        const endDate = field === 'proposed_end_date' ? value as string : prev.proposed_end_date
        
        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          newFormData.estimated_days = days.toString()
        }
      }
      
      return newFormData
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, uploaded_files: [...prev.uploaded_files, ...files] }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploaded_files: prev.uploaded_files.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.net_amount || !formData.tax_amount || !formData.total_amount) {
      setError('All financial amounts are required')
      return false
    }
    
    if (!formData.proposed_start_date || !formData.proposed_end_date) {
      setError('Start and end dates are required')
      return false
    }
    
    if (!formData.description || formData.description.length < 10) {
      setError('Description must be at least 10 characters')
      return false
    }
    
    if (!formData.timeline) {
      setError('Timeline is required')
      return false
    }
    
    if (!formData.deposit_due_date) {
      setError('Deposit due date is required')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || userRole !== USER_ROLES.CONTRACTOR) {
      setError('Only contractors can submit proposals')
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      // For now, we'll store file names as placeholders
      // In a real implementation, you'd upload files to storage first
      const fileUrls = formData.uploaded_files.map(file => file.name)
      
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('proposals')
        .insert({
          project_id: projectId,
          contractor_id: user.id,
          net_amount: parseFloat(formData.net_amount),
          tax_amount: parseFloat(formData.tax_amount),
          total_amount: parseFloat(formData.total_amount),
          deposit_amount: parseFloat(formData.deposit_amount),
          deposit_due_date: formData.deposit_due_date,
          proposed_start_date: formData.proposed_start_date,
          proposed_end_date: formData.proposed_end_date,
          estimated_days: parseInt(formData.estimated_days),
          delay_penalty: parseFloat(formData.delay_penalty) || 0,
          abandonment_penalty: parseFloat(formData.abandonment_penalty) || 0,
          description: formData.description,
          timeline: formData.timeline,
          materials_included: formData.materials_included,
          warranty_period: formData.warranty_period || null,
          additional_notes: formData.additional_notes || null,
          uploaded_files: fileUrls,
          status: 'pending'
        })
      
      if (insertError) {
        throw insertError
      }
      
      toast.success("Your proposal has been submitted successfully. The homeowner will review it and get back to you.")
      
      router.push('/contractor/proposals')
    } catch (error) {
      console.error('Error submitting proposal:', error)
      setError('Failed to submit proposal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

      if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Access denied. Only contractors can submit proposals.</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Project not found or no longer accepting proposals.</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Proposal</h1>
          <p className="text-gray-600 mt-2">
            Submit your detailed proposal for: <span className="font-semibold">{project.project_title}</span>
          </p>
        </div>
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Category</Label>
              <p className="text-sm">{Array.isArray(project.category) ? project.category.join(', ') : 'Not specified'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Location</Label>
              <p className="text-sm">{project.location?.address || 'Not specified'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Budget Range</Label>
              <p className="text-sm">${project.budget.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Proposal Deadline</Label>
              <p className="text-sm">{new Date(project.expiry_date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-600">Description</Label>
            <p className="text-sm text-gray-700 mt-1">{project.statement_of_work}</p>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </CardTitle>
            <CardDescription>
              Provide detailed cost breakdown for the project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="net_amount">Net Amount ($)</Label>
                <Input
                  id="net_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.net_amount}
                  onChange={(e) => handleInputChange('net_amount', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tax_amount">Tax Amount ($)</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax_amount}
                  onChange={(e) => handleInputChange('tax_amount', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_amount">Total Amount ($)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_amount}
                  onChange={(e) => handleInputChange('total_amount', e.target.value)}
                  placeholder="0.00"
                  required
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deposit_amount">Deposit Amount ($)</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deposit_amount}
                  onChange={(e) => handleInputChange('deposit_amount', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="deposit_due_date">Deposit Due Date</Label>
                <Input
                  id="deposit_due_date"
                  type="date"
                  value={formData.deposit_due_date}
                  onChange={(e) => handleInputChange('deposit_due_date', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Details
            </CardTitle>
            <CardDescription>
              Specify your proposed project timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="proposed_start_date">Proposed Start Date</Label>
                <Input
                  id="proposed_start_date"
                  type="date"
                  value={formData.proposed_start_date}
                  onChange={(e) => handleInputChange('proposed_start_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="proposed_end_date">Proposed End Date</Label>
                <Input
                  id="proposed_end_date"
                  type="date"
                  value={formData.proposed_end_date}
                  onChange={(e) => handleInputChange('proposed_end_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="estimated_days">Estimated Days</Label>
                <Input
                  id="estimated_days"
                  type="number"
                  min="1"
                  value={formData.estimated_days}
                  onChange={(e) => handleInputChange('estimated_days', e.target.value)}
                  placeholder="0"
                  required
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Penalties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Penalties & Guarantees
            </CardTitle>
            <CardDescription>
              Specify penalties for delays or project abandonment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delay_penalty">Delay Penalty ($/day)</Label>
                <Input
                  id="delay_penalty"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delay_penalty}
                  onChange={(e) => handleInputChange('delay_penalty', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="abandonment_penalty">Abandonment Penalty ($)</Label>
                <Input
                  id="abandonment_penalty"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.abandonment_penalty}
                  onChange={(e) => handleInputChange('abandonment_penalty', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Details
            </CardTitle>
            <CardDescription>
              Provide detailed description and timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of how you'll approach this project, materials you'll use, and your methodology..."
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="timeline">Project Timeline</Label>
              <Textarea
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                placeholder="Describe the project phases, milestones, and timeline breakdown..."
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="materials_included"
                  checked={formData.materials_included}
                  onCheckedChange={(checked) => handleInputChange('materials_included', checked)}
                />
                <Label htmlFor="materials_included">Materials Included in Price</Label>
              </div>
              
              <div>
                <Label htmlFor="warranty_period">Warranty Period</Label>
                <Input
                  id="warranty_period"
                  value={formData.warranty_period}
                  onChange={(e) => handleInputChange('warranty_period', e.target.value)}
                  placeholder="e.g., 1 year, 2 years"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                placeholder="Any additional information, special considerations, or clarifications..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Supporting Documents
            </CardTitle>
            <CardDescription>
              Upload relevant files, plans, or documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file_upload">Upload Files</Label>
              <Input
                id="file_upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.skp"
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: PDF, DOC, DOCX, JPG, PNG, DWG, SKP
              </p>
            </div>
            
            {formData.uploaded_files.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files:</Label>
                {formData.uploaded_files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="min-w-[120px]"
          >
            {submitting ? 'Submitting...' : 'Submit Proposal'}
          </Button>
        </div>
      </form>
    </div>
  )
}
