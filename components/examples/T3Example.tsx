'use client'

import { useState } from 'react'
import { api } from '~/components/providers/TRPCProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { RouterOutputs } from '~/components/providers/TRPCProvider'

type Project = RouterOutputs['projects']['getAll'][0]

export function T3Example() {
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')

  // Example tRPC queries
  const { data: session, isLoading: sessionLoading } = api.auth.getSession.useQuery()
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = api.projects.getAll.useQuery({
    limit: 5,
  })
  const { data: userStats, isLoading: statsLoading } = api.users.getStats.useQuery(
    undefined,
    {
      enabled: !!session?.user,
    }
  )

  // Example tRPC mutations
  const createProjectMutation = api.projects.create.useMutation({
    onSuccess: () => {
      setProjectTitle('')
      setProjectDescription('')
      refetchProjects()
    },
  })

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectTitle.trim() || !projectDescription.trim()) return

    createProjectMutation.mutate({
      project_title: projectTitle,
      statement_of_work: projectDescription,
      category: ['General'],
      budget: 3000,
      pid: 'EXAMPLE-001',
      location: {
        address: 'Example Location',
        city: 'Example City',
        province: 'Example Province',
        postalCode: '12345',
      },
      project_type: 'New Build',
      visibility_settings: 'Public',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      decision_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      project_photos: [{
        id: crypto.randomUUID(),
        filename: 'example.jpg',
        url: 'https://example.com/example.jpg',
        uploadedAt: new Date()
      }],
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>T3 Stack + Supabase Integration</CardTitle>
          <CardDescription>
            This component demonstrates the T3 stack with tRPC, TypeScript, Tailwind CSS, and Supabase integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Status */}
          <div className="flex items-center gap-2">
            <Label>Session Status:</Label>
            {sessionLoading ? (
              <Badge variant="secondary">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            ) : session?.user ? (
              <Badge variant="default">Authenticated</Badge>
            ) : (
              <Badge variant="destructive">Not Authenticated</Badge>
            )}
          </div>

          {/* User Stats */}
          {session?.user && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <Label className="text-sm font-medium">Projects</Label>
                {statsLoading ? (
                  <div className="flex items-center mt-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="mt-1 text-2xl font-bold">
                    {userStats?.projects.total || 0}
                  </div>
                )}
              </div>
              <div className="p-3 border rounded-lg">
                <Label className="text-sm font-medium">Proposals</Label>
                {statsLoading ? (
                  <div className="flex items-center mt-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="mt-1 text-2xl font-bold">
                    {userStats?.proposals.total || 0}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Project Form */}
      {session?.user && (
        <Card>
          <CardHeader>
            <CardTitle>Create Project (tRPC Mutation Example)</CardTitle>
            <CardDescription>
              Demonstrates type-safe mutations with automatic refetching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  disabled={createProjectMutation.isPending}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  disabled={createProjectMutation.isPending}
                />
              </div>
              <Button
                type="submit"
                disabled={createProjectMutation.isPending || !projectTitle.trim() || !projectDescription.trim()}
              >
                {createProjectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
              {createProjectMutation.error && (
                <p className="text-sm text-red-600">
                  Error: {createProjectMutation.error.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects (tRPC Query Example)</CardTitle>
          <CardDescription>
            Demonstrates type-safe queries with automatic caching and refetching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project: Project) => (
                <div key={project.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description.length > 100
                          ? `${project.description.substring(0, 100)}...`
                          : project.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{project.category}</Badge>
                        <Badge variant="secondary">{project.status}</Badge>
                        <span className="text-xs text-gray-500">
                          ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No projects found. Create one above to see it here!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>T3 Stack Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Implemented</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• tRPC with type-safe API calls</li>
                <li>• TypeScript with full type inference</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Supabase for database & auth</li>
                <li>• React Query for caching</li>
                <li>• Zod for validation</li>
                <li>• Environment validation</li>
                <li>• Server-side rendering support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🔧 Architecture</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• End-to-end type safety</li>
                <li>• Automatic API documentation</li>
                <li>• Real-time subscriptions ready</li>
                <li>• Edge runtime compatible</li>
                <li>• Optimistic updates</li>
                <li>• Error handling</li>
                <li>• Authentication middleware</li>
                <li>• Database migrations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}