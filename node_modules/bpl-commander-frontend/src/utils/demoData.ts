// Demo data store for the application
export interface DemoProject {
  id: string
  title: string
  description: string
  assigneeId: string
  managerId: string
  timeline: string
  involvementPercentage: number
  status: 'pending' | 'active' | 'completed'
  createdAt: string
  updatedAt: string
  version: number
}

export interface DemoUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'program_manager' | 'rd_manager' | 'manager' | 'employee'
  designation: string
  managerId?: string
  createdAt: string
  isActive: boolean
  password?: string
}

export interface DemoInitiative {
  id: string
  title: string
  description: string
  category: string
  createdBy: string
  assignedTo?: string
  createdAt: string
  status: 'pending' | 'active' | 'completed'
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
}

export interface DemoComment {
  id: string
  projectId: string
  userId: string
  comment: string
  createdAt: string
}

class DemoDataStore {
  private users: DemoUser[] = [
    {
      id: 'admin-001',
      email: 'admin@bplcommander.com',
      name: 'System Admin',
      role: 'admin',
      designation: 'System Administrator',
      managerId: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      password: 'admin123'
    },
    {
      id: 'program-manager-001',
      email: 'program.manager@bplcommander.com',
      name: 'Program Manager',
      role: 'program_manager',
      designation: 'Senior Program Manager',
      managerId: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      password: 'program123'
    },
    {
      id: 'rd-manager-001',
      email: 'rd.manager@bplcommander.com',
      name: 'R&D Manager',
      role: 'rd_manager',
      designation: 'Research & Development Manager',
      managerId: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      password: 'rd123'
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
      password: 'manager123'
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
      password: 'employee123'
    }
  ]

  private projects: DemoProject[] = [
    {
      id: 'project-001',
      title: 'E-commerce Platform Development',
      description: 'Build a modern e-commerce platform with React and Node.js',
      assigneeId: 'employee-001',
      managerId: 'program-manager-001',
      timeline: '3 months',
      involvementPercentage: 60,
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      version: 1
    },
    {
      id: 'project-002',
      title: 'Mobile App UI/UX Design',
      description: 'Design user interface and experience for mobile application',
      assigneeId: 'employee-001',
      managerId: 'program-manager-001',
      timeline: '2 months',
      involvementPercentage: 40,
      status: 'pending',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      version: 1
    }
  ]

  private initiatives: DemoInitiative[] = [
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
      estimatedHours: 20
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
      estimatedHours: 80
    }
  ]

  private comments: DemoComment[] = [
    {
      id: 'comment-001',
      projectId: 'project-001',
      userId: 'employee-001',
      comment: 'I need more details about the payment gateway integration requirements.',
      createdAt: '2024-01-16T00:00:00Z'
    },
    {
      id: 'comment-002',
      projectId: 'project-001',
      userId: 'program-manager-001',
      comment: 'Please review the technical specifications document I shared.',
      createdAt: '2024-01-17T00:00:00Z'
    }
  ]

  // Users
  getUsers(): DemoUser[] {
    return [...this.users]
  }

  addUser(user: Omit<DemoUser, 'id' | 'createdAt'>): DemoUser {
    const newUser: DemoUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      password: user.password || 'defaultpass123'
    }
    this.users.push(newUser)
    return newUser
  }

  getUserById(id: string): DemoUser | undefined {
    return this.users.find(user => user.id === id)
  }

  getUsersByRole(role: DemoUser['role']): DemoUser[] {
    return this.users.filter(user => user.role === role)
  }

  updateUser(id: string, updates: Partial<DemoUser>): DemoUser | null {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates
    }
    return this.users[userIndex]
  }

  // Projects
  getProjects(): DemoProject[] {
    return [...this.projects]
  }

  getProjectsByAssignee(assigneeId: string): DemoProject[] {
    return this.projects.filter(project => project.assigneeId === assigneeId)
  }

  getProjectsByManager(managerId: string): DemoProject[] {
    return this.projects.filter(project => project.managerId === managerId)
  }

  addProject(project: Omit<DemoProject, 'id' | 'createdAt' | 'updatedAt' | 'version'>): DemoProject {
    const newProject: DemoProject = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
    this.projects.push(newProject)
    return newProject
  }

  updateProject(id: string, updates: Partial<DemoProject>): DemoProject | null {
    const projectIndex = this.projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return null

    this.projects[projectIndex] = {
      ...this.projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: this.projects[projectIndex].version + 1
    }
    return this.projects[projectIndex]
  }

  deleteProject(id: string): boolean {
    const projectIndex = this.projects.findIndex(p => p.id === id)
    if (projectIndex === -1) return false
    
    this.projects.splice(projectIndex, 1)
    return true
  }

  // Initiatives (Over & Beyond)
  getInitiatives(): DemoInitiative[] {
    return [...this.initiatives]
  }

  getInitiativesByCreator(creatorId: string): DemoInitiative[] {
    return this.initiatives.filter(initiative => initiative.createdBy === creatorId)
  }

  getInitiativesByAssignee(assigneeId: string): DemoInitiative[] {
    return this.initiatives.filter(initiative => initiative.assignedTo === assigneeId)
  }

  addInitiative(initiative: Omit<DemoInitiative, 'id' | 'createdAt'>): DemoInitiative {
    const newInitiative: DemoInitiative = {
      ...initiative,
      id: `initiative-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    this.initiatives.push(newInitiative)
    return newInitiative
  }

  updateInitiative(id: string, updates: Partial<DemoInitiative>): DemoInitiative | null {
    const initiativeIndex = this.initiatives.findIndex(i => i.id === id)
    if (initiativeIndex === -1) return null

    this.initiatives[initiativeIndex] = {
      ...this.initiatives[initiativeIndex],
      ...updates
    }
    return this.initiatives[initiativeIndex]
  }

  deleteInitiative(id: string): boolean {
    const initiativeIndex = this.initiatives.findIndex(i => i.id === id)
    if (initiativeIndex === -1) return false
    
    this.initiatives.splice(initiativeIndex, 1)
    return true
  }

  // Comments
  getCommentsByProject(projectId: string): DemoComment[] {
    return this.comments.filter(comment => comment.projectId === projectId)
  }

  addComment(comment: Omit<DemoComment, 'id' | 'createdAt'>): DemoComment {
    const newComment: DemoComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    this.comments.push(newComment)
    return newComment
  }

  // Helper methods
  canCreateProjects(userId: string): boolean {
    const user = this.getUserById(userId)
    return user?.role === 'admin' || user?.role === 'program_manager'
  }

  canCreateInitiatives(userId: string): boolean {
    const user = this.getUserById(userId)
    return user?.role === 'admin' || user?.role === 'program_manager' || user?.role === 'rd_manager'
  }

  canAssignProjects(userId: string): boolean {
    const user = this.getUserById(userId)
    return user?.role === 'admin' || user?.role === 'program_manager' || user?.role === 'manager'
  }

  getWorkload(employeeId: string): number {
    const projects = this.getProjectsByAssignee(employeeId)
    const initiatives = this.getInitiativesByAssignee(employeeId)
    
    const projectWorkload = projects
      .filter(p => p.status === 'active')
      .reduce((total, project) => total + project.involvementPercentage, 0)
    
    const initiativeWorkload = initiatives
      .filter(i => i.status === 'active')
      .reduce((total, initiative) => total + (initiative.estimatedHours || 0) / 4, 0) // Convert hours to percentage
    
    return projectWorkload + initiativeWorkload
  }
}

export const demoDataStore = new DemoDataStore()