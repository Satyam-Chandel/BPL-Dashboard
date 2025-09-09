// Centralized Database System - Simulates VM-based storage
interface DatabaseConfig {
  autoSave: boolean
  compressionEnabled: boolean
  backupRetention: number
  lastBackup: string | null
  defaultCurrency: string
}

interface DatabaseMetrics {
  totalUsers: number
  totalProjects: number
  totalInitiatives: number
  totalComments: number
  dataSize: number
  lastUpdated: string
}

// Supported currencies with symbols and formatting
export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  decimalPlaces: number
  locale?: string
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2, locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2, locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2, locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0, locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2, locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2, locale: 'en-AU' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimalPlaces: 2, locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2, locale: 'zh-CN' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2, locale: 'en-IN' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2, locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2, locale: 'no-NO' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2, locale: 'da-DK' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', decimalPlaces: 2, locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimalPlaces: 2, locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', decimalPlaces: 0, locale: 'hu-HU' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimalPlaces: 2, locale: 'ru-RU' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2, locale: 'pt-BR' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimalPlaces: 2, locale: 'es-MX' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimalPlaces: 2, locale: 'en-ZA' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimalPlaces: 0, locale: 'ko-KR' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2, locale: 'en-SG' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2, locale: 'en-HK' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2, locale: 'en-NZ' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimalPlaces: 2, locale: 'tr-TR' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', decimalPlaces: 2, locale: 'he-IL' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimalPlaces: 2, locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimalPlaces: 2, locale: 'ar-SA' },
]

// Budget information with currency support
export interface BudgetInfo {
  amount: number
  currency: string
  allocatedAt: string
  allocatedBy: string
  notes?: string
}

export interface CentralizedProject {
  id: string
  title: string
  description: string
  managerId: string
  timeline: string
  status: 'pending' | 'active' | 'completed' | 'on-hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
  version: number
  assignedEmployees: {
    employeeId: string
    involvementPercentage: number
    assignedAt: string
    role: string
  }[]
  milestones: {
    id: string
    title: string
    description: string
    dueDate: string
    completed: boolean
    completedAt?: string
  }[]
  tags: string[]
  budget?: BudgetInfo
  estimatedHours?: number
  actualHours?: number
  discussionCount?: number
  lastActivity?: string
}

export interface CentralizedUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'program_manager' | 'rd_manager' | 'manager' | 'employee'
  designation: string
  managerId?: string
  createdAt: string
  lastLoginAt?: string
  isActive: boolean
  password: string
  skills: string[]
  department: string
  workloadCap: number // Maximum workload percentage (default 100%)
  overBeyondCap: number // Maximum over & beyond percentage (default 20%)
  avatar?: string
  phoneNumber?: string
  timezone?: string
  preferredCurrency?: string
  notificationSettings: {
    email: boolean
    inApp: boolean
    projectUpdates: boolean
    deadlineReminders: boolean
    weeklyReports: boolean
  }
}

export interface CentralizedInitiative {
  id: string
  title: string
  description: string
  category: string
  createdBy: string
  assignedTo?: string
  createdAt: string
  status: 'pending' | 'active' | 'completed'
  priority: 'low' | 'medium' | 'high'
  estimatedHours: number
  actualHours?: number
  workloadPercentage: number // Calculated percentage of workload
  dueDate?: string
  completedAt?: string
  approvedBy?: string
  approvalDate?: string
  budget?: BudgetInfo
}

export interface CentralizedComment {
  id: string
  projectId: string
  userId: string
  comment: string
  createdAt: string
  editedAt?: string
  parentCommentId?: string
  attachments?: {
    name: string
    url: string
    type: string
  }[]
}

// Activity tracking for better user experience
export interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: 'project' | 'initiative' | 'user' | 'comment'
  entityId: string
  details: string
  timestamp: string
  metadata?: Record<string, any>
}

class CentralizedDatabase {
  private config: DatabaseConfig = {
    autoSave: true,
    compressionEnabled: true,
    backupRetention: 30,
    lastBackup: null,
    defaultCurrency: 'USD'
  }

  private users: CentralizedUser[] = [
    {
      id: 'admin-001',
      email: 'admin@bplcommander.com',
      name: 'System Admin',
      role: 'admin',
      designation: 'System Administrator',
      createdAt: '2024-01-01T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      password: 'admin123',
      skills: ['System Management', 'User Administration'],
      department: 'IT',
      workloadCap: 100,
      overBeyondCap: 20,
      preferredCurrency: 'USD',
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: true
      }
    },
    {
      id: 'program-manager-001',
      email: 'program.manager@bplcommander.com',
      name: 'Program Manager',
      role: 'program_manager',
      designation: 'Senior Program Manager',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      password: 'program123',
      skills: ['Project Management', 'Strategic Planning'],
      department: 'Operations',
      workloadCap: 100,
      overBeyondCap: 20,
      preferredCurrency: 'USD',
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: false
      }
    },
    {
      id: 'rd-manager-001',
      email: 'rd.manager@bplcommander.com',
      name: 'R&D Manager',
      role: 'rd_manager',
      designation: 'Research & Development Manager',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      password: 'rd123',
      skills: ['Research', 'Innovation', 'Product Development'],
      department: 'R&D',
      workloadCap: 100,
      overBeyondCap: 20,
      preferredCurrency: 'USD',
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: false
      }
    },
    {
      id: 'manager-001',
      email: 'manager@bplcommander.com',
      name: 'Team Manager',
      role: 'manager',
      designation: 'Team Lead',
      managerId: 'program-manager-001',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      password: 'manager123',
      skills: ['Team Management', 'Project Coordination'],
      department: 'Development',
      workloadCap: 100,
      overBeyondCap: 20,
      preferredCurrency: 'USD',
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: false
      }
    },
    {
      id: 'employee-001',
      email: 'employee@bplcommander.com',
      name: 'Test Employee',
      role: 'employee',
      designation: 'Software Developer',
      managerId: 'manager-001',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      password: 'employee123',
      skills: ['React', 'TypeScript', 'Node.js'],
      department: 'Development',
      workloadCap: 100,
      overBeyondCap: 20,
      preferredCurrency: 'USD',
      notificationSettings: {
        email: false,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: false
      }
    }
  ]

  private projects: CentralizedProject[] = [
    {
      id: 'project-001',
      title: 'E-commerce Platform Development',
      description: 'Build a modern e-commerce platform with React and Node.js including payment integration, user management, and analytics dashboard.',
      managerId: 'program-manager-001',
      timeline: '3 months',
      status: 'active',
      priority: 'high',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      version: 1,
      assignedEmployees: [
        {
          employeeId: 'employee-001',
          involvementPercentage: 60,
          assignedAt: '2024-01-15T00:00:00Z',
          role: 'Lead Developer'
        }
      ],
      milestones: [
        {
          id: 'milestone-001',
          title: 'Phase 1: Core Architecture',
          description: 'Set up project structure and core components',
          dueDate: '2024-02-15T00:00:00Z',
          completed: true,
          completedAt: '2024-02-10T00:00:00Z'
        },
        {
          id: 'milestone-002',
          title: 'Phase 2: Payment Integration',
          description: 'Implement payment gateway and security features',
          dueDate: '2024-03-15T00:00:00Z',
          completed: false
        }
      ],
      tags: ['E-commerce', 'React', 'Node.js'],
      budget: {
        amount: 150000,
        currency: 'USD',
        allocatedAt: '2024-01-15T00:00:00Z',
        allocatedBy: 'program-manager-001',
        notes: 'Initial budget allocation for MVP development'
      },
      estimatedHours: 480,
      actualHours: 120,
      discussionCount: 2,
      lastActivity: '2024-01-17T00:00:00Z'
    },
    {
      id: 'project-002',
      title: 'Mobile App UI/UX Design',
      description: 'Design user interface and experience for mobile application with focus on accessibility and modern design patterns.',
      managerId: 'program-manager-001',
      timeline: '2 months',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      version: 1,
      assignedEmployees: [],
      milestones: [
        {
          id: 'milestone-003',
          title: 'Wireframe Creation',
          description: 'Create detailed wireframes for all app screens',
          dueDate: '2024-02-20T00:00:00Z',
          completed: false
        }
      ],
      tags: ['UI/UX', 'Mobile', 'Design'],
      budget: {
        amount: 75000,
        currency: 'USD',
        allocatedAt: '2024-01-20T00:00:00Z',
        allocatedBy: 'program-manager-001',
        notes: 'Design phase budget'
      },
      estimatedHours: 240,
      discussionCount: 0,
      lastActivity: '2024-01-20T00:00:00Z'
    }
  ]

  private initiatives: CentralizedInitiative[] = [
    {
      id: 'initiative-001',
      title: 'Tech Talk Series Implementation',
      description: 'Organize monthly tech talks for knowledge sharing across teams',
      category: 'Knowledge Sharing',
      createdBy: 'rd-manager-001',
      assignedTo: 'employee-001',
      createdAt: '2024-01-10T00:00:00Z',
      status: 'active',
      priority: 'medium',
      estimatedHours: 20,
      workloadPercentage: 5, // 5% of workload
      dueDate: '2024-06-01T00:00:00Z',
      budget: {
        amount: 5000,
        currency: 'USD',
        allocatedAt: '2024-01-10T00:00:00Z',
        allocatedBy: 'rd-manager-001',
        notes: 'Budget for venue, refreshments, and materials'
      }
    },
    {
      id: 'initiative-002',
      title: 'Innovation Lab Setup',
      description: 'Establish dedicated space for experimental projects and prototyping',
      category: 'Innovation',
      createdBy: 'program-manager-001',
      createdAt: '2024-01-12T00:00:00Z',
      status: 'pending',
      priority: 'high',
      estimatedHours: 80,
      workloadPercentage: 20, // 20% of workload
      dueDate: '2024-04-01T00:00:00Z',
      budget: {
        amount: 25000,
        currency: 'USD',
        allocatedAt: '2024-01-12T00:00:00Z',
        allocatedBy: 'program-manager-001',
        notes: 'Equipment, furniture, and setup costs'
      }
    }
  ]

  private comments: CentralizedComment[] = [
    {
      id: 'comment-001',
      projectId: 'project-001',
      userId: 'employee-001',
      comment: 'I need more details about the payment gateway integration requirements. Should we support multiple payment methods?',
      createdAt: '2024-01-16T00:00:00Z'
    },
    {
      id: 'comment-002',
      projectId: 'project-001',
      userId: 'program-manager-001',
      comment: 'Yes, please implement support for credit cards, PayPal, and Apple Pay. I\'ll share the technical specifications document.',
      createdAt: '2024-01-17T00:00:00Z',
      parentCommentId: 'comment-001'
    }
  ]

  private activityLog: ActivityLog[] = []

  // Currency Helper Methods
  formatCurrency(amount: number, currencyCode: string = this.config.defaultCurrency): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
    if (!currency) return `${amount} ${currencyCode}`
    
    try {
      const formatter = new Intl.NumberFormat(currency.locale || 'en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces
      })
      return formatter.format(amount)
    } catch {
      return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`
    }
  }

  getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
  }

  getSupportedCurrencies(): CurrencyInfo[] {
    return [...SUPPORTED_CURRENCIES]
  }

  // Activity Logging
  logActivity(userId: string, action: string, entityType: ActivityLog['entityType'], entityId: string, details: string, metadata?: Record<string, any>): void {
    const activity: ActivityLog = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
      metadata
    }
    
    this.activityLog.push(activity)
    
    // Keep only last 1000 activities to prevent memory bloat
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000)
    }
  }

  getActivityLog(limit: number = 50, entityType?: ActivityLog['entityType'], entityId?: string): ActivityLog[] {
    let activities = [...this.activityLog]
    
    if (entityType && entityId) {
      activities = activities.filter(a => a.entityType === entityType && a.entityId === entityId)
    } else if (entityType) {
      activities = activities.filter(a => a.entityType === entityType)
    }
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  // Permission checking methods
  canCreateProjects(userId: string): boolean {
    const user = this.getUserById(userId)
    if (!user) return false
    
    return user.role === 'admin' || 
           user.role === 'program_manager' || 
           user.role === 'rd_manager' || 
           user.role === 'manager'
  }

  canCreateInitiatives(userId: string): boolean {
    const user = this.getUserById(userId)
    if (!user) return false
    
    return user.role === 'admin' || 
           user.role === 'program_manager' || 
           user.role === 'rd_manager'
  }

  canEditProgress(userId: string): boolean {
    const user = this.getUserById(userId)
    if (!user) return false
    
    return user.role === 'admin' || 
           user.role === 'program_manager'
  }

  // Database Operations
  saveToStorage(): void {
    try {
      const data = {
        users: this.users,
        projects: this.projects,
        initiatives: this.initiatives,
        comments: this.comments,
        activityLog: this.activityLog,
        config: this.config,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem('bpl-centralized-db', JSON.stringify(data))
      this.config.lastBackup = new Date().toISOString()
      
      console.log('✅ Database saved to VM storage successfully')
    } catch (error) {
      console.error('❌ Failed to save database:', error)
    }
  }

  loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem('bpl-centralized-db')
      if (storedData) {
        const data = JSON.parse(storedData)
        this.users = data.users || this.users
        this.projects = data.projects || this.projects
        this.initiatives = data.initiatives || this.initiatives
        this.comments = data.comments || this.comments
        this.activityLog = data.activityLog || []
        this.config = { ...this.config, ...data.config }
        
        console.log('✅ Database loaded from VM storage successfully')
      }
    } catch (error) {
      console.error('❌ Failed to load database:', error)
    }
  }

  // User Management
  getUsers(): CentralizedUser[] {
    return [...this.users]
  }

  getUserById(id: string): CentralizedUser | undefined {
    return this.users.find(user => user.id === id)
  }

  getUsersByRole(role: CentralizedUser['role']): CentralizedUser[] {
    return this.users.filter(user => user.role === role)
  }

  addUser(user: Omit<CentralizedUser, 'id' | 'createdAt'>, createdBy: string): CentralizedUser {
    const newUser: CentralizedUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      notificationSettings: user.notificationSettings || {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: false
      }
    }
    this.users.push(newUser)
    this.logActivity(createdBy, 'CREATE_USER', 'user', newUser.id, `Created user: ${newUser.name}`)
    this.saveToStorage()
    return newUser
  }

  updateUser(id: string, updates: Partial<CentralizedUser>, updatedBy?: string): CentralizedUser | null {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) return null

    const oldUser = this.users[userIndex]
    this.users[userIndex] = { ...oldUser, ...updates }
    
    if (updatedBy) {
      this.logActivity(updatedBy, 'UPDATE_USER', 'user', id, `Updated user: ${this.users[userIndex].name}`)
    }
    
    this.saveToStorage()
    return this.users[userIndex]
  }

  // Project Management
  getProjects(): CentralizedProject[] {
    return [...this.projects]
  }

  getProjectById(id: string): CentralizedProject | undefined {
    return this.projects.find(project => project.id === id)
  }

  getProjectsByAssignee(assigneeId: string): CentralizedProject[] {
    return this.projects.filter(project => 
      project.assignedEmployees.some(emp => emp.employeeId === assigneeId)
    )
  }

  getProjectsByManager(managerId: string): CentralizedProject[] {
    return this.projects.filter(project => project.managerId === managerId)
  }

  addProject(project: Omit<CentralizedProject, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'discussionCount' | 'lastActivity'>, createdBy: string): CentralizedProject {
    const newProject: CentralizedProject = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      discussionCount: 0,
      lastActivity: new Date().toISOString()
    }
    this.projects.push(newProject)
    this.logActivity(createdBy, 'CREATE_PROJECT', 'project', newProject.id, `Created project: ${newProject.title}`)
    this.saveToStorage()
    return newProject
  }

  updateProject(id: string, updates: Partial<CentralizedProject>, updatedBy?: string): CentralizedProject | null {
    const projectIndex = this.projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return null

    const oldProject = this.projects[projectIndex]
    this.projects[projectIndex] = {
      ...oldProject,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: oldProject.version + 1,
      lastActivity: new Date().toISOString()
    }
    
    if (updatedBy) {
      this.logActivity(updatedBy, 'UPDATE_PROJECT', 'project', id, `Updated project: ${this.projects[projectIndex].title}`)
    }
    
    this.saveToStorage()
    return this.projects[projectIndex]
  }

  deleteProject(id: string, deletedBy: string): boolean {
    const projectIndex = this.projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return false
    
    const project = this.projects[projectIndex]
    this.projects.splice(projectIndex, 1)
    this.logActivity(deletedBy, 'DELETE_PROJECT', 'project', id, `Deleted project: ${project.title}`)
    this.saveToStorage()
    return true
  }

  assignEmployeeToProject(projectId: string, assignment: {
    employeeId: string
    involvementPercentage: number
    role: string
  }, assignedBy?: string): boolean {
    const project = this.getProjectById(projectId)
    if (!project) return false

    // Check if employee is already assigned
    const existingIndex = project.assignedEmployees.findIndex(
      emp => emp.employeeId === assignment.employeeId
    )

    const newAssignment = {
      ...assignment,
      assignedAt: new Date().toISOString()
    }

    if (existingIndex >= 0) {
      project.assignedEmployees[existingIndex] = newAssignment
    } else {
      project.assignedEmployees.push(newAssignment)
    }

    const employee = this.getUserById(assignment.employeeId)
    if (assignedBy) {
      this.logActivity(assignedBy, 'ASSIGN_EMPLOYEE', 'project', projectId, `Assigned ${employee?.name} to project: ${project.title}`)
    }
    this.updateProject(projectId, { assignedEmployees: project.assignedEmployees }, assignedBy)
    return true
  }

  removeEmployeeFromProject(projectId: string, employeeId: string, removedBy?: string): boolean {
    const project = this.getProjectById(projectId)
    if (!project) return false

    const employee = this.getUserById(employeeId)
    project.assignedEmployees = project.assignedEmployees.filter(
      emp => emp.employeeId !== employeeId
    )

    if (removedBy) {
      this.logActivity(removedBy, 'REMOVE_EMPLOYEE', 'project', projectId, `Removed ${employee?.name} from project: ${project.title}`)
    }
    this.updateProject(projectId, { assignedEmployees: project.assignedEmployees }, removedBy)
    return true
  }

  // Initiative Management with 20% cap enforcement
  getInitiatives(): CentralizedInitiative[] {
    return [...this.initiatives]
  }

  getInitiativesByCreator(creatorId: string): CentralizedInitiative[] {
    return this.initiatives.filter(initiative => initiative.createdBy === creatorId)
  }

  getInitiativesByAssignee(assigneeId: string): CentralizedInitiative[] {
    return this.initiatives.filter(initiative => initiative.assignedTo === assigneeId)
  }

  addInitiative(initiative: Omit<CentralizedInitiative, 'id' | 'createdAt'>, createdBy: string): CentralizedInitiative | null {
    // Enforce 20% cap for over and beyond initiatives
    if (initiative.assignedTo) {
      const currentOverBeyondWorkload = this.getEmployeeOverBeyondWorkload(initiative.assignedTo)
      const user = this.getUserById(initiative.assignedTo)
      
      if (user && (currentOverBeyondWorkload + initiative.workloadPercentage) > user.overBeyondCap) {
        console.error(`❌ Cannot assign initiative: Would exceed ${user.overBeyondCap}% over & beyond limit`)
        return null
      }
    }

    const newInitiative: CentralizedInitiative = {
      ...initiative,
      id: `initiative-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    this.initiatives.push(newInitiative)
    this.logActivity(createdBy, 'CREATE_INITIATIVE', 'initiative', newInitiative.id, `Created initiative: ${newInitiative.title}`)
    this.saveToStorage()
    return newInitiative
  }

  updateInitiative(id: string, updates: Partial<CentralizedInitiative>, updatedBy: string): CentralizedInitiative | null {
    const initiativeIndex = this.initiatives.findIndex(i => i.id === id)
    if (initiativeIndex === -1) return null

    // Check 20% cap if updating assignment
    if (updates.assignedTo || updates.workloadPercentage) {
      const current = this.initiatives[initiativeIndex]
      const assignedTo = updates.assignedTo || current.assignedTo
      const workloadPercentage = updates.workloadPercentage || current.workloadPercentage
      
      if (assignedTo) {
        const currentOverBeyondWorkload = this.getEmployeeOverBeyondWorkload(assignedTo, id)
        const user = this.getUserById(assignedTo)
        
        if (user && (currentOverBeyondWorkload + workloadPercentage) > user.overBeyondCap) {
          console.error(`❌ Cannot update initiative: Would exceed ${user.overBeyondCap}% over & beyond limit`)
          return null
        }
      }
    }

    this.initiatives[initiativeIndex] = { ...this.initiatives[initiativeIndex], ...updates }
    this.logActivity(updatedBy, 'UPDATE_INITIATIVE', 'initiative', id, `Updated initiative: ${this.initiatives[initiativeIndex].title}`)
    this.saveToStorage()
    return this.initiatives[initiativeIndex]
  }

  deleteInitiative(id: string, deletedBy: string): boolean {
    const initiativeIndex = this.initiatives.findIndex(i => i.id === id)
    if (initiativeIndex === -1) return false
    
    const initiative = this.initiatives[initiativeIndex]
    this.initiatives.splice(initiativeIndex, 1)
    this.logActivity(deletedBy, 'DELETE_INITIATIVE', 'initiative', id, `Deleted initiative: ${initiative.title}`)
    this.saveToStorage()
    return true
  }

  // Workload Calculation Methods
  getEmployeeWorkload(employeeId: string): {
    projectWorkload: number
    overBeyondWorkload: number
    totalWorkload: number
    availableCapacity: number
    overBeyondAvailable: number
  } {
    const projectWorkload = this.projects
      .filter(p => p.status === 'active')
      .reduce((total, project) => {
        const assignment = project.assignedEmployees.find(emp => emp.employeeId === employeeId)
        return total + (assignment?.involvementPercentage || 0)
      }, 0)

    const overBeyondWorkload = this.initiatives
      .filter(i => i.assignedTo === employeeId && i.status === 'active')
      .reduce((total, initiative) => total + initiative.workloadPercentage, 0)

    const user = this.getUserById(employeeId)
    const workloadCap = user?.workloadCap || 100
    const overBeyondCap = user?.overBeyondCap || 20

    return {
      projectWorkload,
      overBeyondWorkload,
      totalWorkload: projectWorkload + overBeyondWorkload,
      availableCapacity: Math.max(0, workloadCap - projectWorkload),
      overBeyondAvailable: Math.max(0, overBeyondCap - overBeyondWorkload)
    }
  }

  getEmployeeOverBeyondWorkload(employeeId: string, excludeInitiativeId?: string): number {
    // Calculate total workload from over & beyond initiatives
    const assignedInitiatives = this.getInitiativesByAssignee(employeeId)
    return assignedInitiatives
      .filter(initiative => initiative.id !== excludeInitiativeId)
      .reduce((total, initiative) => total + initiative.workloadPercentage, 0)
  }

  getEmployeeTotalWorkload(employeeId: string): {
    projectWorkload: number
    initiativeWorkload: number
    totalWorkload: number
    isOverloaded: boolean
  } {
    const user = this.getUserById(employeeId)
    if (!user) {
      return { projectWorkload: 0, initiativeWorkload: 0, totalWorkload: 0, isOverloaded: false }
    }

    const projectWorkload = this.getEmployeeWorkload(employeeId)
    const initiativeWorkload = this.getEmployeeOverBeyondWorkload(employeeId)
    const totalWorkload = projectWorkload + initiativeWorkload
    const isOverloaded = totalWorkload > (user.workloadCap + user.overBeyondCap)

    return {
      projectWorkload,
      initiativeWorkload,
      totalWorkload,
      isOverloaded
    }
  }

  // Comment Management
  addComment(comment: Omit<CentralizedComment, 'id' | 'createdAt'>): CentralizedComment {
    const newComment: CentralizedComment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    
    this.comments.push(newComment)
    this.logActivity(comment.userId, 'ADD_COMMENT', 'project', comment.projectId, `Added comment to project`)
    this.saveToStorage()
    
    return newComment
  }

  getCommentsByProject(projectId: string): CentralizedComment[] {
    return this.comments
      .filter(comment => comment.projectId === projectId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  // Statistics and Metrics
  getDatabaseMetrics(): DatabaseMetrics {
    return {
      totalUsers: this.users.length,
      totalProjects: this.projects.length,
      totalInitiatives: this.initiatives.length,
      totalComments: this.comments.length,
      dataSize: JSON.stringify({
        users: this.users,
        projects: this.projects,
        initiatives: this.initiatives,
        comments: this.comments,
        activityLog: this.activityLog
      }).length,
      lastUpdated: new Date().toISOString()
    }
  }

  // Alias for getDatabaseMetrics for compatibility
  getMetrics(): DatabaseMetrics {
    return this.getDatabaseMetrics()
  }

  // Configuration Management
  updateConfig(newConfig: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.saveToStorage()
  }

  getConfig(): DatabaseConfig {
    return { ...this.config }
  }

  // Data Export/Import
  exportData(): string {
    return JSON.stringify({
      users: this.users,
      projects: this.projects,
      initiatives: this.initiatives,
      comments: this.comments,
      activityLog: this.activityLog,
      config: this.config,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      // Validate data structure
      if (!data.users || !data.projects || !data.initiatives) {
        console.error('❌ Invalid data format for import')
        return false
      }

      this.users = data.users
      this.projects = data.projects
      this.initiatives = data.initiatives
      this.comments = data.comments || []
      this.activityLog = data.activityLog || []
      this.config = { ...this.config, ...data.config }
      
      this.saveToStorage()
      console.log('✅ Data imported successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to import data:', error)
      return false
    }
  }

  // Permission Helper Methods
  canViewProject(userId: string, projectId: string): boolean {
    const user = this.getUserById(userId)
    const project = this.getProjectById(projectId)
    
    if (!user || !project) return false
    
    // Admins and program managers can view all projects
    if (user.role === 'admin' || user.role === 'program_manager') return true
    
    // Project managers can view their own projects
    if (project.managerId === userId) return true
    
    // Employees can view projects they're assigned to
    return project.assignedEmployees.some(emp => emp.employeeId === userId)
  }

  canEditProject(userId: string, projectId: string): boolean {
    const user = this.getUserById(userId)
    const project = this.getProjectById(projectId)
    
    if (!user || !project) return false
    
    return user.role === 'admin' || 
           user.role === 'program_manager' || 
           project.managerId === userId
  }

  canDeleteProject(userId: string, projectId: string): boolean {
    const user = this.getUserById(userId)
    const project = this.getProjectById(projectId)
    
    if (!user || !project) return false
    
    return user.role === 'admin' || 
           (user.role === 'program_manager' && project.managerId === userId)
  }

  canAssignProjects(userId: string): boolean {
    const user = this.getUserById(userId)
    return user?.role === 'admin' || user?.role === 'program_manager' || user?.role === 'manager'
  }

  canManageUsers(userId: string): boolean {
    const user = this.getUserById(userId)
    return user?.role === 'admin'
  }

  canViewAllProjects(userId: string): boolean {
    const user = this.getUserById(userId)
    return user?.role === 'admin' || user?.role === 'program_manager'
  }

  // Search functionality
  searchProjects(query: string): CentralizedProject[] {
    const lowerQuery = query.toLowerCase()
    return this.projects.filter(project =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  searchUsers(query: string): CentralizedUser[] {
    const lowerQuery = query.toLowerCase()
    return this.users.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.designation.toLowerCase().includes(lowerQuery) ||
      user.department.toLowerCase().includes(lowerQuery) ||
      user.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
    )
  }

  // Initialize database
  constructor() {
    this.loadFromStorage()
  }
}

// Create and export singleton instance
export const centralizedDb = new CentralizedDatabase()