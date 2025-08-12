'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, MapPin, Calendar, DollarSign, FileText, Camera, Paperclip, Save } from 'lucide-react'
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

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
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
    site_photos: [] as string[],
    project_files: [] as string[]
  })

  // Fetch existing project data
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
          .eq('homeowner_id', user.id)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            location: data.location || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            budget: data.budget?.toString() || '',
            proposal_deadline: data.proposal_deadline || '',
            preferred_start_date: data.preferred_start_date || '',
            preferred_end_date: data.preferred_end_date || '',
            decision_date: data.decision_date || '',
            permit_required: data.permit_required || false,
            site_photos: data.site_photos || [],
            project_files: data.project_files || []
          })
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [id, user])

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
    
    if (parseFloat(formData.budget) <= 0) {
      setError('Budget must be a positive number')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || (user.user_metadata?.role || 'homeowner') !== 'homeowner') {
      setError('Only homeowners can edit projects')
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    setError('')
    
    try {
      const supabase = createClient()
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({
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
          site_photos: formData.site_photos,
          project_files: formData.project_files,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('homeowner_id', user.id)
      
      if (updateError) {
        throw updateError
      }
      
      router.push(`/homeowner/projects/view/${id}`)
    } catch (error) {
      console.error('Error updating project:', error)
      setError('Failed to update project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/homeowner/projects/view/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading project details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/homeowner/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/homeowner/projects/view/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <FileText className="h-6 w-6" />
            <span>Edit Project</span>
          </CardTitle>
          <CardDescription>
            Update your project details to better attract quality contractors
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Project Form */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Update the information to help contractors understand your project requirements
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
                  initialCoordinates={formData.latitude && formData.longitude ? 
                    { lat: formData.latitude, lng: formData.longitude } : undefined}
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
            
            {/* Current Photos and Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Project Files</h3>
              
              {formData.site_photos.length > 0 && (
                <div>
                  <Label className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Site Photos ({formData.site_photos.length})</span>
                  </Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {formData.site_photos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo}
                          alt={`Site photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Photos cannot be modified in edit mode. Create a new project to change photos.
                  </p>
                </div>
              )}
              
              {formData.project_files.length > 0 && (
                <div>
                  <Label className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4" />
                    <span>Project Files ({formData.project_files.length})</span>
                  </Label>
                  <div className="mt-2 space-y-2">
                    {formData.project_files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{file}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Files cannot be modified in edit mode. Create a new project to change files.
                  </p>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href={`/homeowner/projects/view/${id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
