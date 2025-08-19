'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, Search, Plus, Edit, Trash2, Shield, Home, Wrench } from 'lucide-react'
import { USER_ROLES } from '@/lib/constants'

export default function AdminUsersPage() {

  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      user_role: USER_ROLES.HOMEOWNER,
      status: 'active',
      joinDate: '2024-01-01',
      lastLogin: '2024-01-15',
      projects: 3
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      user_role: USER_ROLES.HOMEOWNER,
      status: 'active',
      joinDate: '2024-01-05',
      lastLogin: '2024-01-14',
      projects: 1
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@example.com',
      user_role: USER_ROLES.CONTRACTOR,
      status: 'active',
      joinDate: '2023-12-15',
      lastLogin: '2024-01-15',
      projects: 5
    },
    {
      id: 4,
      name: 'Lisa Brown',
      email: 'lisa@example.com',
      user_role: USER_ROLES.CONTRACTOR,
      status: 'pending',
      joinDate: '2024-01-10',
      lastLogin: 'Never',
      projects: 0
    },
    {
      id: 5,
      name: 'Admin User',
      email: 'admin@example.com',
      user_role: USER_ROLES.ADMIN,
      status: 'active',
      joinDate: '2023-01-01',
      lastLogin: '2024-01-15',
      projects: 0
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <Shield className="h-4 w-4 text-red-500" />
      case USER_ROLES.HOMEOWNER:
        return <Home className="h-4 w-4 text-blue-500" />
      case USER_ROLES.CONTRACTOR:
        return <Wrench className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gray-900 text-white">Active</Badge>
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-800">Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <Badge className="bg-orange-100 text-orange-800">Admin</Badge>
      case USER_ROLES.HOMEOWNER:
        return <Badge className="bg-gray-100 text-gray-800">Homeowner</Badge>
      case USER_ROLES.CONTRACTOR:
        return <Badge className="bg-gray-100 text-gray-800">Contractor</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.user_role === USER_ROLES.HOMEOWNER).length}</p>
                <p className="text-sm text-gray-600">Homeowners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.user_role === USER_ROLES.CONTRACTOR).length}</p>
                <p className="text-sm text-gray-600">Contractors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.user_role === USER_ROLES.ADMIN).length}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">Filter by Role</Button>
            <Button variant="outline">Filter by Status</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {getRoleIcon(user.user_role)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.user_role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{user.projects}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.joinDate}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
