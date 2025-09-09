import React, { useState, useEffect } from 'react'
import { centralizedDb, CentralizedProject } from '../utils/centralizedDb'
import { useAuth } from '../contexts/AuthContext'
import { ProgressEditor } from './ProgressEditor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Users, 
  Plus, 
  Minus, 
  Calendar, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Edit, 
  Save,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface ProjectDetailsProps {
  projectId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectDetails({ projectId, isOpen, onClose }: ProjectDetailsProps) {
  const { user: currentUser } = useAuth()
  const [project, setProject] = useState<CentralizedProject | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAssignEmployee, setShowAssignEmployee] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [showProgressEditor, setShowProgressEditor] = useState(false)

  // Assignment form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [involvementPercentage, setInvolvementPercentage] = useState(20)
  const [employeeRole, setEmployeeRole] = useState('')

  // Get available employees for assignment
  const availableEmployees = centralizedDb.getUsers().filter(user => 
    user.role === 'employee' || user.role === 'manager'
  )

  const assignedEmployees = project ? project.assignedEmployees.map(assignment => {
    const employee = centralizedDb.getUserById(assignment.employeeId)
    const workload = centralizedDb.getEmployeeWorkload(assignment.employeeId)
    return {
      ...assignment,
      employee,
      workload
    }
  }) : []

  const comments = project ? centralizedDb.getCommentsByProject(project.id) : []

  useEffect(() => {
    if (projectId && isOpen) {
      fetchProjectDetails()
    }
  }, [projectId, isOpen])

  const fetchProjectDetails = async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      const projectData = centralizedDb.getProjectById(projectId)
      setProject(projectData || null)
    } catch (error) {
      console.error('Error fetching project details:', error)
      toast.error('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignEmployee = async () => {
    if (!project || !selectedEmployeeId || !employeeRole) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if employee is already assigned
    const isAlreadyAssigned = project.assignedEmployees.some(
      assignment => assignment.employeeId === selectedEmployeeId
    )

    if (isAlreadyAssigned) {
      toast.error('This employee is already assigned to the project')
      return
    }

    // Check employee workload capacity
    const employeeWorkload = centralizedDb.getEmployeeWorkload(selectedEmployeeId)
    if (employeeWorkload.availableCapacity < involvementPercentage) {
      toast.error(`Employee only has ${employeeWorkload.availableCapacity.toFixed(1)}% available capacity`)
      return
    }

    const success = centralizedDb.assignEmployeeToProject(project.id, {
      employeeId: selectedEmployeeId,
      involvementPercentage,
      role: employeeRole
    })

    if (success) {
      toast.success('Employee assigned successfully!')
      fetchProjectDetails()
      setShowAssignEmployee(false)
      setSelectedEmployeeId('')
      setInvolvementPercentage(20)
      setEmployeeRole('')
    } else {
      toast.error('Failed to assign employee')
    }
  }

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!project) return

    const success = centralizedDb.removeEmployeeFromProject(project.id, employeeId)
    if (success) {
      toast.success('Employee removed from project')
      fetchProjectDetails()
    } else {
      toast.error('Failed to remove employee')
    }
  }

  const handleUpdateAssignment = async (employeeId: string, updates: { involvementPercentage?: number, role?: string }) => {
    if (!project) return

    const assignment = project.assignedEmployees.find(a => a.employeeId === employeeId)
    if (!assignment) return

    // Check workload if updating percentage
    if (updates.involvementPercentage && updates.involvementPercentage !== assignment.involvementPercentage) {
      const employeeWorkload = centralizedDb.getEmployeeWorkload(employeeId)
      const currentProjectWorkload = assignment.involvementPercentage
      const availableCapacity = employeeWorkload.availableCapacity + currentProjectWorkload
      
      if (updates.involvementPercentage > availableCapacity) {
        toast.error(`Cannot increase involvement. Available capacity: ${availableCapacity.toFixed(1)}%`)
        return
      }
    }

    const success = centralizedDb.assignEmployeeToProject(project.id, {
      employeeId,
      involvementPercentage: updates.involvementPercentage || assignment.involvementPercentage,
      role: updates.role || assignment.role
    })

    if (success) {
      toast.success('Assignment updated successfully!')
      fetchProjectDetails()
      setEditingAssignment(null)
    } else {
      toast.error('Failed to update assignment')
    }
  }

  const handleAddComment = async () => {
    if (!project || !currentUser || !newComment.trim()) return

    centralizedDb.addComment({
      projectId: project.id,
      userId: currentUser.id,
      comment: newComment.trim()
    })

    toast.success('Comment added successfully!')
    setNewComment('')
    fetchProjectDetails()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completedMilestones = project?.milestones.filter(m => m.completed).length || 0
  const totalMilestones = project?.milestones.length || 0
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  const totalInvolvement = assignedEmployees.reduce((sum, emp) => sum + emp.involvementPercentage, 0)
  const canManageProject = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.role === 'program_manager' || 
    currentUser.id === project?.managerId
  )

  const canEditProgress = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.role === 'program_manager'
  )

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading Project Details</DialogTitle>
            <DialogDescription>Please wait while we load the project information.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!project) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Project Not Found</DialogTitle>
            <DialogDescription>The requested project could not be loaded. Please try again or contact support.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-12">
            <h3>Project Not Found</h3>
            <p className="text-muted-foreground">The requested project could not be loaded.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {project.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
              <span>•</span>
              <span>{project.timeline}</span>
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="employees">Team ({assignedEmployees.length})</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Team Size</p>
                        <p className="text-2xl font-bold">{assignedEmployees.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</p>
                        {canEditProgress && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowProgressEditor(true)}
                            className="mt-2"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Involvement</p>
                        <p className="text-2xl font-bold">{totalInvolvement}%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>v{project.version}</span>
                    </div>
                    {project.budget && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget:</span>
                        <span>${project.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Time Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.estimatedHours && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Hours:</span>
                        <span>{project.estimatedHours}h</span>
                      </div>
                    )}
                    {project.actualHours && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actual Hours:</span>
                        <span>{project.actualHours}h</span>
                      </div>
                    )}
                    {project.estimatedHours && project.actualHours && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Efficiency:</span>
                        <span className={project.actualHours <= project.estimatedHours ? 'text-green-600' : 'text-red-600'}>
                          {((project.estimatedHours / project.actualHours) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3>Assigned Team Members</h3>
                {canManageProject && (
                  <Button onClick={() => setShowAssignEmployee(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Employee
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {assignedEmployees.map((assignment) => (
                  <Card key={assignment.employeeId}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {assignment.employee?.name.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{assignment.employee?.name || 'Unknown'}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.employee?.designation}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{assignment.role}</Badge>
                              <Badge variant="secondary">{assignment.involvementPercentage}% involvement</Badge>
                            </div>
                            <div className="mt-3 text-sm text-muted-foreground">
                              <p>Total Workload: {assignment.workload.totalWorkload.toFixed(1)}%</p>
                              <p>Available: {assignment.workload.availableCapacity.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                        
                        {canManageProject && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAssignment(assignment.employeeId)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveEmployee(assignment.employeeId)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingAssignment === assignment.employeeId && (
                        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                          <div className="space-y-3">
                            <div>
                              <Label>Role</Label>
                              <Input
                                defaultValue={assignment.role}
                                id={`role-${assignment.employeeId}`}
                              />
                            </div>
                            <div>
                              <Label>Involvement Percentage</Label>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                defaultValue={assignment.involvementPercentage}
                                id={`involvement-${assignment.employeeId}`}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAssignment(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const roleInput = document.getElementById(`role-${assignment.employeeId}`) as HTMLInputElement
                                  const involvementInput = document.getElementById(`involvement-${assignment.employeeId}`) as HTMLInputElement
                                  handleUpdateAssignment(assignment.employeeId, {
                                    role: roleInput.value,
                                    involvementPercentage: parseInt(involvementInput.value)
                                  })
                                }}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {assignedEmployees.length === 0 && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3>No Team Members Assigned</h3>
                      <p className="text-muted-foreground mb-4">
                        This project doesn't have any team members assigned yet.
                      </p>
                      {canManageProject && (
                        <Button onClick={() => setShowAssignEmployee(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Assign First Employee
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">Project Milestones</CardTitle>
                      <CardDescription>
                        {completedMilestones} of {totalMilestones} milestones completed
                      </CardDescription>
                    </div>
                    {canEditProgress && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowProgressEditor(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Progress
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall Progress:</span>
                    <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="mb-6" />
                  
                  <div className="space-y-4">
                    {project.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-start space-x-3">
                        <div className="mt-1">
                          {milestone.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${milestone.completed ? 'text-muted-foreground line-through' : ''}`}>
                              {milestone.title}
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${milestone.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                            {milestone.description}
                          </p>
                          {milestone.completed && milestone.completedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {project.milestones.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3>No Milestones Defined</h3>
                        <p className="text-muted-foreground">
                          This project doesn't have any milestones set up yet.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Discussion</CardTitle>
                  <CardDescription>
                    Collaborate with your team members on this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const commenter = centralizedDb.getUserById(comment.userId)
                      return (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {commenter?.name.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{commenter?.name || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.comment}</p>
                          </div>
                        </div>
                      )
                    })}

                    {comments.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3>No Comments Yet</h3>
                        <p className="text-muted-foreground">
                          Start the conversation about this project.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddComment} 
                          disabled={!newComment.trim()}
                          size="sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Dialog */}
      <Dialog open={showAssignEmployee} onOpenChange={setShowAssignEmployee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Employee to Project</DialogTitle>
            <DialogDescription>
              Select an employee and define their role and involvement in this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee-select">Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees
                    .filter(emp => !project?.assignedEmployees.some(a => a.employeeId === emp.id))
                    .map((employee) => {
                      const workload = centralizedDb.getEmployeeWorkload(employee.id)
                      return (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex flex-col">
                            <span>{employee.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Available: {workload.availableCapacity.toFixed(1)}%
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employee-role">Role in Project</Label>
              <Input
                id="employee-role"
                value={employeeRole}
                onChange={(e) => setEmployeeRole(e.target.value)}
                placeholder="e.g., Frontend Developer, Designer, QA Engineer"
              />
            </div>

            <div>
              <Label htmlFor="involvement">Involvement Percentage ({involvementPercentage}%)</Label>
              <input
                id="involvement"
                type="range"
                min="5"
                max="100"
                step="5"
                value={involvementPercentage}
                onChange={(e) => setInvolvementPercentage(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>5%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {selectedEmployeeId && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This employee currently has {centralizedDb.getEmployeeWorkload(selectedEmployeeId).availableCapacity.toFixed(1)}% available capacity.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAssignEmployee(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignEmployee}
                disabled={!selectedEmployeeId || !employeeRole}
              >
                Assign Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Editor Dialog */}
      {showProgressEditor && project && (
        <ProgressEditor 
          project={project}
          isOpen={showProgressEditor}
          onClose={() => setShowProgressEditor(false)}
          onProjectUpdate={(updatedProject) => {
            setProject(updatedProject)
            fetchProjectDetails()
          }}
        />
      )}
    </>
  )
}