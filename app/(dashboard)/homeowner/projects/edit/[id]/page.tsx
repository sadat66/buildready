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
import { ArrowLeft, MapPin, Calendar, DollarSign, Save } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { VISIBILITY_SETTINGS_VALUES } from '@/lib/constants'
import { PROJECT_TYPES, PROJECT_TYPE_VALUES, type ProjectType } from '@/lib/constants/projects'
import { TRADE_CATEGORY_VALUES } from '@/lib/constants/trades'
// Removed unused imports FormPhotoInput and FormDocumentInput
import { supabaseStorageService } from '@/lib/services/SupabaseStorageService'
import dynamic from 'next/dynamic'

const LocationMap = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

const tradeCategories = TRADE_CATEGORY_VALUES

const projectTypes = PROJECT_TYPE_VALUES

const visibilitySettings = VISIBILITY_SETTINGS_VALUES

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Separate state for new file uploads
  const [newProjectPhotos, setNewProjectPhotos] = useState<File[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])

  // Form state - Updated to match new schema
  const [formData, setFormData] = useState<{
    project_title: string
    statement_of_work: string
    category: string[]
    location: {
      address: string
      city: string
      province: string
      postalCode: string
      latitude: number | undefined
      longitude: number | undefined
    }
    budget: number
    pid: string
    project_type: ProjectType
    visibility_settings: typeof VISIBILITY_SETTINGS_VALUES[number]
    start_date: string
    end_date: string
    expiry_date: string
    decision_date: string
    substantial_completion: string
    permit_required: boolean
    is_verified_project: boolean
    certificate_of_title: string
    project_photos: Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>
    files: Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>
  }>({
    project_title: '',
    statement_of_work: '',
    category: [] as string[],
    location: {
      address: '',
      city: '',
      province: '',
      postalCode: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
    },
    budget: 0,
    pid: '',
    project_type: PROJECT_TYPES.RENOVATION,
    visibility_settings: 'Public To Marketplace' as typeof VISIBILITY_SETTINGS_VALUES[number],
    start_date: '',
    end_date: '',
    expiry_date: '',
    decision_date: '',
    substantial_completion: '',
    permit_required: false,
    is_verified_project: false,
    certificate_of_title: '',
    project_photos: [] as Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>,
    files: [] as Array<{ id: string; filename: string; url: string; size: number; mimeType: string; uploadedAt: Date }>
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
          .eq('creator', user.id)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        if (data) {
          setFormData({
            project_title: data.project_title || '',
            statement_of_work: data.statement_of_work || '',
            category: Array.isArray(data.category) ? data.category : [],
            location: {
              address: data.location?.address || '',
              city: data.location?.city || '',
              province: data.location?.province || '',
              postalCode: data.location?.postalCode || '',
              latitude: data.location?.latitude || undefined,
              longitude: data.location?.longitude || undefined,
            },
            budget: data.budget || 0,
            pid: data.pid || '',
            project_type: data.project_type || PROJECT_TYPES.RENOVATION,
            visibility_settings: data.visibility_settings || 'Public To Marketplace',
            start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
            end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : '',
            expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : '',
            decision_date: data.decision_date ? new Date(data.decision_date).toISOString().split('T')[0] : '',
            substantial_completion: data.substantial_completion ? new Date(data.substantial_completion).toISOString().split('T')[0] : '',
            permit_required: data.permit_required || false,
            is_verified_project: data.is_verified_project || false,
            certificate_of_title: data.certificate_of_title || '',
            project_photos: data.project_photos || [],
            files: data.files || []
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

  const handleLocationSelect = (coordinates: {
    lat: number
    lng: number
    address: string
  }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: coordinates.address,
        city: 'Vancouver', // Default city - should be parsed from address
        province: 'BC', // Default province
        postalCode: 'V6B 1A1', // Default postal code - should be parsed from address
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    setError('')
    
    try {
      const supabase = createClient()
      
      // Upload new photos if any
      const newPhotoReferences: Array<{
        id: string;
        filename: string;
        url: string;
        size: number;
        mimeType: string;
        uploadedAt: Date;
      }> = []
      if (newProjectPhotos.length > 0) {
        for (const file of newProjectPhotos) {
          try {
            const uploadResult = await supabaseStorageService.uploadFile(file, {
              fileType: 'photos',
              bucket: 'buildready-files'
            })
            
            newPhotoReferences.push({
              id: crypto.randomUUID(),
              filename: file.name,
              url: uploadResult.url,
              size: uploadResult.size,
              mimeType: uploadResult.mimeType,
              uploadedAt: new Date(uploadResult.uploadedAt)
            })
          } catch (uploadError) {
            console.error('Failed to upload photo:', file.name, uploadError)
            // Continue with other files even if one fails
          }
        }
      }
      
      // Upload new documents if any
      const newFileReferences: Array<{
        id: string;
        filename: string;
        url: string;
        size: number;
        mimeType: string;
        uploadedAt: Date;
      }> = []
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          try {
            const uploadResult = await supabaseStorageService.uploadFile(file, {
              fileType: 'documents',
              bucket: 'buildready-files'
            })
            
            newFileReferences.push({
              id: crypto.randomUUID(),
              filename: file.name,
              url: uploadResult.url,
              size: uploadResult.size,
              mimeType: uploadResult.mimeType,
              uploadedAt: new Date(uploadResult.uploadedAt)
            })
          } catch (uploadError) {
            console.error('Failed to upload document:', file.name, uploadError)
            // Continue with other files even if one fails
          }
        }
      }
      
      // Prepare data for update - match new schema
      const updateData = {
        project_title: formData.project_title,
        statement_of_work: formData.statement_of_work,
        category: formData.category,
        location: {
          address: formData.location.address,
          city: formData.location.city,
          province: formData.location.province,
          postalCode: formData.location.postalCode,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        },
        budget: formData.budget,
        pid: formData.pid,
        project_type: formData.project_type,
        visibility_settings: formData.visibility_settings,
        start_date: formData.start_date ? new Date(formData.start_date) : null,
        end_date: formData.end_date ? new Date(formData.end_date) : null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date) : null,
        decision_date: formData.decision_date ? new Date(formData.decision_date) : null,
        substantial_completion: formData.substantial_completion ? new Date(formData.substantial_completion) : null,
        permit_required: formData.permit_required,
        is_verified_project: formData.is_verified_project,
        certificate_of_title: formData.certificate_of_title,
        // Combine existing files with new uploads
        project_photos: [...formData.project_photos, ...newPhotoReferences],
        files: [...formData.files, ...newFileReferences],
        updated_at: new Date()
      }
      
      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
      
      if (updateError) {
        throw updateError
      }
      
      // Clear new file selections after successful upload
      setNewProjectPhotos([])
      setNewFiles([])
      
      // Update form data to reflect the new files
      setFormData(prev => ({
        ...prev,
        project_photos: [...prev.project_photos, ...newPhotoReferences],
        files: [...prev.files, ...newFileReferences]
      }))
      
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading project...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">
            Update your project details and requirements
          </p>
        </div>
        <Link href={`/homeowner/projects/view/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your project details and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project_title">Project Title *</Label>
              <Input
                id="project_title"
                value={formData.project_title}
                onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
                placeholder="e.g., Kitchen Renovation"
                required
              />
            </div>

            <div>
              <Label htmlFor="statement_of_work">Statement of Work *</Label>
              <Textarea
                id="statement_of_work"
                value={formData.statement_of_work}
                onChange={(e) => setFormData(prev => ({ ...prev, statement_of_work: e.target.value }))}
                placeholder="Provide detailed description of the work to be done..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Trade Categories *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {tradeCategories.map((cat) => (
                  <label key={cat} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.category.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            category: [...prev.category, cat]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            category: prev.category.filter(c => c !== cat)
                          }))
                        }
                      }}
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="project_type">Project Type *</Label>
              <select
                id="project_type"
                value={formData.project_type}
                onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value as typeof projectTypes[number] }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="pid">Project ID *</Label>
              <Input
                id="pid"
                value={formData.pid}
                onChange={(e) => setFormData(prev => ({ ...prev, pid: e.target.value }))}
                placeholder="e.g., PRJ-2024-001"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Project Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Location Map</Label>
              <LocationMap
                onLocationSelect={handleLocationSelect}
                className="mt-2"
              />
            </div>
            
            {formData.location.address && (
              <div className="text-sm text-muted-foreground">
                Selected: {formData.location.address}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location_city">City</Label>
                <Input
                  id="location_city"
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="location_province">Province</Label>
                <Input
                  id="location_province"
                  value={formData.location.province}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, province: e.target.value }
                  }))}
                  placeholder="Province"
                />
              </div>
              <div>
                <Label htmlFor="location_postal">Postal Code</Label>
                <Input
                  id="location_postal"
                  value={formData.location.postalCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, postalCode: e.target.value }
                  }))}
                  placeholder="Postal Code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Budget</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="budget">Project Budget *</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                placeholder="15000"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry_date">Proposal Deadline *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="decision_date">Decision Date *</Label>
                <Input
                  id="decision_date"
                  type="date"
                  value={formData.decision_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, decision_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="substantial_completion">Substantial Completion Date (Optional)</Label>
              <Input
                id="substantial_completion"
                type="date"
                value={formData.substantial_completion}
                onChange={(e) => setFormData(prev => ({ ...prev, substantial_completion: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="visibility_settings">Project Visibility *</Label>
              <select
                id="visibility_settings"
                value={formData.visibility_settings}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility_settings: e.target.value as typeof visibilitySettings[number] }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                {visibilitySettings.map((setting) => (
                  <option key={setting} value={setting}>{setting}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="permit_required"
                checked={formData.permit_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permit_required: checked }))}
              />
              <Label htmlFor="permit_required">Permit Required</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_verified_project"
                checked={formData.is_verified_project}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_verified_project: checked }))}
              />
              <Label htmlFor="is_verified_project">Verified Project</Label>
            </div>

            <div>
              <Label htmlFor="certificate_of_title">Certificate of Title (Optional)</Label>
              <Input
                id="certificate_of_title"
                type="url"
                value={formData.certificate_of_title}
                onChange={(e) => setFormData(prev => ({ ...prev, certificate_of_title: e.target.value }))}
                placeholder="https://example.com/certificate.pdf"
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Project Documentation</span>
            </CardTitle>
            <CardDescription>
              Upload photos and documents related to your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display existing photos */}
            {formData.project_photos.length > 0 && (
              <div>
                <Label>Current Project Photos ({formData.project_photos.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {formData.project_photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-gray-500 mt-1 truncate">{photo.filename}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display existing files */}
            {formData.files.length > 0 && (
              <div>
                <Label>Current Project Files ({formData.files.length})</Label>
                <div className="space-y-2 mt-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                        </p>
                      </div>
                      {file.url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Photo Upload */}
            <div>
              <Label htmlFor="new_photos">Add New Photos</Label>
              <Input
                id="new_photos"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setNewProjectPhotos(Array.from(e.target.files))
                  }
                }}
                className="mt-2"
              />
              {newProjectPhotos.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected: {newProjectPhotos.length} photo(s)</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProjectPhotos.map((file, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* New Document Upload */}
            <div>
              <Label htmlFor="new_documents">Add New Documents</Label>
              <Input
                id="new_documents"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => {
                  if (e.target.files) {
                    setNewFiles(Array.from(e.target.files))
                  }
                }}
                className="mt-2"
              />
              {newFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected: {newFiles.length} document(s)</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newFiles.map((file, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
               )}
             </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href={`/homeowner/projects/view/${id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
