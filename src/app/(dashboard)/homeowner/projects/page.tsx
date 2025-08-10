'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Plus, Calendar, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types/database'

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        let query = supabase.from('projects').select('*')
        
        // Get user role from metadata
        const userRole = user.user_metadata?.role || 'homeowner'
        
        // If homeowner, show only their projects
        // If contractor, show all open projects
        if (userRole === 'homeowner') {
          query = query.eq('homeowner_id', user.id)
        } else if (userRole === 'contractor') {
          query = query.eq('status', 'open')
        }
        
        const { data, error: fetchError } = await query.order('created_at', { ascending: false })
        
        if (fetchError) {
          throw fetchError
        }
        
        setProjects(data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'bidding': return 'bg-blue-500'
      case 'awarded': return 'bg-purple-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatBudget = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading projects...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        {(user?.user_metadata?.role || 'homeowner') === 'homeowner' && (
          <Link href="/homeowner/projects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post a Project
            </Button>
          </Link>
        )}
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <FileText className="h-6 w-6" />
            <span>
              {(user?.user_metadata?.role || 'homeowner') === 'homeowner' ? 'My Projects' : 'Available Projects'}
            </span>
          </CardTitle>
          <CardDescription>
            {(user?.user_metadata?.role || 'homeowner') === 'homeowner' 
              ? 'Manage your projects and track their progress'
              : 'Browse available projects and submit proposals'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                  <span className="text-sm font-medium capitalize">{project.status}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatBudget(project.budget_min, project.budget_max)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {project.category.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {formatDate(project.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Deadline: {formatDate(project.proposal_deadline)}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {projects.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  {user?.role === 'homeowner' ? 'No projects yet' : 'No available projects'}
                </h3>
                <p className="mb-4">
                  {user?.role === 'homeowner' 
                    ? 'Get started by creating your first project.'
                    : 'Check back later for new project opportunities.'
                  }
                </p>
                {user?.role === 'homeowner' && (
                  <Link href="/homeowner/projects/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post a Project
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}