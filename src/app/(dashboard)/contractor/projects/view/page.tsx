'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, MapPin, Calendar, DollarSign, Search, Filter, Eye } from 'lucide-react'
import Link from 'next/link'

// Mock data for available projects
const availableProjects = [
  {
    id: 1,
    title: 'Kitchen Renovation',
    description: 'Complete kitchen remodel including cabinets, countertops, and appliances.',
    category: 'kitchen',
    location: 'Seattle, WA',
    budget_min: 15000,
    budget_max: 25000,
    proposal_deadline: '2024-02-15',
    preferred_start_date: '2024-03-01',
    preferred_end_date: '2024-04-15',
    homeowner: 'John Smith',
    status: 'open',
    proposals_count: 3
  },
  {
    id: 2,
    title: 'Deck Construction',
    description: 'Build a new 20x16 deck with composite materials and railing.',
    category: 'deck',
    location: 'Portland, OR',
    budget_min: 8000,
    budget_max: 12000,
    proposal_deadline: '2024-02-20',
    preferred_start_date: '2024-03-15',
    preferred_end_date: '2024-04-30',
    homeowner: 'Sarah Johnson',
    status: 'open',
    proposals_count: 1
  },
  {
    id: 3,
    title: 'Bathroom Remodel',
    description: 'Full bathroom renovation with new fixtures, tile, and vanity.',
    category: 'bathroom',
    location: 'Tacoma, WA',
    budget_min: 10000,
    budget_max: 18000,
    proposal_deadline: '2024-02-25',
    preferred_start_date: '2024-04-01',
    preferred_end_date: '2024-05-15',
    homeowner: 'Mike Davis',
    status: 'open',
    proposals_count: 5
  }
]

export default function ContractorProjectsViewPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.user_metadata?.role
      
      // Only contractors can access this page
      if (userRole !== 'contractor') {
        setIsRedirecting(true)
        if (userRole === 'homeowner') {
          router.push('/homeowner/projects')
        } else {
          router.push('/dashboard')
        }
        return
      }
    }
  }, [user, loading, router])

  if (loading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please log in to view projects.</div>
      </div>
    )
  }

  const userRole = user.user_metadata?.role
  
  if (userRole !== 'contractor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Only contractors can view available projects.</div>
      </div>
    )
  }

  const filteredProjects = availableProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8" />
              Available Projects
            </h1>
            <p className="text-gray-600 mt-2">
              Browse and bid on construction projects from homeowners
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredProjects.length} project(s) available
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects by title, description, or location..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="deck">Deck</SelectItem>
                  <SelectItem value="roofing">Roofing</SelectItem>
                  <SelectItem value="flooring">Flooring</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="general_construction">General Construction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                  <CardDescription className="text-sm mb-3">
                    {project.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-2">
                  {project.category.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>{formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Deadline: {formatDate(project.proposal_deadline)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span>{project.proposals_count} proposal(s)</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Project Timeline</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Start: {formatDate(project.preferred_start_date)}</div>
                  <div>End: {formatDate(project.preferred_end_date)}</div>
                </div>
              </div>

              {/* Homeowner Info */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-gray-600">
                  Posted by: <span className="font-medium">{project.homeowner}</span>
                </div>
                <Badge 
                  variant={project.status === 'open' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {project.status}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Submit Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'No projects are currently available. Check back later for new opportunities.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}