'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Message, User as UserType } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { 
  Search, 
  Send,
  User,
  MessageSquare
} from 'lucide-react'

export default function MessagesPage() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*),
          receiver:users!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${profile?.id},receiver_id.eq.${profile?.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: profile?.id,
            receiver_id: selectedUser,
            content: newMessage.trim()
          }
        ])

      if (error) throw error

      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Get unique conversations
  const conversations = messages.reduce((acc, message) => {
    const otherUserId = message.sender_id === profile?.id ? message.receiver_id : message.sender_id
    const otherUser = message.sender_id === profile?.id ? message.receiver : message.sender
    
    if (!acc[otherUserId] && otherUser) {
      acc[otherUserId] = {
        user: otherUser,
        lastMessage: message,
        unreadCount: 0
      }
    }
    
    return acc
  }, {} as Record<string, { user: UserType; lastMessage: Message; unreadCount: number }>)

  const filteredConversations = Object.values(conversations).filter((conv) => 
    conv.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          Communicate with contractors and homeowners
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      onClick={() => setSelectedUser(conversation.user.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser === conversation.user.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.user.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(conversation.lastMessage.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedUser ? 
                  conversations[selectedUser]?.user.full_name : 
                  'Select a conversation'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto space-y-4">
                    {messages
                      .filter(msg => 
                        (msg.sender_id === profile?.id && msg.receiver_id === selectedUser) ||
                        (msg.sender_id === selectedUser && msg.receiver_id === profile?.id)
                      )
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === profile?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === profile?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Send Message */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a conversation to start messaging</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 