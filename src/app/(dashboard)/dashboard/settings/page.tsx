'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Settings, Bell, Shield, Palette, Globe } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  })
  
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'English',
    timezone: 'UTC'
  })

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'darkMode') {
      setPreferences(prev => ({
        ...prev,
        [type]: !prev[type]
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your account preferences and settings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <Switch 
              checked={notifications.email}
              onCheckedChange={() => handleNotificationChange('email')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications in browser</p>
            </div>
            <Switch 
              checked={notifications.push}
              onCheckedChange={() => handleNotificationChange('push')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via SMS</p>
            </div>
            <Switch 
              checked={notifications.sms}
              onCheckedChange={() => handleNotificationChange('sms')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize the look and feel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-600">Switch to dark theme</p>
            </div>
            <Switch 
              checked={preferences.darkMode}
              onCheckedChange={() => handlePreferenceChange('darkMode')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Language & Region</span>
          </CardTitle>
          <CardDescription>
            Set your language and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Language</p>
            <p className="text-sm text-gray-600">Current: {preferences.language}</p>
            <Button variant="outline" size="sm" disabled>
              Change Language (Coming Soon)
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">Timezone</p>
            <p className="text-sm text-gray-600">Current: {preferences.timezone}</p>
            <Button variant="outline" size="sm" disabled>
              Change Timezone (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
          <CardDescription>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" disabled>
            Change Password (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full" disabled>
            Two-Factor Authentication (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full" disabled>
            Download Account Data (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="p-6">
          <Button className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}