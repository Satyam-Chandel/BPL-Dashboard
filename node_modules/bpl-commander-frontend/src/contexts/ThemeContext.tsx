import React, { createContext, useContext, useState, useEffect } from 'react'

interface CustomTheme {
  name: string
  colors: {
    background: string
    foreground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
    card: string
    cardForeground: string
  }
}

interface ThemeContextType {
  theme: 'light' | 'dark' | 'custom'
  customTheme: CustomTheme
  setTheme: (theme: 'light' | 'dark' | 'custom') => void
  updateCustomTheme: (theme: Partial<CustomTheme>) => void
  resetCustomTheme: () => void
}

const defaultCustomTheme: CustomTheme = {
  name: 'Custom Theme',
  colors: {
    background: '#ffffff',
    foreground: '#030213',
    primary: '#030213',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#030213',
    muted: '#ececf0',
    mutedForeground: '#717182',
    accent: '#e9ebef',
    accentForeground: '#030213',
    destructive: '#d4183d',
    destructiveForeground: '#ffffff',
    border: 'rgba(0, 0, 0, 0.1)',
    input: 'transparent',
    ring: '#a1a1aa',
    card: '#ffffff',
    cardForeground: '#030213'
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'custom'>('light')
  const [customTheme, setCustomTheme] = useState<CustomTheme>(defaultCustomTheme)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('bpl-theme') as 'light' | 'dark' | 'custom' | null
    const savedCustomTheme = localStorage.getItem('bpl-custom-theme')
    
    if (savedTheme) {
      setThemeState(savedTheme)
    }
    
    if (savedCustomTheme) {
      try {
        setCustomTheme(JSON.parse(savedCustomTheme))
      } catch (error) {
        console.error('Error parsing saved custom theme:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('custom')
    } else if (theme === 'custom') {
      root.classList.add('custom')
      root.classList.remove('dark')
      
      // Apply custom theme variables
      Object.entries(customTheme.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        root.style.setProperty(`--${cssVar}`, value)
      })
    } else {
      root.classList.remove('dark', 'custom')
      
      // Reset custom variables
      Object.keys(customTheme.colors).forEach((key) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        root.style.removeProperty(`--${cssVar}`)
      })
    }
  }, [theme, customTheme])

  const setTheme = (newTheme: 'light' | 'dark' | 'custom') => {
    setThemeState(newTheme)
    localStorage.setItem('bpl-theme', newTheme)
  }

  const updateCustomTheme = (updates: Partial<CustomTheme>) => {
    const newCustomTheme = {
      ...customTheme,
      ...updates,
      colors: {
        ...customTheme.colors,
        ...(updates.colors || {})
      }
    }
    setCustomTheme(newCustomTheme)
    localStorage.setItem('bpl-custom-theme', JSON.stringify(newCustomTheme))
  }

  const resetCustomTheme = () => {
    setCustomTheme(defaultCustomTheme)
    localStorage.setItem('bpl-custom-theme', JSON.stringify(defaultCustomTheme))
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      customTheme,
      setTheme,
      updateCustomTheme,
      resetCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}