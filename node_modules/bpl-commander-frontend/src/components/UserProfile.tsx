import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Avatar, AvatarFallback } from './ui/avatar'
import { User, Mail, Briefcase, Shield, Key, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    designation: user?.designation || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      // In a real app, you'd validate the current password here
      const result = await updateProfile({ password: passwordData.newPassword })
      if (result.success) {
        toast.success('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(result.error || 'Failed to update password')
      }
    } catch (error) {
      toast.error('An error occurred while updating password')
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'program_manager':
        return 'Program Manager'
      case 'rd_manager':
        return 'R&D Manager'
      case 'manager':
        return 'Team Manager'
      case 'employee':
        return 'Employee'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'program_manager':
        return 'bg-purple-100 text-purple-800'
      case 'rd_manager':
        return 'bg-indigo-100 text-indigo-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'employee':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            Manage your account information and security settings
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Profile Summary */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground mb-2">{user.designation}</p>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleDisplay(user.role)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={profileData.designation}
                        onChange={(e) => setProfileData(prev => ({ ...prev, designation: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleDisplay(user.role)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Role cannot be changed. Contact your administrator if you need a different role.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {passwordData.newPassword && passwordData.confirmPassword && 
                     passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-sm text-destructive">Passwords do not match</p>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        <Key className="h-4 w-4 mr-2" />
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Account ID</Label>
                      <p className="text-sm text-muted-foreground">{user.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Role</Label>
                      <p className="text-sm text-muted-foreground">{getRoleDisplay(user.role)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Status</Label>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">Current session</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}