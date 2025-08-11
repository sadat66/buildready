'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Calendar, MapPin, DollarSign, Home, Eye } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Project } from '@/types/database'

interface HomeownerDashboardProps {
  userEmail?: string
}

export default function HomeownerDashboard({ userEmail }: HomeownerDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }
        
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('homeowner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6) // Show only recent 6 projects on dashboard
        
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
  }, [])

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

  const formatBudget = (budget: number) => {
    return `$${budget.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            Welcome back, Homeowner!
          </CardTitle>
          <CardDescription>
            {userEmail && `You are signed in as ${userEmail}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Manage your home improvement projects and track their progress all in one place.
          </p>
        </CardContent>
      </Card>

      {/* Quick Create Project */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Ready to start a new project?</CardTitle>
          <CardDescription className="text-green-600">
            Post your project details and get proposals from qualified contractors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/homeowner/projects/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>My Projects</span>
              </CardTitle>
              <CardDescription>
                {loading ? 'Loading projects...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
              </CardDescription>
            </div>
            <Link href="/homeowner/projects">
              <Button variant="outline" size="sm">
                View All Projects
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center text-red-600 p-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                      <span className="text-sm font-medium capitalize">{project.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatBudget(project.budget)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                      {project.category.replace('_', ' ')}
                    </span>
                    <Link href={`/homeowner/projects/view/${project.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2 text-gray-600">No projects yet</h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first project to attract qualified contractors.
              </p>
              <Link href="/homeowner/projects/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Project
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}