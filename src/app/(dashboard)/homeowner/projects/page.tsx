'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function HomeownerProjectsPage() {
  const { user } = useAuth()

  const projects = [
    {
      id: 1,
      title: 'Kitchen Renovation',
      description: 'Complete kitchen remodel with new cabinets and countertops',
      status: 'In Progress',
      budget: '$25,000',
      startDate: '2024-01-15',
      contractor: 'ABC Construction'
    },
    {
      id: 2,
      title: 'Bathroom Update',
      description: 'Modernize master bathroom with new fixtures',
      status: 'Planning',
      budget: '$15,000',
      startDate: '2024-03-01',
      contractor: 'XYZ Remodeling'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600">Manage your home improvement projects</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Start: {project.startDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>Budget: {project.budget}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Contractor:</span> {project.contractor}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Message Contractor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Start your first home improvement project</p>
            <Button>Create Your First Project</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
