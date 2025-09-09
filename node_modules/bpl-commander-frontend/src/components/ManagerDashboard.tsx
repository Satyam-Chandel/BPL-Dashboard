import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { centralizedDb, CentralizedProject, CentralizedInitiative, BudgetInfo } from '../utils/centralizedDb'
import { ExportSystem } from './ExportSystem'
import { ProjectDetails } from './ProjectDetails'
import { ProjectCard } from './project/ProjectCard'
import { ProjectCreateDialog } from './project/ProjectCreateDialog'
import { DashboardStats } from './project/DashboardStats'
import { InitiativeCreateDialog } from './initiatives/InitiativeCreateDialog'
import { InitiativesList } from './initiatives/InitiativesList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Plus, Download, Target, Lightbulb, Search, Filter, Activity } from 'lucide-react'
import { toast } from 'sonner'

export function ManagerDashboard() {
  const { user: currentUser } = useAuth()
  const [projects, setProjects] = useState<CentralizedProject[]>([])
  const [filteredProjects, setFilteredProjects] = useState<CentralizedProject[]>([])
  const [initiatives, setInitiatives] = useState<CentralizedInitiative[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateInitiative, setShowCreateInitiative] = useState(false)
  const [showExportSystem, setShowExportSystem] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  
  // Form states with improved structure
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    timeline: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    estimatedHours: '',
    budget: '',
    currency: 'USD',
    tags: [] as string[]
  })

  const [initiativeForm, setInitiativeForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedHours: 10,
    workloadPercentage: 5,
    assignedTo: '',
    dueDate: ''
  })

  useEffect(() => {
    fetchData()
  }, [currentUser])

  useEffect(() => {
    filterProjects()
  }, [projects, searchQuery, statusFilter, priorityFilter])

  const fetchData = async () => {
    if (!currentUser) return
    
    try {
      setLoading(true)
      const allProjects = centralizedDb.getProjects()
      const allInitiatives = centralizedDb.getInitiatives()
      
      // Filter based on user role and permissions
      if (currentUser.role === 'admin') {
        setProjects(allProjects)
        setInitiatives(allInitiatives)
      } else if (currentUser.role === 'program_manager') {
        setProjects(allProjects)
        setInitiatives(allInitiatives)
      } else if (currentUser.role === 'rd_manager') {
        setProjects(allProjects.filter(p => 
          p.managerId === currentUser.id || 
          p.assignedEmployees.some(emp => emp.employeeId === currentUser.id)
        ))
        setInitiatives(allInitiatives)
      } else if (currentUser.role === 'manager') {
        setProjects(allProjects.filter(p => 
          p.managerId === currentUser.id ||
          p.assignedEmployees.some(emp => emp.employeeId === currentUser.id)
        ))
        setInitiatives(allInitiatives.filter(i => 
          i.createdBy === currentUser.id || i.assignedTo === currentUser.id
        ))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = [...projects]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter)
    }

    setFilteredProjects(filtered)
  }

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      timeline: '',
      priority: 'medium',
      estimatedHours: '',
      budget: '',
      currency: 'USD',
      tags: []
    })
  }

  const resetInitiativeForm = () => {
    setInitiativeForm({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      estimatedHours: 10,
      workloadPercentage: 5,
      assignedTo: '',
      dueDate: ''
    })
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const canCreateProjects = centralizedDb.canCreateProjects(currentUser.id)
    if (!canCreateProjects) {
      toast.error('You do not have permission to create projects')
      return
    }

    try {
      // Prepare budget information if provided
      let budget: BudgetInfo | undefined
      if (projectForm.budget && parseFloat(projectForm.budget) > 0) {
        budget = {
          amount: parseFloat(projectForm.budget),
          currency: projectForm.currency,
          allocatedAt: new Date().toISOString(),
          allocatedBy: currentUser.id,
          notes: 'Initial budget allocation'
        }
      }

      const newProject = centralizedDb.addProject({
        title: projectForm.title,
        description: projectForm.description,
        managerId: currentUser.id,
        timeline: projectForm.timeline,
        status: 'pending',
        priority: projectForm.priority,
        assignedEmployees: [],
        milestones: [],
        tags: projectForm.tags,
        estimatedHours: projectForm.estimatedHours ? parseInt(projectForm.estimatedHours) : undefined,
        budget
      }, currentUser.id)

      setProjects([...projects, newProject])
      toast.success(`Project "${newProject.title}" created successfully!`)
      
      resetProjectForm()
      setShowCreateProject(false)
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  const handleCreateInitiative = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const canCreateInitiatives = centralizedDb.canCreateInitiatives(currentUser.id)
    if (!canCreateInitiatives) {
      toast.error('You do not have permission to create Over & Beyond initiatives')
      return
    }

    try {
      if (initiativeForm.assignedTo) {
        const employeeWorkload = centralizedDb.getEmployeeWorkload(initiativeForm.assignedTo)
        const user = centralizedDb.getUserById(initiativeForm.assignedTo)
        const overBeyondCap = user?.overBeyondCap || 20
        
        if ((employeeWorkload.overBeyondWorkload + initiativeForm.workloadPercentage) > overBeyondCap) {
          toast.error(`Assignment would exceed ${overBeyondCap}% Over & Beyond limit. Current: ${employeeWorkload.overBeyondWorkload.toFixed(1)}%`)
          return
        }
      }

      const newInitiative = centralizedDb.addInitiative({
        title: initiativeForm.title,
        description: initiativeForm.description,
        category: initiativeForm.category,
        createdBy: currentUser.id,
        assignedTo: initiativeForm.assignedTo || undefined,
        status: 'pending',
        priority: initiativeForm.priority,
        estimatedHours: initiativeForm.estimatedHours,
        workloadPercentage: initiativeForm.workloadPercentage,
        dueDate: initiativeForm.dueDate || undefined
      }, currentUser.id)

      if (newInitiative) {
        setInitiatives([...initiatives, newInitiative])
        toast.success(`Initiative "${newInitiative.title}" created successfully!`)
        
        resetInitiativeForm()
        setShowCreateInitiative(false)
      }
    } catch (error) {
      console.error('Error creating initiative:', error)
      toast.error('Failed to create initiative')
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const canCreateProjects = currentUser && centralizedDb.canCreateProjects(currentUser.id)
  const canCreateInitiatives = currentUser && centralizedDb.canCreateInitiatives(currentUser.id)

  const uniqueTeamMembers = Array.from(
    new Set(projects.flatMap(p => p.assignedEmployees.map(e => e.employeeId)))
  ).length

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowExportSystem(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          {canCreateProjects && (
            <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
          {canCreateInitiatives && (
            <Dialog open={showCreateInitiative} onOpenChange={setShowCreateInitiative}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Create Initiative
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats
        totalProjects={projects.length}
        activeProjects={projects.filter(p => p.status === 'active').length}
        totalInitiatives={initiatives.length}
        uniqueTeamMembers={uniqueTeamMembers}
      />

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="initiatives">Over & Beyond ({initiatives.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Projects Overview
              </CardTitle>
              <CardDescription>Manage your projects and track progress</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search projects by title, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredProjects.length} of {projects.length} projects
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={setSelectedProjectId}
                  />
                ))}

                {filteredProjects.length === 0 && projects.length > 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No projects match your filters</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}

                {projects.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {canCreateProjects 
                        ? "Create your first project to get started" 
                        : "No projects have been assigned to you yet"}
                    </p>
                    {canCreateProjects && (
                      <Button onClick={() => setShowCreateProject(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Project
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="initiatives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Over & Beyond Initiatives
              </CardTitle>
              <CardDescription>
                Manage innovation projects and additional initiatives (20% workload cap enforced)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InitiativesList
                initiatives={initiatives}
                canCreateInitiatives={!!canCreateInitiatives}
                onCreateInitiative={() => setShowCreateInitiative(true)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProjectCreateDialog
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSubmit={handleCreateProject}
        formData={projectForm}
        setFormData={setProjectForm}
      />

      <InitiativeCreateDialog
        isOpen={showCreateInitiative}
        onClose={() => setShowCreateInitiative(false)}
        onSubmit={handleCreateInitiative}
        formData={initiativeForm}
        setFormData={setInitiativeForm}
      />

      <ExportSystem 
        isOpen={showExportSystem} 
        onClose={() => setShowExportSystem(false)} 
      />

      <ProjectDetails
        projectId={selectedProjectId}
        isOpen={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  )
}