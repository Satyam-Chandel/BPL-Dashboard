import { CentralizedProject, BudgetInfo, centralizedDb } from './centralizedDb'

export const PROJECT_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'on-hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
} as const

export const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
} as const

export const INITIATIVE_CATEGORIES = [
  'Knowledge Sharing',
  'Innovation',
  'Process Improvement',
  'Training & Development',
  'Research',
  'Community Engagement',
  'Technology Exploration',
  'Automation',
  'Quality Assurance',
  'Documentation',
  'Team Building',
  'Sustainability'
] as const

export const WORKLOAD_COLORS = {
  low: 'text-green-600 dark:text-green-400',      // 0-50%
  medium: 'text-yellow-600 dark:text-yellow-400', // 51-80%
  high: 'text-orange-600 dark:text-orange-400',   // 81-100%
  overload: 'text-red-600 dark:text-red-400'      // 100%+
} as const

export const calculateProjectProgress = (project: CentralizedProject): number => {
  if (project.milestones.length === 0) return 0
  const completedMilestones = project.milestones.filter(m => m.completed).length
  return (completedMilestones / project.milestones.length) * 100
}

export const calculateTotalInvolvement = (project: CentralizedProject): number => {
  return project.assignedEmployees.reduce((sum, emp) => sum + emp.involvementPercentage, 0)
}

export const getStatusColor = (status: string): string => {
  return PROJECT_STATUS_COLORS[status as keyof typeof PROJECT_STATUS_COLORS] || 'bg-muted text-muted-foreground'
}

export const getPriorityColor = (priority: string): string => {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-muted text-muted-foreground'
}

export const getWorkloadColor = (workload: number): string => {
  if (workload > 100) return WORKLOAD_COLORS.overload
  if (workload > 80) return WORKLOAD_COLORS.high
  if (workload > 50) return WORKLOAD_COLORS.medium
  return WORKLOAD_COLORS.low
}

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
    
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 30) return `${days} days ago`
    return `${months} months ago`
  } catch {
    return 'Unknown'
  }
}

// Enhanced currency formatting with multi-currency support
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  return centralizedDb.formatCurrency(amount, currencyCode)
}

export const formatBudget = (budget: BudgetInfo): string => {
  return centralizedDb.formatCurrency(budget.amount, budget.currency)
}

export const formatBudgetWithDetails = (budget: BudgetInfo, showDetails: boolean = false): string => {
  const formatted = formatBudget(budget)
  if (!showDetails) return formatted
  
  const allocatedDate = formatDate(budget.allocatedAt)
  return `${formatted} (allocated on ${allocatedDate})`
}

// Project analysis helpers
export const getProjectHealth = (project: CentralizedProject): 'healthy' | 'warning' | 'critical' => {
  const progress = calculateProjectProgress(project)
  const totalInvolvement = calculateTotalInvolvement(project)
  
  // Check for various health indicators
  const hasLowProgress = progress < 25 && project.status === 'active'
  const hasOverAllocation = totalInvolvement > 120
  const hasNoAssignees = project.assignedEmployees.length === 0 && project.status === 'active'
  const isOverdue = project.milestones.some(m => 
    !m.completed && new Date(m.dueDate) < new Date()
  )
  
  if (hasNoAssignees || hasOverAllocation || isOverdue) return 'critical'
  if (hasLowProgress) return 'warning'
  return 'healthy'
}

export const getProjectRisk = (project: CentralizedProject): string[] => {
  const risks: string[] = []
  
  if (project.assignedEmployees.length === 0 && project.status === 'active') {
    risks.push('No team members assigned')
  }
  
  const totalInvolvement = calculateTotalInvolvement(project)
  if (totalInvolvement > 120) {
    risks.push(`Over-allocated (${totalInvolvement}%)`)
  }
  
  const overdueMilestones = project.milestones.filter(m => 
    !m.completed && new Date(m.dueDate) < new Date()
  )
  if (overdueMilestones.length > 0) {
    risks.push(`${overdueMilestones.length} overdue milestone(s)`)
  }
  
  const progress = calculateProjectProgress(project)
  if (progress < 25 && project.status === 'active') {
    risks.push('Low progress rate')
  }
  
  if (project.estimatedHours && project.actualHours && project.actualHours > project.estimatedHours * 1.5) {
    risks.push('Significantly over estimated hours')
  }
  
  return risks
}

export const calculateProjectMetrics = (project: CentralizedProject) => {
  const progress = calculateProjectProgress(project)
  const totalInvolvement = calculateTotalInvolvement(project)
  const health = getProjectHealth(project)
  const risks = getProjectRisk(project)
  
  const completedMilestones = project.milestones.filter(m => m.completed).length
  const totalMilestones = project.milestones.length
  
  const hoursUtilization = project.estimatedHours && project.actualHours
    ? (project.actualHours / project.estimatedHours) * 100
    : null
  
  return {
    progress,
    totalInvolvement,
    health,
    risks,
    completedMilestones,
    totalMilestones,
    hoursUtilization,
    teamSize: project.assignedEmployees.length,
    tagsCount: project.tags.length
  }
}

// Time estimation helpers
export const estimateProjectDuration = (estimatedHours: number, teamSize: number, avgHoursPerDay: number = 6): number => {
  if (teamSize === 0) return 0
  const totalPersonDays = estimatedHours / avgHoursPerDay
  return Math.ceil(totalPersonDays / teamSize)
}

export const calculateBurnRate = (project: CentralizedProject): number | null => {
  if (!project.budget || !project.actualHours || project.actualHours === 0) return null
  return project.budget.amount / project.actualHours
}

// Validation helpers
export const validateProjectData = (project: Partial<CentralizedProject>): string[] => {
  const errors: string[] = []
  
  if (!project.title?.trim()) {
    errors.push('Project title is required')
  } else if (project.title.length > 100) {
    errors.push('Project title must be less than 100 characters')
  }
  
  if (!project.description?.trim()) {
    errors.push('Project description is required')
  } else if (project.description.length < 20) {
    errors.push('Description must be at least 20 characters')
  }
  
  if (!project.timeline?.trim()) {
    errors.push('Timeline is required')
  }
  
  if (project.estimatedHours && (project.estimatedHours < 1 || project.estimatedHours > 10000)) {
    errors.push('Estimated hours must be between 1 and 10,000')
  }
  
  if (project.budget && (project.budget.amount < 0 || project.budget.amount > 10000000)) {
    errors.push('Budget must be between 0 and 10,000,000')
  }
  
  return errors
}

// Search and filter helpers
export const searchProjects = (projects: CentralizedProject[], query: string): CentralizedProject[] => {
  if (!query.trim()) return projects
  
  const searchTerm = query.toLowerCase()
  return projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm) ||
    project.description.toLowerCase().includes(searchTerm) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    project.assignedEmployees.some(emp => {
      const user = centralizedDb.getUserById(emp.employeeId)
      return user?.name.toLowerCase().includes(searchTerm)
    })
  )
}

// Export helpers
export const prepareProjectForExport = (project: CentralizedProject) => {
  const metrics = calculateProjectMetrics(project)
  const assignedUsers = project.assignedEmployees.map(emp => {
    const user = centralizedDb.getUserById(emp.employeeId)
    return {
      name: user?.name || 'Unknown',
      role: emp.role,
      involvement: emp.involvementPercentage
    }
  })
  
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    priority: project.priority,
    timeline: project.timeline,
    progress: metrics.progress,
    health: metrics.health,
    teamSize: metrics.teamSize,
    totalInvolvement: metrics.totalInvolvement,
    budget: project.budget ? formatBudget(project.budget) : null,
    estimatedHours: project.estimatedHours,
    actualHours: project.actualHours,
    milestones: metrics.totalMilestones,
    completedMilestones: metrics.completedMilestones,
    tags: project.tags.join(', '),
    assignedTeam: assignedUsers,
    createdAt: formatDate(project.createdAt),
    updatedAt: formatDate(project.updatedAt),
    risks: metrics.risks.join('; ')
  }
}