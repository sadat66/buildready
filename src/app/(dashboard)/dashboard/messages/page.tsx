'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageSquare, Send, Clock, User } from 'lucide-react'
import Link from 'next/link'

export default function MessagesPage() {
  // Mock messages data
  const messages = [
    {
      id: 1,
      sender: 'John Doe',
      subject: 'Project Update Required',
      preview: 'Hi, I wanted to follow up on the website redesign project. Could you please provide an update on the current progress?',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false
    },
    {
      id: 2,
      sender: 'Sarah Wilson',
      subject: 'Meeting Scheduled',
      preview: 'I have scheduled a meeting for tomorrow at 2 PM to discuss the mobile app requirements. Please confirm your availability.',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: true
    },
    {
      id: 3,
      sender: 'Mike Johnson',
      subject: 'Database Migration Complete',
      preview: 'Great news! The database migration has been completed successfully. All systems are now running on the new infrastructure.',
      timestamp: '2024-01-14T16:45:00Z',
      isRead: true
    }
  ]

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
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
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <MessageSquare className="h-6 w-6" />
            <span>Messages</span>
          </CardTitle>
          <CardDescription>
            View and manage your messages
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className={`hover:shadow-md transition-shadow cursor-pointer ${
            !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className={`text-sm font-medium ${
                        !message.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {message.sender}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                    {!message.isRead && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <h3 className={`text-lg mb-2 ${
                    !message.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
                  }`}>
                    {message.subject}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {message.preview}
                  </p>
                </div>
                
                <div className="ml-4">
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no messages) */}
      {messages.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
            <p className="text-gray-600 mb-4">You&apos;re all caught up! No new messages to display.</p>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send a Message
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}