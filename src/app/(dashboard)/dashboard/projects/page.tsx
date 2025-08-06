'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Project } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar,
  Eye,
  Plus,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const supabase = createClient()
  const isHomeowner = profile?.role === 'homeowner'

  const fetchProjects = useCallback(async () => {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          homeowner:users!projects_homeowner_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (isHomeowner) {
        // Homeowners see their own projects
        query = query.eq('homeowner_id', profile?.id)
      } else {
        // Contractors see open projects
        query = query.eq('status', 'open')
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching projects:', error)
        return
      }

      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, isHomeowner, supabase])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'bidding': return 'bg-blue-100 text-blue-800'
      case 'awarded': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isHomeowner ? 'My Projects' : 'Available Projects'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isHomeowner 
              ? 'Manage your construction projects and track their progress'
              : 'Browse available projects and submit your proposals'
            }
          </p>
        </div>
        {isHomeowner && (
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="bidding">Bidding</option>
          <option value="awarded">Awarded</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isHomeowner ? 'No projects found' : 'No available projects'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isHomeowner 
                ? 'Create your first project to get started'
                : 'Check back later for new project opportunities'
              }
            </p>
            {isHomeowner && (
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {project.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Posted {formatDate(project.created_at)}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    {!isHomeowner && project.status === 'open' && (
                      <Link href={`/dashboard/projects/${project.id}/propose`}>
                        <Button size="sm" className="flex-1">
                          <FileText className="w-4 h-4 mr-1" />
                          Submit Proposal
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 