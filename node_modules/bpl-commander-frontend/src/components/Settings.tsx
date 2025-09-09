import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { ForgotPassword } from './ForgotPassword'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Palette, Sun, Moon, Paintbrush, RotateCcw, Save, Key, Shield, Info } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { theme, customTheme, setTheme, updateCustomTheme, resetCustomTheme } = useTheme()
  const [editingTheme, setEditingTheme] = useState(customTheme)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'custom') => {
    setTheme(newTheme)
    toast.success(`Switched to ${newTheme} theme`)
  }

  const handleColorChange = (colorKey: string, value: string) => {
    setEditingTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
  }

  const handleSaveCustomTheme = () => {
    updateCustomTheme(editingTheme)
    if (theme === 'custom') {
      toast.success('Custom theme updated!')
    } else {
      toast.success('Custom theme saved! Switch to custom theme to see changes.')
    }
  }

  const handleResetTheme = () => {
    resetCustomTheme()
    setEditingTheme(customTheme)
    toast.success('Custom theme reset to default')
  }

  const colorFields = [
    { key: 'background', label: 'Background', description: 'Main background color' },
    { key: 'foreground', label: 'Foreground', description: 'Primary text color' },
    { key: 'primary', label: 'Primary', description: 'Primary brand color' },
    { key: 'primaryForeground', label: 'Primary Text', description: 'Text on primary color' },
    { key: 'secondary', label: 'Secondary', description: 'Secondary background' },
    { key: 'accent', label: 'Accent', description: 'Accent color for highlights' },
    { key: 'muted', label: 'Muted', description: 'Muted background color' },
    { key: 'mutedForeground', label: 'Muted Text', description: 'Muted text color' },
    { key: 'border', label: 'Border', description: 'Border color' },
    { key: 'destructive', label: 'Destructive', description: 'Error/warning color' }
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Customize your BPL Commander experience
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="appearance" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="themes">Custom Theme</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Selection</CardTitle>
                  <CardDescription>Choose your preferred theme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <CardContent className="p-4 text-center">
                        <Sun className="h-8 w-8 mx-auto mb-2" />
                        <h4>Light</h4>
                        <p className="text-sm text-muted-foreground">Clean and bright</p>
                        {theme === 'light' && <Badge className="mt-2">Active</Badge>}
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <CardContent className="p-4 text-center">
                        <Moon className="h-8 w-8 mx-auto mb-2" />
                        <h4>Dark</h4>
                        <p className="text-sm text-muted-foreground">Easy on the eyes</p>
                        {theme === 'dark' && <Badge className="mt-2">Active</Badge>}
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all ${theme === 'custom' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleThemeChange('custom')}
                    >
                      <CardContent className="p-4 text-center">
                        <Paintbrush className="h-8 w-8 mx-auto mb-2" />
                        <h4>Custom</h4>
                        <p className="text-sm text-muted-foreground">Your personal style</p>
                        {theme === 'custom' && <Badge className="mt-2">Active</Badge>}
                      </CardContent>
                    </Card>
                  </div>

                  {theme === 'custom' && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        🎨 You're using a custom theme! Switch to the "Custom Theme" tab to edit colors.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="themes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Custom Theme Editor</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleResetTheme}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button size="sm" onClick={handleSaveCustomTheme}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Theme
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Customize colors to create your perfect theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme-name">Theme Name</Label>
                      <Input
                        id="theme-name"
                        value={editingTheme.name}
                        onChange={(e) => setEditingTheme(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Custom Theme"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {colorFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key} className="flex items-center justify-between">
                            <span>{field.label}</span>
                            <div 
                              className="w-6 h-6 rounded border-2 border-border" 
                              style={{ backgroundColor: editingTheme.colors[field.key as keyof typeof editingTheme.colors] }}
                            />
                          </Label>
                          <Input
                            id={field.key}
                            type="color"
                            value={editingTheme.colors[field.key as keyof typeof editingTheme.colors]}
                            onChange={(e) => handleColorChange(field.key, e.target.value)}
                            className="h-10"
                          />
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        </div>
                      ))}
                    </div>

                    {theme !== 'custom' && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          💡 Switch to the custom theme in the "Appearance" tab to see your changes live!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and password settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-2">Password Management</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Change your password or reset it if you've forgotten it
                        </p>
                      </div>
                      <Key className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm" onClick={() => setShowForgotPassword(true)}>
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Demo Mode Security:</strong> In production, password resets would be sent via secure email. 
                      The current demo system simulates this process for testing purposes.
                    </AlertDescription>
                  </Alert>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Security Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Use a strong, unique password for your account</li>
                      <li>• Enable two-factor authentication when available</li>
                      <li>• Regularly review your account activity</li>
                      <li>• Don't share your login credentials with others</li>
                      <li>• Log out from shared devices after use</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Account Type:</span>
                        <Badge variant="outline" className="ml-2">Demo Account</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Security Level:</span>
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">Standard</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Login:</span>
                        <span className="ml-2">Current Session</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Session Status:</span>
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Application preferences and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Application Mode</Label>
                    <Select defaultValue="demo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Demo Mode</SelectItem>
                        <SelectItem value="production" disabled>Production Mode (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es" disabled>Spanish (Coming Soon)</SelectItem>
                        <SelectItem value="fr" disabled>French (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Data Management</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export your data for backup or migration purposes.
                    </p>
                    <Button variant="outline" disabled>
                      Export Data (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>BPL Commander v1.0</strong><br />
                  A comprehensive project management system with secure data storage 
                  and advanced user management capabilities.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ForgotPassword 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </>
  )
}