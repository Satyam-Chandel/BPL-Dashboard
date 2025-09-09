import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Building2, Info, User } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn(email, password)
    
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  const defaultUsers = [
    { 
      email: 'admin@bpl.com', 
      password: 'password123', 
      role: 'Admin', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      description: 'Full system access, can manage users and view all data'
    },
    { 
      email: 'pm@bpl.com', 
      password: 'password123', 
      role: 'Program Manager', 
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      description: 'Can create projects and manage program initiatives'
    },
    { 
      email: 'rd.manager@bplcommander.com', 
      password: 'rd123', 
      role: 'R&D Manager', 
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      description: 'Can create Over & Beyond initiatives and research projects'
    },
    { 
      email: 'manager@bplcommander.com', 
      password: 'manager123', 
      role: 'Team Manager', 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      description: 'Can assign tasks and manage team workload'
    },
    { 
      email: 'employee@bplcommander.com', 
      password: 'employee123', 
      role: 'Employee', 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      description: 'Can view projects and submit estimates'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">BPL Commander</CardTitle>
            <CardDescription className="text-center">
              Project Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Demo Accounts
            </CardTitle>
            <CardDescription>
              Click "Use" to quickly fill in credentials and test different user roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {defaultUsers.map((user, index) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-2 bg-card">
                <div className="flex items-center justify-between">
                  <Badge className={user.color}>{user.role}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmail(user.email)
                      setPassword(user.password)
                    }}
                    type="button"
                  >
                    Use
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Password: {user.password}</p>
                  <p className="text-xs text-muted-foreground">{user.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-800 dark:text-blue-400">
              🧪 API Tester Available
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Test backend API endpoints and monitor network requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>1.</strong> Login as <Badge variant="outline" className="mx-1">Admin</Badge> (admin@bpl.com / password123)</p>
              <p><strong>2.</strong> Look for the <Badge variant="outline" className="mx-1">⚡ API</Badge> button in the top navigation</p>
              <p><strong>3.</strong> Open DevTools → Network tab to see API calls</p>
              <p><strong>4.</strong> Test endpoints and view request/response data</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Role-Based Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Program Managers:</strong> Create and manage projects</li>
              <li>• <strong>R&D & Program Managers:</strong> Create Over & Beyond initiatives</li>
              <li>• <strong>Team Managers:</strong> Assign tasks and monitor workload</li>
              <li>• <strong>Employees:</strong> View assignments and submit estimates</li>
              <li>• <strong>120% workload limit</strong> enforcement per employee</li>
              <li>• <strong>Version tracking</strong> for all project changes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}