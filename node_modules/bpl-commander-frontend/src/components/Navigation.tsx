import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Settings } from './Settings'
import { UserProfile } from './UserProfile'
import { NotificationSystem } from './NotificationSystem'
import { ApiTester } from './ApiTester'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { Building2, LogOut, User, Settings as SettingsIcon, Palette, Sun, Moon, Paintbrush, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function Navigation() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showApiTester, setShowApiTester] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const handleQuickThemeSwitch = (newTheme: 'light' | 'dark' | 'custom') => {
    setTheme(newTheme)
    toast.success(`Switched to ${newTheme} theme`)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'manager':
      case 'program_manager':
      case 'rd_manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'employee':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'program_manager':
        return 'Program Manager'
      case 'rd_manager':
        return 'R&D Manager'
      case 'manager':
        return 'Manager'
      case 'employee':
        return 'Employee'
      default:
        return role
    }
  }

  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return <Sun className="mr-2 h-4 w-4" />
      case 'dark':
        return <Moon className="mr-2 h-4 w-4" />
      case 'custom':
        return <Paintbrush className="mr-2 h-4 w-4" />
      default:
        return <Sun className="mr-2 h-4 w-4" />
    }
  }

  if (!user) return null

  return (
    <>
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border transition-colors duration-300 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-semibold text-foreground">
                BPL Commander
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <Badge className={getRoleColor(user.role)}>
                  {getRoleDisplay(user.role)}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.designation}</p>
                </div>
              </div>
              
              {/* Notifications */}
              <NotificationSystem />
              
              {/* Quick Theme Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative z-50">
                    <Palette className="h-4 w-4" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50">
                  <DropdownMenuLabel>Quick Theme Switch</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleQuickThemeSwitch('light')}
                    className={theme === 'light' ? 'bg-accent' : ''}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light {theme === 'light' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleQuickThemeSwitch('dark')}
                    className={theme === 'dark' ? 'bg-accent' : ''}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark {theme === 'dark' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleQuickThemeSwitch('custom')}
                    className={theme === 'custom' ? 'bg-accent' : ''}
                  >
                    <Paintbrush className="mr-2 h-4 w-4" />
                    Custom {theme === 'custom' && '✓'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* API Tester Button (Admin Only) */}
              {user.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowApiTester(true)}
                  className="h-8 px-3 relative z-50"
                  title="Open API Tester"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">API</span>
                </Button>
              )}
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full z-50">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge className={`${getRoleColor(user.role)} w-fit mt-1`}>
                        {getRoleDisplay(user.role)}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={() => setShowProfile(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={() => setShowSettings(true)}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center w-full">
                      {getThemeIcon(theme)}
                      <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
      
      {/* API Tester Dialog */}
      {showApiTester && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">🧪 API Tester</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowApiTester(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <ApiTester />
            </div>
          </div>
        </div>
      )}
    </>
  )
}