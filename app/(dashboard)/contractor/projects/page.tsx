'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/AuthContext'
import { ProjectService } from '@/lib/services/ProjectService'
import { Project } from '@/types'
import { USER_ROLES } from '@/lib/constants'
import { PaymentModal } from '@/components/shared/modals'
import { Breadcrumbs } from '@/components/shared'
import { LoadingSpinner } from '@/components/shared'
import ProjectList from '@/components/features/projects/ProjectList'
import ContractorProjectTable from '@/components/features/projects/ContractorProjectTable'
import { Plus, Search, Grid3X3, Table2, MapPin, DollarSign, Calendar, Building, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ContractorProjectsPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [intendedAction, setIntendedAction] = useState<'view' | 'submit-proposal' | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjectsLoading(false)
        return
      }
      
      try {
        const projectService = new ProjectService()
        const result = await projectService.getAvailableProjects()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch projects')
        }
        
        setProjects(result.data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load projects')
      } finally {
        setProjectsLoading(false)
      }
    }
    
    if (!loading && user && userRole === USER_ROLES.CONTRACTOR) {
      fetchProjects()
    }
  }, [user, userRole, loading])

  // Handle payment success
  const handlePaymentSuccess = () => {
    setHasPaid(true)
    setShowPaymentModal(false)
    toast.success('Payment successful! You can now access project details.')
    
    if (selectedProject && intendedAction) {
      if (intendedAction === 'view') {
        router.push(`/contractor/projects/view/${selectedProject.id}`)
      } else if (intendedAction === 'submit-proposal') {
        router.push(`/contractor/projects/submit-proposal/${selectedProject.id}`)
      }
    }
    
    // Reset the intended action
    setIntendedAction(null)
  }

  // Handle submit proposal click
  const handleSubmitProposal = (project: Project) => {
    if (!hasPaid) {
      setSelectedProject(project)
      setIntendedAction('submit-proposal')
      setShowPaymentModal(true)
    } else {
      router.push(`/contractor/projects/submit-proposal/${project.id}`)
    }
  }

  // Handle view details click
  const handleViewDetails = (project: Project) => {
    if (!hasPaid) {
      setSelectedProject(project)
      setIntendedAction('view')
      setShowPaymentModal(true)
    } else {
      router.push(`/contractor/projects/view/${project.id}`)
    }
  }

  // Handle row click - direct navigation without payment check
  const handleRowClick = (project: Project) => {
    router.push(`/contractor/projects/view/${project.id}`)
  }

  if (loading || projectsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Available Projects</h1>
            <p className="text-muted-foreground">
              Browse and bid on published construction projects
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">Only contractors can view available projects.</p>
          </div>
        </div>
      </div>
    )
  }

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.statement_of_work?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
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
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/contractor/dashboard' },
            { label: 'Available Projects', href: '/contractor/projects' }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Projects</h1>
          <p className="text-muted-foreground">
            Browse and bid on published construction projects
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Open for Proposals">Open for Proposals</SelectItem>
              <SelectItem value="Awarded">Awarded</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 px-3"
          >
            <Table2 className="h-4 w-4 mr-2" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("card")}
            className="h-8 px-3"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)}{" "}
          of {filteredProjects.length} projects
        </span>
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <ContractorProjectTable
          projects={paginatedProjects}
          onProjectClick={handleRowClick}
        />
      ) : (
        <div className="grid gap-6">
          {paginatedProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                <Building className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No projects found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'No projects are currently available.'}
              </p>
            </div>
          ) : (
            paginatedProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{project.project_title}</CardTitle>
                      <CardDescription className="text-base line-clamp-3">
                        {project.statement_of_work}
                      </CardDescription>
                    </div>
                    <Badge variant={project.status === 'Open for Proposals' ? 'default' : 'secondary'} className="ml-4">
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {project.location?.city || 'Location not specified'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {project.budget ? formatCurrency(project.budget) : 'Budget TBD'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Posted {formatDate(project.created_at)}
                      </span>
                    </div>
                    
                    {project.expiry_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Expires {formatDate(project.expiry_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {project.category && project.category.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.category.map((cat, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewDetails(project)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      onClick={() => handleSubmitProposal(project)}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Proposal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        userType="contractor"
        projectTitle={selectedProject?.project_title}
      />
    </div>
  )
}