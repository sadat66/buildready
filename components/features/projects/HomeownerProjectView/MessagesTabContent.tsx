"use client";

import { useState } from "react";

import { User } from "@/types/database/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  AlertCircle,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";


interface ProjectViewMessagesProps {
  user: User;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: "homeowner" | "contractor";
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  attachments?: Array<{
    id: string;
    filename: string;
    type: "image" | "document";
    url: string;
  }>;
  isRead: boolean;
}

export function MessagesTabContent({
  user,
}: ProjectViewMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock messages - replace with actual data
  const messages: Message[] = [
    {
      id: "1",
      sender: {
        id: "contractor1",
        name: "John Smith Construction",
        role: "contractor",
      },
      content:
        "Hi! I've reviewed your project requirements and have a few questions about the timeline. Would it be possible to discuss this over a call?",
      timestamp: new Date("2024-01-15T10:30:00"),
      isRead: true,
    },
    {
      id: "2",
      sender: {
        id: user.id,
        name: user.full_name || "Homeowner",
        role: "homeowner",
      },
      content:
        "Absolutely! I'm available tomorrow between 2-4 PM. What specific questions do you have about the timeline?",
      timestamp: new Date("2024-01-15T14:15:00"),
      isRead: true,
    },
    {
      id: "3",
      sender: {
        id: "contractor1",
        name: "John Smith Construction",
        role: "contractor",
      },
      content:
        "Great! I'll call you tomorrow at 2 PM. I also wanted to share some photos of similar projects I've completed.",
      timestamp: new Date("2024-01-15T16:45:00"),
      attachments: [
        {
          id: "att1",
          filename: "kitchen-renovation-1.jpg",
          type: "image",
          url: "/sample-image-1.jpg",
        },
        {
          id: "att2",
          filename: "project-specs.pdf",
          type: "document",
          url: "/sample-doc.pdf",
        },
      ],
      isRead: false,
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (
      messageDate.toDateString() ===
      new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
    ) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedFile) return;

    // Implement message sending logic here
    console.log("Sending message:", {
      content: newMessage,
      file: selectedFile,
    });

    setNewMessage("");
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const getUnreadCount = () => {
    return messages.filter((msg) => !msg.isRead && msg.sender.id !== user.id)
      .length;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Messages Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Project Messages</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Communicate with project stakeholders
              </p>
            </div>
            
            {getUnreadCount() > 0 && (
              <Badge className="bg-orange-500 text-white w-fit">
                {getUnreadCount()} unread
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Messages Thread */}
      <Card className="h-80 sm:h-96 flex flex-col">
        <CardHeader className="pb-3 border-b p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            <span className="font-medium text-sm sm:text-base">Project Discussion</span>
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          {/* Messages List */}
          <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md px-4">
                  Start the conversation by sending the first message to contractors or other project stakeholders.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 sm:gap-3",
                    message.sender.id === user.id ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar */}
                  {message.sender.id !== user.id && (
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message Content */}
                  <div className={cn(
                    "max-w-[calc(100%-3rem)] sm:max-w-xs lg:max-w-md space-y-1 sm:space-y-2",
                    message.sender.id === user.id ? "items-end" : "items-start"
                  )}>
                    {/* Message Header */}
                    <div className={cn(
                      "flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground",
                      message.sender.id === user.id ? "justify-end" : "justify-start"
                    )}>
                      <span className="font-medium text-xs">{message.sender.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {!message.isRead && message.sender.id !== user.id && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-orange-500 text-xs">Unread</span>
                        </>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={cn(
                      "rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
                      message.sender.id === user.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-1 sm:space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={cn(
                              "flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg border text-xs",
                              message.sender.id === user.id
                                ? "bg-orange-50 border-orange-200"
                                : "bg-gray-50 border-gray-200"
                            )}
                          >
                            {attachment.type === 'image' ? (
                              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            ) : (
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            )}
                            <span className="truncate text-xs">{attachment.filename}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 ml-auto"
                              onClick={() => window.open(attachment.url, '_blank')}
                            >
                              <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Date Separator */}
                    {index === 0 || 
                     formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp) ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="text-xs">{formatDate(message.timestamp)}</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                      </div>
                    ) : null}
                  </div>

                  {/* Avatar for own messages */}
                  {message.sender.id === user.id && (
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <AvatarImage src={user.profile_photo} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>

        {/* Message Input */}
        <div className="p-3 sm:p-4 border-t bg-gray-50">
          <div className="space-y-2 sm:space-y-3">
            {/* File Attachment Preview */}
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-700 truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 ml-auto text-red-500 hover:text-red-700"
                  onClick={removeSelectedFile}
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[60px] sm:min-h-[80px] resize-none text-xs sm:text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-500 hover:text-gray-700"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Message Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg text-blue-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            Message Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 p-4 sm:p-6 pt-0">
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <p>• Keep messages professional and constructive</p>
            <p>• Use attachments to share project files and photos</p>
            <p>• Respond promptly to maintain good communication</p>
            <p>• All messages are logged for project records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
