'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, MapPin, Calendar, DollarSign, FileText, Camera, Paperclip, X, Upload } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const LocationMap = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

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
  const [dragActive, setDragActive] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    budget: '',
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

  const handleLocationSelect = (coordinates: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: coordinates.address,
      latitude: coordinates.lat,
      longitude: coordinates.lng
    }))
  }

  const handleFileChange = (field: 'site_photos' | 'project_files', files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      
      // Validate file types and sizes
      const validFiles = newFiles.filter(file => {
        if (field === 'site_photos') {
          if (!file.type.startsWith('image/')) {
            setError('Please select only image files for site photos')
            return false
          }
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Photo files must be smaller than 5MB')
            return false
          }
        } else {
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('Project files must be smaller than 10MB')
            return false
          }
        }
        return true
      })
      
      if (validFiles.length > 0) {
        setError('')
        setFormData(prev => ({ 
          ...prev, 
          [field]: field === 'site_photos' 
            ? [...prev[field], ...validFiles] 
            : validFiles 
        }))
      }
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      site_photos: prev.site_photos.filter((_, i) => i !== index)
    }))
  }

  const removeProjectFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      project_files: prev.project_files.filter((_, i) => i !== index)
    }))
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, field: 'site_photos' | 'project_files') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(field, e.dataTransfer.files)
    }
  }, [])

  const validateForm = () => {
    const required = [
      'title', 'description', 'category', 'location', 
      'budget', 'proposal_deadline',
      'preferred_start_date', 'preferred_end_date', 'decision_date'
    ]
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.replace('_', ' ')} is required`)
        return false
      }
    }
    
    if (!formData.latitude || !formData.longitude) {
      setError('Please select a location on the map')
      return false
    }
    
    if (formData.site_photos.length === 0) {
      setError('At least one site photo is required')
      return false
    }
    
    if (parseFloat(formData.budget) <= 0) {
      setError('Budget must be a positive number')
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
      
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          homeowner_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          budget: parseFloat(formData.budget),
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
      
      router.push('/homeowner/projects')
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
        <Link href="/homeowner/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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
                <Label className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Project Location *</span>
                </Label>
                <LocationMap 
                  onLocationSelect={handleLocationSelect}
                  className="mt-2"
                />
                {formData.location && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {formData.location}
                  </p>
                )}
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
              
              <div>
                <Label htmlFor="budget">Project Budget *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="15000"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your total budget for this project
                </p>
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
                
                {/* Drag & Drop Area */}
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, 'site_photos')}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop photos here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports JPG, PNG, GIF up to 5MB each
                  </p>
                  <Input
                    id="site_photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange('site_photos', e.target.files)}
                    className="mt-4"
                  />
                </div>
                
                {/* Photo Previews */}
                {formData.site_photos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Selected Photos ({formData.site_photos.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {formData.site_photos.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => removePhoto(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Include photos showing site access, current conditions, and areas to be worked on
                </p>
              </div>
              
              <div>
                <Label htmlFor="project_files" className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4" />
                  <span>Project Files (Optional)</span>
                </Label>
                
                {/* Drag & Drop Area for Project Files */}
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, 'project_files')}
                >
                  <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports PDF, DOC, DWG, images up to 10MB each
                  </p>
                  <Input
                    id="project_files"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.dwg,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('project_files', e.target.files)}
                    className="mt-4"
                  />
                </div>
                
                {/* Project Files List */}
                {formData.project_files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Selected Files ({formData.project_files.length})
                    </p>
                    <div className="space-y-2">
                      {formData.project_files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProjectFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Upload plans, specifications, or other relevant documents
                </p>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/homeowner/dashboard">
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