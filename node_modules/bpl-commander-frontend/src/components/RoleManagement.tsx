import React, { useState, useEffect } from 'react'
import { centralizedDb, CentralizedUser } from '../utils/centralizedDb'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Switch } from './ui/switch'
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Key,
  Briefcase,
  UserCog
} from 'lucide-react'
import { toast } from 'sonner'

interface CustomRole {
  id: string
  name: string
  displayName: string
  description: string
  permissions: {
    // Project permissions
    canCreateProjects: boolean
    canEditAllProjects: boolean
    canDeleteProjects: boolean
    canAssignEmployees: boolean
    canEditProgress: boolean
    
    // Initiative permissions
    canCreateInitiatives: boolean
    canAssignInitiatives: boolean
    canApproveInitiatives: boolean
    
    // User management
    canViewAllUsers: boolean
    canCreateUsers: boolean
    canEditUsers: boolean
    canDeactivateUsers: boolean
    
    // System administration
    canAccessAnalytics: boolean
    canExportData: boolean
    canManageSettings: boolean
    canViewActivityLog: boolean
    canManageRoles: boolean
  }
  workloadCap: number
  overBeyondCap: number
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

const defaultPermissions = {
  canCreateProjects: false,
  canEditAllProjects: false,
  canDeleteProjects: false,
  canAssignEmployees: false,
  canEditProgress: false,
  canCreateInitiatives: false,
  canAssignInitiatives: false,
  canApproveInitiatives: false,
  canViewAllUsers: false,
  canCreateUsers: false,
  canEditUsers: false,
  canDeactivateUsers: false,
  canAccessAnalytics: false,
  canExportData: false,
  canManageSettings: false,
  canViewActivityLog: false,
  canManageRoles: false
}

export function RoleManagement() {
  const { user: currentUser } = useAuth()
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])
  const [users, setUsers] = useState<CentralizedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null)

  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: { ...defaultPermissions },
    workloadCap: 100,
    overBeyondCap: 20
  })

  // Check if current user can manage roles
  const canManageRoles = currentUser && (
    currentUser.role === 'admin'
  )

  useEffect(() => {
    if (canManageRoles) {
      loadData()
    }
  }, [canManageRoles])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load custom roles from localStorage or initialize
      const storedRoles = localStorage.getItem('bpl-custom-roles')
      if (storedRoles) {
        setCustomRoles(JSON.parse(storedRoles))
      }
      
      // Load users
      setUsers(centralizedDb.getUsers())
    } catch (error) {
      console.error('Error loading role management data:', error)
      toast.error('Failed to load role management data')
    } finally {
      setLoading(false)
    }
  }

  const saveRolesToStorage = (roles: CustomRole[]) => {
    localStorage.setItem('bpl-custom-roles', JSON.stringify(roles))
  }

  const resetForm = () => {
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      permissions: { ...defaultPermissions },
      workloadCap: 100,
      overBeyondCap: 20
    })
    setEditingRole(null)
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !canManageRoles) return

    // Validate form
    if (!roleForm.name.trim() || !roleForm.displayName.trim()) {
      toast.error('Role name and display name are required')
      return
    }

    // Check if role name already exists
    const existingRole = customRoles.find(r => 
      r.name.toLowerCase() === roleForm.name.toLowerCase().replace(/\s+/g, '_')
    )
    
    if (existingRole) {
      toast.error('A role with this name already exists')
      return
    }

    const newRole: CustomRole = {
      id: `custom-role-${Date.now()}`,
      name: roleForm.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: roleForm.displayName,
      description: roleForm.description,
      permissions: roleForm.permissions,
      workloadCap: roleForm.workloadCap,
      overBeyondCap: roleForm.overBeyondCap,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id
    }

    const updatedRoles = [...customRoles, newRole]
    setCustomRoles(updatedRoles)
    saveRolesToStorage(updatedRoles)

    // Log activity
    centralizedDb.logActivity(
      currentUser.id,
      'CREATE_CUSTOM_ROLE',
      'user',
      newRole.id,
      `Created custom role: ${newRole.displayName}`
    )

    toast.success(`Custom role "${newRole.displayName}" created successfully!`)
    resetForm()
    setShowCreateRole(false)
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !canManageRoles || !editingRole) return

    const updatedRole: CustomRole = {
      ...editingRole,
      displayName: roleForm.displayName,
      description: roleForm.description,
      permissions: roleForm.permissions,
      workloadCap: roleForm.workloadCap,
      overBeyondCap: roleForm.overBeyondCap,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id
    }

    const updatedRoles = customRoles.map(r => r.id === editingRole.id ? updatedRole : r)
    setCustomRoles(updatedRoles)
    saveRolesToStorage(updatedRoles)

    // Log activity
    centralizedDb.logActivity(
      currentUser.id,
      'UPDATE_CUSTOM_ROLE',
      'user',
      editingRole.id,
      `Updated custom role: ${updatedRole.displayName}`
    )

    toast.success(`Role "${updatedRole.displayName}" updated successfully!`)
    resetForm()
  }

  const handleDeleteRole = (roleId: string) => {
    if (!currentUser || !canManageRoles) return

    const role = customRoles.find(r => r.id === roleId)
    if (!role) return

    // Check if any users have this role
    const usersWithRole = users.filter(u => u.role === role.name)
    if (usersWithRole.length > 0) {
      toast.error(`Cannot delete role: ${usersWithRole.length} users are assigned to this role`)
      return
    }

    const updatedRoles = customRoles.filter(r => r.id !== roleId)
    setCustomRoles(updatedRoles)
    saveRolesToStorage(updatedRoles)

    // Log activity
    centralizedDb.logActivity(
      currentUser.id,
      'DELETE_CUSTOM_ROLE',
      'user',
      roleId,
      `Deleted custom role: ${role.displayName}`
    )

    toast.success(`Role "${role.displayName}" deleted successfully!`)
  }

  const handleToggleRole = (roleId: string) => {
    if (!currentUser || !canManageRoles) return

    const updatedRoles = customRoles.map(r => 
      r.id === roleId 
        ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString(), updatedBy: currentUser.id }
        : r
    )
    
    setCustomRoles(updatedRoles)
    saveRolesToStorage(updatedRoles)

    const role = updatedRoles.find(r => r.id === roleId)
    toast.success(`Role "${role?.displayName}" ${role?.isActive ? 'activated' : 'deactivated'}`)
  }

  const startEditing = (role: CustomRole) => {
    setEditingRole(role)
    setRoleForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: { ...role.permissions },
      workloadCap: role.workloadCap,
      overBeyondCap: role.overBeyondCap
    })
  }

  const updatePermission = (permission: keyof typeof defaultPermissions, value: boolean) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  const getBuiltInRoles = () => [
    { name: 'admin', displayName: 'Administrator', description: 'Full system access', userCount: users.filter(u => u.role === 'admin').length },
    { name: 'program_manager', displayName: 'Program Manager', description: 'Manages programs and projects', userCount: users.filter(u => u.role === 'program_manager').length },
    { name: 'rd_manager', displayName: 'R&D Manager', description: 'Research and development management', userCount: users.filter(u => u.role === 'rd_manager').length },
    { name: 'manager', displayName: 'Team Manager', description: 'Manages team members and local projects', userCount: users.filter(u => u.role === 'manager').length },
    { name: 'employee', displayName: 'Employee', description: 'Standard employee access', userCount: users.filter(u => u.role === 'employee').length }
  ]

  if (!canManageRoles) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3>Access Denied</h3>
          <p className="text-muted-foreground">
            Only system administrators can manage roles.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading role management...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">Create and manage custom roles with specific permissions</p>
        </div>
        <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Role
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Built-in Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Built-in System Roles
          </CardTitle>
          <CardDescription>
            Standard roles that come with BPL Commander (cannot be modified)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getBuiltInRoles().map((role) => (
              <div key={role.name} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">Built-in</Badge>
                  <span className="text-sm text-muted-foreground">{role.userCount} users</span>
                </div>
                <h4 className="font-medium">{role.displayName}</h4>
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Custom Roles ({customRoles.length})
          </CardTitle>
          <CardDescription>
            Custom roles created for your organization's specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customRoles.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3>No Custom Roles Created</h3>
              <p className="text-muted-foreground mb-4">
                Create custom roles with specific permissions for your organization
              </p>
              <Button onClick={() => setShowCreateRole(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Custom Role
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {customRoles.map((role) => {
                const usersWithRole = users.filter(u => u.role === role.name).length
                const activePermissions = Object.values(role.permissions).filter(Boolean).length
                
                return (
                  <div key={role.id} className="border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{role.displayName}</h4>
                          <Badge variant={role.isActive ? "default" : "secondary"}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Users: </span>
                            <span>{usersWithRole}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Permissions: </span>
                            <span>{activePermissions}/17</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Workload Cap: </span>
                            <span>{role.workloadCap}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Over & Beyond: </span>
                            <span>{role.overBeyondCap}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={role.isActive}
                          onCheckedChange={() => handleToggleRole(role.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={usersWithRole > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Role Dialog */}
      <Dialog 
        open={showCreateRole || !!editingRole} 
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateRole(false)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `Edit Role: ${editingRole.displayName}` : 'Create Custom Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole 
                ? 'Modify the permissions and settings for this custom role'
                : 'Define a new custom role with specific permissions for your organization'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={roleForm.displayName}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Senior Developer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">System Name *</Label>
                  <Input
                    id="name"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., senior_developer"
                    disabled={!!editingRole}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {editingRole ? 'System name cannot be changed' : 'Used internally (lowercase, underscores only)'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the responsibilities and scope of this role"
                  rows={3}
                />
              </div>
            </div>

            {/* Workload Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Workload Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workloadCap">Maximum Workload (%)</Label>
                  <Input
                    id="workloadCap"
                    type="number"
                    min="0"
                    max="200"
                    value={roleForm.workloadCap}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, workloadCap: parseInt(e.target.value) || 100 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overBeyondCap">Over & Beyond Cap (%)</Label>
                  <Input
                    id="overBeyondCap"
                    type="number"
                    min="0"
                    max="50"
                    value={roleForm.overBeyondCap}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, overBeyondCap: parseInt(e.target.value) || 20 }))}
                  />
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="font-medium">Permissions</h3>
              
              <div className="space-y-6">
                {/* Project Permissions */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Project Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canCreateProjects" className="text-sm">Create Projects</Label>
                      <Switch
                        id="canCreateProjects"
                        checked={roleForm.permissions.canCreateProjects}
                        onCheckedChange={(value) => updatePermission('canCreateProjects', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canEditAllProjects" className="text-sm">Edit All Projects</Label>
                      <Switch
                        id="canEditAllProjects"
                        checked={roleForm.permissions.canEditAllProjects}
                        onCheckedChange={(value) => updatePermission('canEditAllProjects', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canDeleteProjects" className="text-sm">Delete Projects</Label>
                      <Switch
                        id="canDeleteProjects"
                        checked={roleForm.permissions.canDeleteProjects}
                        onCheckedChange={(value) => updatePermission('canDeleteProjects', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canAssignEmployees" className="text-sm">Assign Employees</Label>
                      <Switch
                        id="canAssignEmployees"
                        checked={roleForm.permissions.canAssignEmployees}
                        onCheckedChange={(value) => updatePermission('canAssignEmployees', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canEditProgress" className="text-sm">Edit Project Progress</Label>
                      <Switch
                        id="canEditProgress"
                        checked={roleForm.permissions.canEditProgress}
                        onCheckedChange={(value) => updatePermission('canEditProgress', value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Initiative Permissions */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Initiative Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canCreateInitiatives" className="text-sm">Create Initiatives</Label>
                      <Switch
                        id="canCreateInitiatives"
                        checked={roleForm.permissions.canCreateInitiatives}
                        onCheckedChange={(value) => updatePermission('canCreateInitiatives', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canAssignInitiatives" className="text-sm">Assign Initiatives</Label>
                      <Switch
                        id="canAssignInitiatives"
                        checked={roleForm.permissions.canAssignInitiatives}
                        onCheckedChange={(value) => updatePermission('canAssignInitiatives', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canApproveInitiatives" className="text-sm">Approve Initiatives</Label>
                      <Switch
                        id="canApproveInitiatives"
                        checked={roleForm.permissions.canApproveInitiatives}
                        onCheckedChange={(value) => updatePermission('canApproveInitiatives', value)}
                      />
                    </div>
                  </div>
                </div>

                {/* User Management Permissions */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    User Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canViewAllUsers" className="text-sm">View All Users</Label>
                      <Switch
                        id="canViewAllUsers"
                        checked={roleForm.permissions.canViewAllUsers}
                        onCheckedChange={(value) => updatePermission('canViewAllUsers', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canCreateUsers" className="text-sm">Create Users</Label>
                      <Switch
                        id="canCreateUsers"
                        checked={roleForm.permissions.canCreateUsers}
                        onCheckedChange={(value) => updatePermission('canCreateUsers', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canEditUsers" className="text-sm">Edit Users</Label>
                      <Switch
                        id="canEditUsers"
                        checked={roleForm.permissions.canEditUsers}
                        onCheckedChange={(value) => updatePermission('canEditUsers', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canDeactivateUsers" className="text-sm">Deactivate Users</Label>
                      <Switch
                        id="canDeactivateUsers"
                        checked={roleForm.permissions.canDeactivateUsers}
                        onCheckedChange={(value) => updatePermission('canDeactivateUsers', value)}
                      />
                    </div>
                  </div>
                </div>

                {/* System Administration */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    System Administration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canAccessAnalytics" className="text-sm">Access Analytics</Label>
                      <Switch
                        id="canAccessAnalytics"
                        checked={roleForm.permissions.canAccessAnalytics}
                        onCheckedChange={(value) => updatePermission('canAccessAnalytics', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canExportData" className="text-sm">Export Data</Label>
                      <Switch
                        id="canExportData"
                        checked={roleForm.permissions.canExportData}
                        onCheckedChange={(value) => updatePermission('canExportData', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canManageSettings" className="text-sm">Manage Settings</Label>
                      <Switch
                        id="canManageSettings"
                        checked={roleForm.permissions.canManageSettings}
                        onCheckedChange={(value) => updatePermission('canManageSettings', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canViewActivityLog" className="text-sm">View Activity Log</Label>
                      <Switch
                        id="canViewActivityLog"
                        checked={roleForm.permissions.canViewActivityLog}
                        onCheckedChange={(value) => updatePermission('canViewActivityLog', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canManageRoles" className="text-sm">Manage Roles</Label>
                      <Switch
                        id="canManageRoles"
                        checked={roleForm.permissions.canManageRoles}
                        onCheckedChange={(value) => updatePermission('canManageRoles', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateRole(false)
                  resetForm()
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}