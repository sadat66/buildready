'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Star, Edit, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || ''
  })
  
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', profile?.id)

      if (error) throw error

      await refreshProfile()
      setIsEditing(false)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const cancelEdit = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      bio: profile?.bio || ''
    })
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., Seattle, WA"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Profile Stats */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{profile?.role}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {profile?.rating || 0}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reviews</span>
                    <span className="text-sm font-medium">{profile?.review_count || 0}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{profile?.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-medium">{profile.phone}</span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location</span>
                        <span className="font-medium">{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600">
                    <p>Member since {new Date(profile?.created_at || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 