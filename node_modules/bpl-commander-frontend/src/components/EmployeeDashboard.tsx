import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { centralizedDb, CentralizedProject, CentralizedInitiative } from '../utils/centralizedDb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Target, 
  Lightbulb, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Send
} from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeDashboard() {
  const { user: currentUser } = useAuth()
  const [projects, setProjects] = useState<CentralizedProject[]>([])
  const [initiatives, setInitiatives] = useState<CentralizedInitiative[]>([])
  const [workload, setWorkload] = useState({
    projectWorkload: 0,
    overBeyondWorkload: 0,
    totalWorkload: 0,
    availableCapacity: 0,
    overBeyondAvailable: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    if (currentUser) {
      fetchEmployeeData()
    }
  }, [currentUser])

  const fetchEmployeeData = async () => {
    if (!currentUser) return

    try {
      // Get projects assigned to current user
      const assignedProjects = centralizedDb.getProjectsByAssignee(currentUser.id)
      setProjects(assignedProjects)

      // Get initiatives assigned to current user
      const assignedInitiatives = centralizedDb.getInitiativesByAssignee(currentUser.id)
      setInitiatives(assignedInitiatives)

      // Calculate workload
      const employeeWorkload = centralizedDb.getEmployeeWorkload(currentUser.id)
      setWorkload(employeeWorkload)

    } catch (error) {
      console.error('Error fetching employee data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (projectId: string) => {
    if (!currentUser || !newComment.trim()) return

    try {
      centralizedDb.addComment({
        projectId,
        userId: currentUser.id,
        comment: newComment.trim()
      })

      toast.success('Comment added successfully!')
      setNewComment('')
      setSelectedProjectId(null)
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'on-hold': return 'bg-orange-100 text-orange-800'
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

  const calculateProjectProgress = (project: CentralizedProject) => {
    if (project.milestones.length === 0) return 0
    const completedMilestones = project.milestones.filter(m => m.completed).length
    return (completedMilestones / project.milestones.length) * 100
  }

  const getWorkloadStatus = () => {
    if (workload.totalWorkload > 100) return { color: 'text-red-600', status: 'Overloaded' }
    if (workload.totalWorkload > 80) return { color: 'text-orange-600', status: 'High' }
    if (workload.totalWorkload > 60) return { color: 'text-yellow-600', status: 'Moderate' }
    return { color: 'text-green-600', status: 'Light' }
  }

  const workloadStatus = getWorkloadStatus()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Employee Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.name}</p>
        </div>
      </div>

      {/* Workload Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Workload Overview
          </CardTitle>
          <CardDescription>Your current project assignments and capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Workload</p>
              <p className={`text-3xl font-bold ${workloadStatus.color}`}>
                {workload.totalWorkload.toFixed(1)}%
              </p>
              <p className={`text-sm ${workloadStatus.color}`}>{workloadStatus.status}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Project Work</p>
              <p className="text-2xl font-semibold">{workload.projectWorkload.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Over & Beyond</p>
              <p className="text-2xl font-semibold">{workload.overBeyondWorkload.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Max: 20%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Available Capacity</p>
              <p className="text-2xl font-semibold text-green-600">{workload.availableCapacity.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Project Workload</span>
                <span>{workload.projectWorkload.toFixed(1)}%</span>
              </div>
              <Progress value={workload.projectWorkload} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Over & Beyond Workload</span>
                <span>{workload.overBeyondWorkload.toFixed(1)}% / 20%</span>
              </div>
              <Progress value={(workload.overBeyondWorkload / 20) * 100} className="h-2" />
            </div>
          </div>

          {workload.totalWorkload > 100 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Your total workload exceeds 100%. 
                Please discuss with your manager about redistributing tasks.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">My Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="initiatives">Over & Beyond ({initiatives.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
              <CardDescription>Projects you're currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => {
                  const progress = calculateProjectProgress(project)
                  const myAssignment = project.assignedEmployees.find(emp => emp.employeeId === currentUser?.id)
                  const manager = centralizedDb.getUserById(project.managerId)
                  
                  return (
                    <Card key={project.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{project.title}</h3>
                              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                              <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProjectId(project.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Discuss
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">My Role:</span>
                            <span className="ml-2">{myAssignment?.role || 'Not assigned'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">My Involvement:</span>
                            <span className="ml-2">{myAssignment?.involvementPercentage || 0}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Timeline:</span>
                            <span className="ml-2">{project.timeline}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Manager:</span>
                            <span className="ml-2">{manager?.name || 'Unknown'}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {projects.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3>No Projects Assigned</h3>
                    <p className="text-muted-foreground">
                      You don't have any projects assigned yet. Check back later or contact your manager.
                    </p>
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
                Innovation projects and additional initiatives assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {initiatives.map((initiative) => {
                  const creator = centralizedDb.getUserById(initiative.createdBy)
                  const completionRate = initiative.actualHours && initiative.estimatedHours 
                    ? (initiative.actualHours / initiative.estimatedHours) * 100 
                    : 0

                  return (
                    <Card key={initiative.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{initiative.title}</h3>
                              <Badge className={getStatusColor(initiative.status)}>{initiative.status}</Badge>
                              <Badge className={getPriorityColor(initiative.priority)}>{initiative.priority}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{initiative.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Created by</p>
                              <p>{creator?.name || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Workload</p>
                              <p>{initiative.workloadPercentage}%</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Estimated Hours</p>
                              <p>{initiative.estimatedHours}h</p>
                            </div>
                          </div>
                          {initiative.dueDate && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Due Date</p>
                                <p>{new Date(initiative.dueDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{completionRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={completionRate} />
                        </div>

                        <div className="mt-3">
                          <Badge variant="outline">{initiative.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {initiatives.length === 0 && (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3>No Over & Beyond Initiatives</h3>
                    <p className="text-muted-foreground">
                      You don't have any Over & Beyond initiatives assigned yet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Discussion Dialog */}
      <Dialog open={!!selectedProjectId} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Discussion</DialogTitle>
            <DialogDescription>
              Add comments and communicate with your team about this project
            </DialogDescription>
          </DialogHeader>
          
          {selectedProjectId && (
            <div className="space-y-4">
              {(() => {
                const project = projects.find(p => p.id === selectedProjectId)
                const comments = project ? centralizedDb.getCommentsByProject(project.id) : []
                
                return (
                  <>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {comments.map((comment) => {
                        const commenter = centralizedDb.getUserById(comment.userId)
                        return (
                          <div key={comment.id} className="flex space-x-3 p-3 bg-muted rounded-lg">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {commenter?.name.charAt(0) || '?'}
                              </span>
                            </div>
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
                          <p className="text-muted-foreground">Start the conversation about this project.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="comment">Add a comment</Label>
                      <Textarea
                        id="comment"
                        placeholder="Share updates, ask questions, or provide feedback..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => handleAddComment(selectedProjectId)} 
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}