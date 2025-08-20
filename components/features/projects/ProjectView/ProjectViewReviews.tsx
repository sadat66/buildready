'use client'

import { Project } from '@/types/database/projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  User,
  Calendar,
  FileText
} from 'lucide-react'
import { USER_ROLES, PROJECT_STATUSES } from '@/lib/constants'

interface ProjectViewReviewsProps {
  project: Project
  userRole: typeof USER_ROLES[keyof typeof USER_ROLES]
}

export function ProjectViewReviews({ project, userRole }: ProjectViewReviewsProps) {
  // Mock data - replace with actual review data
  const reviews = [
    {
      id: '1',
      contractor: 'John Smith Construction',
      rating: 5,
      comment: 'Excellent work quality and communication throughout the project. Highly recommended!',
      date: '2024-01-15',
      homeowner: 'Sarah Johnson',
      projectPhase: 'Completed'
    },
    {
      id: '2',
      contractor: 'Mike\'s Renovation Co',
      rating: 4,
      comment: 'Good work but had some delays. Overall satisfied with the final result.',
      date: '2024-01-10',
      homeowner: 'David Wilson',
      projectPhase: 'Completed'
    }
  ]

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-4">
            This project doesn&apos;t have any reviews yet. Reviews will appear here once the project is completed.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Overall Project Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-muted-foreground">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <Progress 
                    value={(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Reviews ({reviews.length})
          </h3>
          
          {userRole === USER_ROLES.HOMEOWNER && project.status === PROJECT_STATUSES.COMPLETED && (
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          )}
        </div>

        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{review.contractor}</h4>
                      <Badge variant="outline" className="text-xs">
                        {review.projectPhase}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{review.homeowner}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(review.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Review Comment */}
                <div>
                  <p className="text-gray-900 leading-relaxed">{review.comment}</p>
                </div>

                {/* Review Actions */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Helpful
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Not Helpful
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2 text-sm">
            <p>• Reviews help other users make informed decisions about contractors</p>
            <p>• Be honest and constructive in your feedback</p>
            <p>• Focus on the quality of work, communication, and timeliness</p>
            <p>• Reviews are moderated to ensure quality and fairness</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
