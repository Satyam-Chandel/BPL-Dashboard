import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoginForm } from './components/LoginForm'
import { Navigation } from './components/Navigation'
import { AdminDashboard } from './components/AdminDashboard'
import { ManagerDashboard } from './components/ManagerDashboard'
import { EmployeeDashboard } from './components/EmployeeDashboard'
import { Toaster } from './components/ui/sonner'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading BPL Commander...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />
      case 'program_manager':
      case 'rd_manager':
      case 'manager':
        return <ManagerDashboard />
      case 'employee':
        return <EmployeeDashboard />
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground">Unknown Role</h2>
            <p className="text-muted-foreground">Please contact your administrator for assistance.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderDashboard()}
      </main>
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}