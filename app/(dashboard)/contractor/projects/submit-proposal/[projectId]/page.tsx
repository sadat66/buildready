'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { proposalService } from '@/lib/services'
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
    // Core proposal fields
    title: '',
    description_of_work: '',
    
    // Financial fields
    subtotal_amount: '',
    tax_included: 'no' as 'yes' | 'no',
    total_amount: '',
    deposit_amount: '',
    deposit_due_on: '',
    
    // Timeline fields
    proposed_start_date: '',
    proposed_end_date: '',
    expiry_date: '',
    
    // Content and documentation
    clause_preview_html: '',
    attached_files: [] as File[],
    notes: '',
    
    // Visibility settings
    visibility_settings: 'private' as 'private' | 'public' | 'shared',
  })

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Project ID is required')
        setProjectLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        console.log('Fetching project with ID:', projectId)
        console.log('User authentication status:', { user: !!user, userRole, loading })
        
        // First, let's check if any projects exist at all
        const { data: allProjects, error: allProjectsError } = await supabase
          .from('projects')
          .select('id, project_title, status')
          .limit(5)
          
        console.log('All projects sample:', { allProjects, error: allProjectsError })
        
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`
            *,
            homeowner:users!creator(
              full_name
            )
          `)
          .eq('id', projectId)
          .in('status', ['Published', 'Bidding'])
          .single()
          
        console.log('Project fetch result:', { data, error: fetchError })
        
        if (fetchError) {
          console.error('Fetch error details:', fetchError)
          throw fetchError
        }
        
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
        setError(`Failed to load project details: ${error.message || 'Unknown error'}`)
      } finally {
        setProjectLoading(false)
      }
    }
    
    if (!loading && user && userRole === 'contractor') {
      fetchProject()
    } else if (!loading) {
      console.log('Not fetching project - authentication check failed:', { user: !!user, userRole, loading })
      setProjectLoading(false)
    }
  }, [projectId, user, userRole, loading])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value }
      
      // Auto-calculate total amount when subtotal changes or tax inclusion changes
      if (field === 'subtotal_amount' || field === 'tax_included') {
        const subtotal = field === 'subtotal_amount' ? parseFloat(value as string) || 0 : parseFloat(prev.subtotal_amount) || 0
        const taxIncluded = field === 'tax_included' ? value as string : prev.tax_included
        
        if (taxIncluded === 'yes') {
          // If tax is included, total = subtotal
          newFormData.total_amount = subtotal.toString()
        } else {
          // If tax is not included, add 13% HST (Ontario standard)
          const taxAmount = subtotal * 0.13
          newFormData.total_amount = (subtotal + taxAmount).toString()
        }
      }
      
      return newFormData
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, attached_files: [...prev.attached_files, ...files] }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attached_files: prev.attached_files.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    // Title validation
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return false
    }
    
    // Description validation
    if (!formData.description_of_work || formData.description_of_work.trim().length < 10) {
      setError('Description of work must be at least 10 characters')
      return false
    }
    
    // Amount validations
    const subtotalAmount = parseFloat(formData.subtotal_amount)
    const totalAmount = parseFloat(formData.total_amount)
    const depositAmount = parseFloat(formData.deposit_amount)
    
    if (!formData.subtotal_amount || isNaN(subtotalAmount) || subtotalAmount <= 0) {
      setError('Subtotal amount must be a positive number')
      return false
    }
    
    if (!formData.total_amount || isNaN(totalAmount) || totalAmount <= 0) {
      setError('Total amount must be a positive number')
      return false
    }
    
    if (!formData.deposit_amount || isNaN(depositAmount) || depositAmount <= 0) {
      setError('Deposit amount must be a positive number')
      return false
    }
    
    if (depositAmount > totalAmount) {
      setError('Deposit amount cannot exceed total amount')
      return false
    }
    
    // Date validations
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (!formData.deposit_due_on) {
      setError('Deposit due date is required')
      return false
    }
    
    const depositDueDate = new Date(formData.deposit_due_on)
    if (depositDueDate < today) {
      setError('Deposit due date cannot be in the past')
      return false
    }
    
    if (!formData.proposed_start_date || !formData.proposed_end_date) {
      setError('Start and end dates are required')
      return false
    }
    
    const startDate = new Date(formData.proposed_start_date)
    const endDate = new Date(formData.proposed_end_date)
    
    if (startDate < today) {
      setError('Proposed start date cannot be in the past')
      return false
    }
    
    if (endDate <= startDate) {
      setError('Proposed end date must be after start date')
      return false
    }
    
    if (!formData.expiry_date) {
      setError('Proposal expiry date is required')
      return false
    }
    
    const expiryDate = new Date(formData.expiry_date)
    if (expiryDate < today) {
      setError('Proposal expiry date cannot be in the past')
      return false
    }
    
    if (expiryDate > startDate) {
      setError('Proposal expiry date should be before the proposed start date')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || userRole !== 'contractor') {
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
      const fileReferences = formData.attached_files.map(file => ({
        id: crypto.randomUUID(),
        filename: file.name,
        url: `placeholder://${file.name}`, // Placeholder URL
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date()
      }))
      
      const proposalData = {
        title: formData.title,
        description_of_work: formData.description_of_work,
        project: projectId,
        contractor: user.id,
        homeowner: project?.creator || '',
        subtotal_amount: parseFloat(formData.subtotal_amount),
        tax_included: formData.tax_included ? 'yes' : 'no',
        total_amount: parseFloat(formData.total_amount),
        deposit_amount: parseFloat(formData.deposit_amount),
        deposit_due_on: new Date(formData.deposit_due_on),
        proposed_start_date: new Date(formData.proposed_start_date),
        proposed_end_date: new Date(formData.proposed_end_date),
        expiry_date: new Date(formData.expiry_date),
        clause_preview_html: formData.clause_preview_html || '',
        attached_files: fileReferences,
        notes: formData.notes || '',
        visibility_settings: formData.visibility_settings,
        created_by: user.id
      }
      
      console.log('Proposal data being submitted:', proposalData)
      
      const result = await proposalService.createProposal(proposalData, user.id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit proposal')
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

  if (!user || userRole !== 'contractor') {
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Proposal Information
            </CardTitle>
            <CardDescription>
              Provide basic information about your proposal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title for your proposal"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description_of_work">Description of Work</Label>
              <Textarea
                id="description_of_work"
                value={formData.description_of_work}
                onChange={(e) => handleInputChange('description_of_work', e.target.value)}
                placeholder="Provide a detailed description of the work you'll perform..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

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
                <Label htmlFor="subtotal_amount">Subtotal Amount ($)</Label>
                <Input
                  id="subtotal_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.subtotal_amount}
                  onChange={(e) => handleInputChange('subtotal_amount', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="tax_included"
                  checked={formData.tax_included === 'yes'}
                  onCheckedChange={(checked) => handleInputChange('tax_included', checked ? 'yes' : 'no')}
                />
                <Label htmlFor="tax_included">Tax Included in Subtotal</Label>
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
                <Label htmlFor="deposit_due_on">Deposit Due Date</Label>
                <Input
                  id="deposit_due_on"
                  type="date"
                  value={formData.deposit_due_on}
                  onChange={(e) => handleInputChange('deposit_due_on', e.target.value)}
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
              Specify your proposed project timeline and proposal validity
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
                <Label htmlFor="expiry_date">Proposal Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Date until which this proposal remains valid
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Details
            </CardTitle>
            <CardDescription>
              Provide additional information and contract preview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clause_preview_html">Contract Clause Preview</Label>
              <Textarea
                id="clause_preview_html"
                value={formData.clause_preview_html}
                onChange={(e) => handleInputChange('clause_preview_html', e.target.value)}
                placeholder="Enter key contract clauses or terms that will be included in the agreement..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be displayed to the homeowner as a preview of contract terms
              </p>
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information, special considerations, or clarifications..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="visibility_settings">Proposal Visibility</Label>
              <select
                id="visibility_settings"
                value={formData.visibility_settings}
                onChange={(e) => handleInputChange('visibility_settings', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="private">Private (Only visible to homeowner)</option>
                <option value="shared">Shared (Visible to project stakeholders)</option>
                <option value="public">Public (Visible in portfolio)</option>
              </select>
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
            
            {formData.attached_files.length > 0 && (
              <div className="space-y-2">
                <Label>Attached Files:</Label>
                {formData.attached_files.map((file, index) => (
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
