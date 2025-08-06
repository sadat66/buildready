'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    location: '',
    category: '',
    deadline: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not homeowner
  if (profile?.role !== 'homeowner') {
    router.push('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            homeowner_id: profile.id,
            title: formData.title,
            description: formData.description,
            budget_min: parseFloat(formData.budget_min),
            budget_max: parseFloat(formData.budget_max),
            location: formData.location,
            category: formData.category,
            deadline: formData.deadline || null,
            status: 'open'
          }
        ])

      if (error) throw error

      router.push('/dashboard/projects')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Describe your project to attract qualified contractors
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide detailed information about your construction project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Kitchen Renovation, Deck Construction"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project in detail, including specific requirements, materials, and any special considerations..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Budget ($) *
                </label>
                <Input
                  id="budget_min"
                  name="budget_min"
                  type="number"
                  required
                  min="0"
                  value={formData.budget_min}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Budget ($) *
                </label>
                <Input
                  id="budget_max"
                  name="budget_max"
                  type="number"
                  required
                  min="0"
                  value={formData.budget_max}
                  onChange={handleChange}
                  placeholder="15000"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Downtown Seattle, WA"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Project Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="kitchen">Kitchen Remodel</option>
                <option value="bathroom">Bathroom Remodel</option>
                <option value="deck">Deck & Patio</option>
                <option value="roofing">Roofing</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="painting">Painting</option>
                <option value="landscaping">Landscaping</option>
                <option value="basement">Basement Finishing</option>
                <option value="addition">Home Addition</option>
                <option value="repair">Repairs & Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Completion Date
              </label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: Set a target completion date for your project
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating Project...' : 'Create Project'}
              </Button>
              <Link href="/dashboard/projects">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 