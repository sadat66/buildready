'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Review } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { 
  Star,
  User,
  MessageSquare
} from 'lucide-react'

export default function ReviewsPage() {
  const { profile } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(*),
          reviewed:users!reviews_reviewed_id_fkey(*),
          project:projects!reviews_project_id_fkey(*)
        `)
        .or(`reviewer_id.eq.${profile?.id},reviewed_id.eq.${profile?.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
        return
      }

      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    )
  }

  const receivedReviews = reviews.filter(review => review.reviewed_id === profile?.id)
  const givenReviews = reviews.filter(review => review.reviewer_id === profile?.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-2">
          View and manage your reviews and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews Received</CardTitle>
            <CardDescription>
              Reviews from other users about your work
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receivedReviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reviews received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.reviewer?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                    {review.project && (
                      <p className="text-xs text-gray-500">
                        Project: {review.project.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Given Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews Given</CardTitle>
            <CardDescription>
              Reviews you&apos;ve written for other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {givenReviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reviews given yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {givenReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.reviewed?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                    {review.project && (
                      <p className="text-xs text-gray-500">
                        Project: {review.project.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Review Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile?.rating || 0}
              </div>
              <div className="flex justify-center mt-1">
                {renderStars(profile?.rating || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-2">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {receivedReviews.length}
              </div>
              <p className="text-sm text-gray-600 mt-2">Reviews Received</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {givenReviews.length}
              </div>
              <p className="text-sm text-gray-600 mt-2">Reviews Given</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 