'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Upload, MapPin, Calendar, DollarSign, FileText, Camera, Paperclip } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const tradeCategories = [
  'kitchen',
  'bathroom',
  'deck',
  'roofing',
  'flooring',
  'painting',
  'electrical',
  'plumbing',
  'hvac',
  'landscaping',
  'general_construction',
  'other'
]

export default function CreateProjectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget_min: '',
    budget_max: '',
    proposal_deadline: '',
    preferred_start_date: '',
    preferred_end_date: '',
    decision_date: '',
    permit_required: false,
    site_photos: [] as File[],
    project_files: [] as File[]
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: 'site_photos' | 'project_files', files: FileList | null) => {
    if (files) {
      setFormData(prev => ({ ...prev, [field]: Array.from(files) }))
    }
  }

  const validateForm = () => {
    const required = [
      'title', 'description', 'category', 'location', 
      'budget_min', 'budget_max', 'proposal_deadline',
      'preferred_start_date', 'preferred_end_date', 'decision_date'
    ]
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.replace('_', ' ')} is required`)
        return false
      }
    }
    
    if (formData.site_photos.length === 0) {
      setError('At least one site photo is required')
      return false
    }
    
    if (parseFloat(formData.budget_min) >= parseFloat(formData.budget_max)) {
      setError('Maximum budget must be greater than minimum budget')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || (user.user_metadata?.role || 'homeowner') !== 'homeowner') {
      setError('Only homeowners can create projects')
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const supabase = createClient()
      
      // For now, we'll store file names as placeholders
      // In a real implementation, you'd upload files to storage first
      const sitePhotoUrls = formData.site_photos.map(file => file.name)
      const projectFileUrls = formData.project_files.map(file => file.name)
      
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          homeowner_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          budget_min: parseFloat(formData.budget_min),
          budget_max: parseFloat(formData.budget_max),
          proposal_deadline: formData.proposal_deadline,
          preferred_start_date: formData.preferred_start_date,
          preferred_end_date: formData.preferred_end_date,
          decision_date: formData.decision_date,
          permit_required: formData.permit_required,
          site_photos: sitePhotoUrls,
          project_files: projectFileUrls,
          is_closed: false,
          status: 'open'
        })
        .select()
        .single()
      
      if (insertError) {
        throw insertError
      }
      
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <FileText className="h-6 w-6" />
            <span>Post a Project</span>
          </CardTitle>
          <CardDescription>
            Create a detailed project request to attract quality contractors
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Project Form */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide comprehensive information to help contractors understand your project requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Kitchen Renovation"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description of Work *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide detailed description of the work to be done..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Trade Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {tradeCategories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="location" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location *</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter project address or city"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Only city will be visible to contractors for privacy
                </p>
              </div>
            </div>
            
            {/* Budget */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Budget</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Minimum Budget *</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => handleInputChange('budget_min', e.target.value)}
                    placeholder="5000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Maximum Budget *</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => handleInputChange('budget_max', e.target.value)}
                    placeholder="10000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Timeline</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proposal_deadline">Proposal Deadline *</Label>
                  <Input
                    id="proposal_deadline"
                    type="date"
                    value={formData.proposal_deadline}
                    onChange={(e) => handleInputChange('proposal_deadline', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="decision_date">Decision Date *</Label>
                  <Input
                    id="decision_date"
                    type="date"
                    value={formData.decision_date}
                    onChange={(e) => handleInputChange('decision_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_start_date">Preferred Start Date *</Label>
                  <Input
                    id="preferred_start_date"
                    type="date"
                    value={formData.preferred_start_date}
                    onChange={(e) => handleInputChange('preferred_start_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="preferred_end_date">Preferred End Date *</Label>
                  <Input
                    id="preferred_end_date"
                    type="date"
                    value={formData.preferred_end_date}
                    onChange={(e) => handleInputChange('preferred_end_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Permits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Permits</h3>
              
              <div className="flex items-center space-x-3">
                <Switch
                  id="permit_required"
                  checked={formData.permit_required}
                  onCheckedChange={(checked) => handleInputChange('permit_required', checked)}
                />
                <Label htmlFor="permit_required">Permits required for this project</Label>
              </div>
            </div>
            
            {/* File Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Documentation</h3>
              
              <div>
                <Label htmlFor="site_photos" className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Site Photos * (Required)</span>
                </Label>
                <Input
                  id="site_photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileChange('site_photos', e.target.files)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include photos showing site access, current conditions, and areas to be worked on
                </p>
                {formData.site_photos.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    {formData.site_photos.length} photo(s) selected
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="project_files" className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4" />
                  <span>Project Files (Optional)</span>
                </Label>
                <Input
                  id="project_files"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.dwg,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('project_files', e.target.files)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload plans, specifications, or other relevant documents
                </p>
                {formData.project_files.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    {formData.project_files.length} file(s) selected
                  </p>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/dashboard/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Project...' : 'Post Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}