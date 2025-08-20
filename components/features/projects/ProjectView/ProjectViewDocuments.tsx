'use client'

import { useState } from 'react'
import { Project } from '@/types/database/projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  Upload,
  FolderOpen,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { USER_ROLES } from '@/lib/constants'

interface ProjectViewDocumentsProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
}

interface Document {
  id: string
  filename: string
  type: 'image' | 'document' | 'contract' | 'permit' | 'invoice' | 'other'
  size: number
  uploadedAt: Date
  uploadedBy: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  category: 'project-photos' | 'contracts' | 'permits' | 'invoices' | 'other'
  description?: string
  tags?: string[]
}

export function ProjectViewDocuments({ project, userRole }: ProjectViewDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock documents data - replace with actual data
  const documents: Document[] = [
    // Project Photos
    ...(project.project_photos?.map((photo, index) => ({
      id: `photo-${index}`,
      filename: typeof photo === 'string' ? `photo-${index + 1}.jpg` : photo.filename || `photo-${index + 1}.jpg`,
      type: 'image' as const,
      size: typeof photo === 'string' ? 1024 * 1024 : photo.size || 1024 * 1024,
      uploadedAt: typeof photo === 'string' ? new Date() : photo.uploadedAt || new Date(),
      uploadedBy: 'Homeowner',
      status: 'approved' as const,
      category: 'project-photos' as const,
      description: `Project photo ${index + 1}`,
      tags: ['exterior', 'before']
    })) || []),
    
    // Project Files
    ...(project.files?.map((file, index) => ({
      id: `file-${index}`,
      filename: typeof file === 'string' ? `file-${index + 1}.pdf` : file.filename || `file-${index + 1}.pdf`,
      type: 'document' as const,
      size: typeof file === 'string' ? 2048 * 1024 : file.size || 2048 * 1024,
      uploadedAt: typeof file === 'string' ? new Date() : file.uploadedAt || new Date(),
      uploadedBy: 'Homeowner',
      status: 'approved' as const,
      category: 'other' as const,
      description: `Project file ${index + 1}`,
      tags: ['specifications', 'requirements']
    })) || []),
    
    // Additional mock documents
    {
      id: 'contract-1',
      filename: 'Service_Contract_2024.pdf',
      type: 'contract',
      size: 512 * 1024,
      uploadedAt: new Date('2024-01-10'),
      uploadedBy: 'Contractor',
      status: 'pending',
      category: 'contracts',
      description: 'Service agreement between homeowner and contractor',
      tags: ['contract', 'agreement', 'legal']
    },
    {
      id: 'permit-1',
      filename: 'Building_Permit_2024.pdf',
      type: 'permit',
      size: 256 * 1024,
      uploadedAt: new Date('2024-01-05'),
      uploadedBy: 'Homeowner',
      status: 'approved',
      category: 'permits',
      description: 'Building permit for renovation project',
      tags: ['permit', 'building', 'approved']
    }
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-5 w-5" />
      case 'contract': return <FileText className="h-5 w-5" />
      case 'permit': return <FileText className="h-5 w-5" />
      case 'invoice': return <FileText className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800'
      case 'contract': return 'bg-purple-100 text-purple-800'
      case 'permit': return 'bg-green-100 text-green-800'
      case 'invoice': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'rejected': return 'bg-red-500'
      case 'expired': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      case 'expired': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const categories = ['all', 'project-photos', 'contracts', 'permits', 'invoices', 'other']
  const types = ['all', 'image', 'document', 'contract', 'permit', 'invoice']

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesType = selectedType === 'all' || doc.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const handleDownload = (document: Document) => {
    // Implement download logic here
    console.log('Downloading:', document.filename)
  }

  const handleView = (document: Document) => {
    // Implement view logic here
    console.log('Viewing:', document.filename)
  }

  const handleUpload = () => {
    // Implement upload logic here
    console.log('Opening upload dialog')
  }

  return (
    <div className="space-y-6">
      {/* Documents Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Project Documents</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage project files, contracts, and permits
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </Button>
              
              {userRole === 'homeowner' && (
                <Button
                  onClick={handleUpload}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-muted-foreground mb-4">
              No documents match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "space-y-4",
          viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Document Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        getTypeColor(document.type)
                      )}>
                        {getTypeIcon(document.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{document.filename}</h4>
                        <p className="text-xs text-muted-foreground">{formatFileSize(document.size)}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      className={cn(
                        getStatusColor(document.status),
                        "text-white text-xs"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(document.status)}
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </div>
                    </Badge>
                  </div>

                  {/* Document Details */}
                  {document.description && (
                    <p className="text-sm text-gray-600">{document.description}</p>
                  )}

                  {/* Tags */}
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Document Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{document.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(document.uploadedAt)}</span>
                    </div>
                  </div>

                  {/* Document Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(document)}
                      className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Statistics */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Document Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
              <div className="text-sm text-blue-700">Total Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'approved').length}
              </div>
              <div className="text-sm text-green-700">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(d => d.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}
              </div>
              <div className="text-sm text-purple-700">Total Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Guidelines */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Document Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-2 text-sm">
            <p>• Keep all project documents organized and up-to-date</p>
            <p>• Upload contracts and permits for legal compliance</p>
            <p>• Use descriptive filenames and add relevant tags</p>
            <p>• Regular backups ensure document security</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
