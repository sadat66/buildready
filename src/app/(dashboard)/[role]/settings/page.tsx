'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Shield, Globe, Save } from 'lucide-react'

export default function SettingsPage() {

  const notificationSettings = [
    {
      id: 'email_notifications',
      name: 'Email Notifications',
      description: 'Receive notifications via email',
      enabled: true
    },
    {
      id: 'push_notifications',
      name: 'Push Notifications',
      description: 'Receive push notifications in browser',
      enabled: false
    },
    {
      id: 'project_updates',
      name: 'Project Updates',
      description: 'Get notified about project progress',
      enabled: true
    },
    {
      id: 'proposal_alerts',
      name: 'Proposal Alerts',
      description: 'Get notified about new proposals',
      enabled: true
    },
    {
      id: 'message_notifications',
      name: 'Message Notifications',
      description: 'Get notified about new messages',
      enabled: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your account preferences and settings</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>Choose how and when you want to be notified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{setting.name}</h3>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <Switch 
                  defaultChecked={setting.enabled}
                  className="ml-4"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Privacy Settings</span>
          </CardTitle>
          <CardDescription>Control your privacy and data sharing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Profile Visibility</h3>
              <p className="text-sm text-gray-600">Allow other users to see your profile information</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Project Sharing</h3>
              <p className="text-sm text-gray-600">Allow contractors to see your project details</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Analytics Data</h3>
              <p className="text-sm text-gray-600">Share anonymous usage data to improve the platform</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-500" />
            <span>Display Settings</span>
          </CardTitle>
          <CardDescription>Customize how the platform looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input id="theme" defaultValue="Light" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" defaultValue="English" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="UTC" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_format">Date Format</Label>
              <Input id="date_format" defaultValue="MM/DD/YYYY" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save All Changes</span>
        </Button>
      </div>
    </div>
  )
}
