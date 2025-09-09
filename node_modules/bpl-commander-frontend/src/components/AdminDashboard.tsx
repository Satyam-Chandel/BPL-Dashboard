import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { centralizedDb, CentralizedUser } from '../utils/centralizedDb'
import { DashboardAnalytics } from './DashboardAnalytics'
import { ActivityFeed } from './ActivityFeed'
import { ExportSystem } from './ExportSystem'
import { RoleManagement } from './RoleManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { 
  Users, 
  UserPlus, 
  Activity, 
  Building, 
  Info, 
  Eye, 
  EyeOff,
  Download,
  Search,
  Filter,
  Shield,
  Clock,
  Mail,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'
import { CurrencySelector } from './CurrencySelector'
import { ApiTester } from './ApiTester'

export function AdminDashboard() {
  const [users, setUsers] = useState<CentralizedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<CentralizedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showExportSystem, setShowExportSystem] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user: currentUser } = useAuth()

  // Enhanced form state
  const [formData, setFormData] = useState({
    email: '',
    password: 'defaultpass123',
    name: '',
    role: '',
    designation: '',
    managerId: '',
    department: '',
    skills: '',
    phoneNumber: '',
    timezone: 'UTC',
    preferredCurrency: 'USD',
    workloadCap: 100,
    overBeyondCap: 20,
    notificationSettings: {
      email: true,
      inApp: true,
      projectUpdates: true,
      deadlineReminders: true,
      weeklyReports: false
    }
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      // Get the access token from localStorage
      const token = localStorage.getItem('bpl-token')
      if (!token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.data) {
        // Convert API response to match the expected format
        const usersData = data.data.map((user: any) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          designation: user.designation,
          managerId: user.managerId,
          department: user.department,
          skills: user.skills || [],
          workloadCap: user.workloadCap,
          overBeyondCap: user.overBeyondCap,
          phoneNumber: user.phoneNumber,
          timezone: user.timezone,
          preferredCurrency: user.preferredCurrency,
          notificationSettings: user.notificationSettings,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt
        }))
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
      // Fallback to demo data if API fails
      const usersData = centralizedDb.getUsers()
      setUsers(usersData)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        (user.name?.toLowerCase() || '').includes(query) ||
        (user.email?.toLowerCase() || '').includes(query) ||
        (user.designation?.toLowerCase() || '').includes(query) ||
        (user.department?.toLowerCase() || '').includes(query) ||
        (user.skills || []).some(skill => (skill?.toLowerCase() || '').includes(query))
      )
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }

    setFilteredUsers(filtered)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: 'defaultpass123',
      name: '',
      role: '',
      designation: '',
      managerId: '',
      department: '',
      skills: '',
      phoneNumber: '',
      timezone: 'UTC',
      preferredCurrency: 'USD',
      workloadCap: 100,
      overBeyondCap: 20,
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: false
      }
    })
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return

    try {
      // Check if user with email already exists
      const existingUser = users.find(u => u.email === formData.email)
      if (existingUser) {
        toast.error('A user with this email already exists')
        return
      }

      // Get the access token
      const token = localStorage.getItem('bpl-token')
      if (!token) {
        toast.error('No authentication token found')
        return
      }

      // Prepare user data for API
      const userData = {
        email: formData.email,
        name: formData.name,
        password: formData.password || 'password123',
        role: formData.role.toLowerCase(), // API expects lowercase roles
        designation: formData.designation,
        managerId: formData.managerId || undefined,
        department: formData.department || 'General',
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        workloadCap: formData.workloadCap,
        overBeyondCap: formData.overBeyondCap,
        phoneNumber: formData.phoneNumber || undefined,
        timezone: formData.timezone,
        preferredCurrency: formData.preferredCurrency,
        notificationSettings: formData.notificationSettings
      }

      console.log('🌐 Creating user via API:', userData)

      // Make API call to create user
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()
      console.log('📡 API Response:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (data.success && data.data) {
        // Convert API response to match the expected format
        const newUser: CentralizedUser = {
          id: data.data.user.id,
          email: data.data.user.email,
          name: data.data.user.name,
          role: data.data.user.role,
          designation: data.data.user.designation,
          managerId: data.data.user.managerId,
          department: data.data.user.department,
          skills: userData.skills,
          workloadCap: userData.workloadCap,
          overBeyondCap: userData.overBeyondCap,
          phoneNumber: userData.phoneNumber,
          timezone: userData.timezone,
          preferredCurrency: userData.preferredCurrency,
          notificationSettings: userData.notificationSettings,
          isActive: true,
          password: formData.password, // Add password for type compatibility
          createdAt: new Date().toISOString()
        }

        setUsers([...users, newUser])
        toast.success(`User "${newUser.name}" created successfully! Login: ${newUser.email} / ${formData.password}`)
        
        resetForm()
        setShowAddUser(false)
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    if (!currentUser) return
    
    const user = users.find(u => u.id === userId)
    if (!user) return

    try {
      // Get the access token
      const token = localStorage.getItem('bpl-token')
      if (!token) {
        toast.error('No authentication token found')
        return
      }

      const action = user.isActive ? 'deactivate' : 'activate'
      console.log(`🌐 ${action}ing user ${user.email}`)

      // Make API call to update user status using the action-based endpoint
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: action,
          id: userId
        })
      })

      const data = await response.json()
      console.log('📡 API Response:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (data.success) {
        // Update the user in the local state based on the action performed
        const newActiveStatus = action === 'activate'
        console.log(`✅ User ${user.email}: ${user.isActive} -> ${newActiveStatus}`)
        
        const updatedUser: CentralizedUser = {
          ...user,
          isActive: newActiveStatus
        }
        
        setUsers(users.map(u => u.id === userId ? updatedUser : u))
        toast.success(`User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`)
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error(`Failed to ${user.isActive ? 'deactivate' : 'activate'} user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const updateFormField = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const managers = users.filter(user => 
    user.role === 'manager' || user.role === 'program_manager' || user.role === 'rd_manager'
  )

  const roleColors = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    program_manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    rd_manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    employee: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'program_manager':
        return 'Program Manager'
      case 'rd_manager':
        return 'R&D Manager'
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  const hasActiveFilters = searchQuery || roleFilter !== 'all' || statusFilter !== 'all'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and analytics, welcome {currentUser?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowExportSystem(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => ['program_manager', 'rd_manager', 'manager'].includes(u.role)).length}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'employee').length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-primary">{users.filter(u => u.isActive).length}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">User Management ({users.length})</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="api">API Tester</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                System Users
              </CardTitle>
              <CardDescription>
                Manage all users in the BPL Commander system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name, email, department, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="program_manager">Program Manager</SelectItem>
                        <SelectItem value="rd_manager">R&D Manager</SelectItem>
                        <SelectItem value="manager">Team Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredUsers.length} of {users.length} users
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const workload = centralizedDb.getEmployeeWorkload(user.id)
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-medium text-primary">{user.name.charAt(0)}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{user.name}</p>
                            <Badge className={roleColors[user.role]}>
                              {getRoleDisplay(user.role)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phoneNumber && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phoneNumber}
                              </div>
                            )}
                            {user.department && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {user.department}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.designation}</p>
                          {user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {user.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Workload indicator for employees */}
                        {(user.role === 'employee' || user.role === 'manager') && (
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Workload</p>
                            <p className={`font-medium ${
                              workload.totalWorkload > 100 ? 'text-red-600' :
                              workload.totalWorkload > 80 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {workload.totalWorkload.toFixed(1)}%
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => toggleUserStatus(user.id)}
                            disabled={user.id === currentUser?.id}
                          />
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredUsers.length === 0 && users.length > 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No users match your filters</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DashboardAnalytics />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityFeed showUserFilter={true} maxItems={50} />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiTester />
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account in the BPL Commander system
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddUser} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormField('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormField('password', e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  User can change this password after first login
                </p>
              </div>
            </div>

            {/* Role and Organization */}
            <div className="space-y-4">
              <h3 className="font-medium">Role & Organization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => updateFormField('role', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="program_manager">Program Manager</SelectItem>
                      <SelectItem value="rd_manager">R&D Manager</SelectItem>
                      <SelectItem value="manager">Team Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => updateFormField('designation', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateFormField('department', e.target.value)}
                    placeholder="e.g., Development, Operations, R&D"
                  />
                </div>
                {(formData.role === 'employee' || formData.role === 'manager') && (
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Select value={formData.managerId} onValueChange={(value) => updateFormField('managerId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({getRoleDisplay(manager.role)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Contact & Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact & Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormField('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => updateFormField('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <CurrencySelector
                    value={formData.preferredCurrency}
                    onValueChange={(value) => updateFormField('preferredCurrency', value)}
                  />
                </div>
              </div>
            </div>

            {/* Skills & Workload */}
            <div className="space-y-4">
              <h3 className="font-medium">Skills & Workload Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => updateFormField('skills', e.target.value)}
                  placeholder="e.g., React, Node.js, Python, Project Management"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workloadCap">Maximum Workload (%)</Label>
                  <Input
                    id="workloadCap"
                    type="number"
                    min="50"
                    max="120"
                    value={formData.workloadCap}
                    onChange={(e) => updateFormField('workloadCap', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overBeyondCap">Over & Beyond Cap (%)</Label>
                  <Input
                    id="overBeyondCap"
                    type="number"
                    min="10"
                    max="30"
                    value={formData.overBeyondCap}
                    onChange={(e) => updateFormField('overBeyondCap', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Notification Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={formData.notificationSettings.email}
                    onCheckedChange={(checked) => updateFormField('notificationSettings.email', checked)}
                  />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="in-app-notifications"
                    checked={formData.notificationSettings.inApp}
                    onCheckedChange={(checked) => updateFormField('notificationSettings.inApp', checked)}
                  />
                  <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="project-updates"
                    checked={formData.notificationSettings.projectUpdates}
                    onCheckedChange={(checked) => updateFormField('notificationSettings.projectUpdates', checked)}
                  />
                  <Label htmlFor="project-updates">Project Updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="deadline-reminders"
                    checked={formData.notificationSettings.deadlineReminders}
                    onCheckedChange={(checked) => updateFormField('notificationSettings.deadlineReminders', checked)}
                  />
                  <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ExportSystem 
        isOpen={showExportSystem} 
        onClose={() => setShowExportSystem(false)} 
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>BPL Commander Admin:</strong> Manage users, projects, and system settings. 
          User data is stored in the database and persists across sessions. 
          New users can login with their credentials immediately after creation.
        </AlertDescription>
      </Alert>
    </div>
  )
}