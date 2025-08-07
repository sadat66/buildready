'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Plus, Calendar, User } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  // Mock project data
  const projects = [
    {
      id: 1,
      title: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      status: 'In Progress',
      createdAt: '2024-01-15',
      statusColor: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android',
      status: 'Planning',
      createdAt: '2024-01-10',
      statusColor: 'bg-yellow-500'
    },
    {
      id: 3,
      title: 'Database Migration',
      description: 'Migrate legacy database to modern cloud infrastructure',
      status: 'Completed',
      createdAt: '2024-01-05',
      statusColor: 'bg-green-500'
    }
  ]

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <FileText className="h-6 w-6" />
            <span>Projects</span>
          </CardTitle>
          <CardDescription>
            Manage and track your projects
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs text-white ${project.statusColor}`}>
                  {project.status}
                </div>
              </div>
              <CardDescription>
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Owner: You</span>
                </div>
                <div className="pt-2">
                  <Button className="w-full" variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no projects) */}
      {projects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}