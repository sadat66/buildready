'use client'

import { useState } from 'react'
import { Project } from '@/types/database/projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building2, 
  FileText, 
  Camera,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { USER_ROLES } from '@/lib/constants'

const LocationMap = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

interface ProjectViewOverviewProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
}

export function ProjectViewOverview({ project, userRole }: ProjectViewOverviewProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [photoCategory, setPhotoCategory] = useState<string>('all')

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatBudget = (budget: number) => {
    return `$${budget.toLocaleString()}`
  }

  const openPhotoLightbox = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const closePhotoLightbox = () => {
    setSelectedPhotoIndex(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return
    
    const totalPhotos = project.project_photos.length
    if (direction === 'prev') {
      setSelectedPhotoIndex(selectedPhotoIndex === 0 ? totalPhotos - 1 : selectedPhotoIndex - 1)
    } else {
      setSelectedPhotoIndex(selectedPhotoIndex === totalPhotos - 1 ? 0 : selectedPhotoIndex + 1)
    }
  }

  const getPhotoCategories = () => {
    // This could be enhanced with AI categorization or manual tagging
    return ['all', 'exterior', 'interior', 'progress', 'before', 'after']
  }

  const filteredPhotos = photoCategory === 'all' 
    ? project.project_photos 
    : project.project_photos.filter(photo => 
        // This is a placeholder - you'd implement actual categorization
        photo.filename?.toLowerCase().includes(photoCategory)
      )

  return (
    <div className="space-y-6">
      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-500" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statement of Work */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Statement of Work</Label>
            <p className="mt-2 text-gray-900 leading-relaxed">{project.statement_of_work}</p>
          </div>
          
          <Separator />
          
          {/* Project Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Project Type</Label>
              <p className="mt-1 text-gray-900 font-medium">{project.project_type}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Trade Categories</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.category.map((cat, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Budget Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Project Budget</Label>
                <p className="text-2xl font-bold text-green-600">{formatBudget(project.budget)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Photo Gallery */}
      {project.project_photos && project.project_photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-500" />
              Project Photos ({project.project_photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Categories Filter */}
            <div className="flex flex-wrap gap-2">
              {getPhotoCategories().map((category) => (
                <Button
                  key={category}
                  variant={photoCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPhotoCategory(category)}
                  className={cn(
                    photoCategory === category 
                      ? "bg-orange-500 hover:bg-orange-600" 
                      : "hover:bg-orange-50 hover:border-orange-200"
                  )}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200"
                  onClick={() => openPhotoLightbox(index)}
                >
                  <img
                    src={typeof photo === 'string' ? photo : photo.url || ''}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Download Button */}
                  {userRole === 'contractor' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Implement download functionality
                        const link = document.createElement('a')
                        link.href = typeof photo === 'string' ? photo : photo.url || ''
                        link.download = typeof photo === 'string' ? `photo-${index + 1}.jpg` : photo.filename || `photo-${index + 1}.jpg`
                        link.click()
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Photo Lightbox */}
            {selectedPhotoIndex !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                <div className="relative max-w-4xl max-h-full">
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
                    onClick={closePhotoLightbox}
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  {/* Navigation Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => navigatePhoto('prev')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => navigatePhoto('next')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Main Photo */}
                  <img
                    src={typeof project.project_photos[selectedPhotoIndex] === 'string' 
                      ? project.project_photos[selectedPhotoIndex] 
                      : project.project_photos[selectedPhotoIndex].url || ''
                    }
                    alt={`Project photo ${selectedPhotoIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />

                  {/* Photo Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedPhotoIndex + 1} of {project.project_photos.length}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="mt-1 text-gray-900">{project.location?.address}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">City</Label>
                  <p className="mt-1 text-gray-900">{project.location?.city}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Province</Label>
                  <p className="mt-1 text-gray-900">{project.location?.province}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                  <p className="mt-1 text-gray-900">{project.location?.postalCode}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            {project.location?.latitude && project.location?.longitude && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Map</Label>
                <div className="mt-2">
                  <LocationMap
                    onLocationSelect={() => {}} // Read-only
                    className="h-64 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                <p className="mt-1 text-gray-900 font-medium">{formatDate(project.start_date)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                <p className="mt-1 text-gray-900 font-medium">{formatDate(project.end_date)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Proposal Deadline</Label>
                <p className="mt-1 text-gray-900 font-medium">{formatDate(project.expiry_date)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Decision Date</Label>
                <p className="mt-1 text-gray-900 font-medium">{formatDate(project.decision_date)}</p>
              </div>
            </div>
          </div>

          {project.substantial_completion && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium text-muted-foreground">Substantial Completion</Label>
              <p className="mt-1 text-gray-900 font-medium">{formatDate(project.substantial_completion)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
