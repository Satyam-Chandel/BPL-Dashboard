import React, { createContext, useContext, useState, useEffect } from 'react'
import { centralizedDb } from '../utils/centralizedDb'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'program_manager' | 'rd_manager' | 'manager' | 'employee'
  designation: string
  managerId?: string
  password?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  accessToken: string | null
  supabaseConfig: { projectId: string; publicAnonKey: string; supabaseUrl: string } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for testing (these will be merged with dynamic users)
const DEMO_USERS = [
  {
    id: 'admin-001',
    email: 'admin@bplcommander.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin' as const,
    designation: 'System Administrator',
    managerId: undefined
  },
  {
    id: 'program-manager-001',
    email: 'program.manager@bplcommander.com',
    password: 'program123',
    name: 'Program Manager',
    role: 'program_manager' as const,
    designation: 'Senior Program Manager',
    managerId: undefined
  },
  {
    id: 'rd-manager-001',
    email: 'rd.manager@bplcommander.com',
    password: 'rd123',
    name: 'R&D Manager',
    role: 'rd_manager' as const,
    designation: 'Research & Development Manager',
    managerId: undefined
  },
  {
    id: 'manager-001',
    email: 'manager@bplcommander.com',
    password: 'manager123',
    name: 'Team Manager',
    role: 'manager' as const,
    designation: 'Team Lead',
    managerId: 'program-manager-001'
  },
  {
    id: 'employee-001',
    email: 'employee@bplcommander.com',
    password: 'employee123',
    name: 'Test Employee',
    role: 'employee' as const,
    designation: 'Software Developer',
    managerId: 'manager-001'
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [supabaseConfig] = useState<{ projectId: string; publicAnonKey: string; supabaseUrl: string }>({
    projectId: 'bplcommander-demo',
    publicAnonKey: 'demo-anon-key',
    supabaseUrl: 'https://bplcommander-demo.supabase.co'
  })

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('bpl-user')
    const storedToken = localStorage.getItem('bpl-token')
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setAccessToken(storedToken)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('bpl-user')
        localStorage.removeItem('bpl-token')
      }
    }
    
    setLoading(false)
  }, [])

  const getAllUsers = () => {
    // Get dynamically added users from centralized database
    const dynamicUsers = centralizedDb.getUsers().map(user => ({
      ...user,
      password: user.password || 'defaultpass123' // Default password for new users
    }))
    
    // Merge with demo users, ensuring no duplicates by email
    const allUsers = [...DEMO_USERS]
    dynamicUsers.forEach(dynamicUser => {
      if (!allUsers.find(demoUser => demoUser.email === dynamicUser.email)) {
        allUsers.push(dynamicUser)
      }
    })
    
    return allUsers
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call the real API
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid email or password' };
      }

      // Extract user data and token from API response
      const userData: User = {
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.name,
        role: data.data.user.role,
        designation: data.data.user.designation,
        managerId: data.data.user.managerId
      };

      const token = data.data.token;

      // Store in state and localStorage
      setUser(userData);
      setAccessToken(token);
      localStorage.setItem('bpl-user', JSON.stringify(userData));
      localStorage.setItem('bpl-token', token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  const signOut = async () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('bpl-user')
    localStorage.removeItem('bpl-token')
  }

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' }
    }

    try {
      // Update user in centralized database if it exists there
      const dbUser = centralizedDb.getUserById(user.id)
      if (dbUser) {
        // Update in centralized database
        centralizedDb.updateUser(user.id, updates)
      }

      // Update current user state
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('bpl-user', JSON.stringify(updatedUser))

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Failed to update profile' }
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      updateProfile,
      accessToken, 
      supabaseConfig 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}