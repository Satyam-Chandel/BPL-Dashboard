import React, { useState } from 'react'
import { centralizedDb, CentralizedProject } from '../utils/centralizedDb'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { 
  Edit, 
  Save, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  History
} from 'lucide-react'
import { toast } from 'sonner'

interface ProgressEditorProps {
  project: CentralizedProject
  isOpen: boolean
  onClose: () => void
  onProjectUpdate: (updatedProject: CentralizedProject) => void
}

export function ProgressEditor({ project, isOpen, onClose, onProjectUpdate }: ProgressEditorProps) {
  const { user: currentUser } = useAuth()
  const [newProgress, setNewProgress] = useState<number>(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate current progress
  const completedMilestones = project.milestones.filter(m => m.completed).length
  const totalMilestones = project.milestones.length
  const currentProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  // Check if user can edit progress (Program Manager only)
  const canEditProgress = currentUser && (
    currentUser.role === 'program_manager' || 
    currentUser.role === 'admin'
  )

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !canEditProgress) {
      toast.error('You do not have permission to edit project progress')
      return
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the progress update')
      return
    }

    if (newProgress < 0 || newProgress > 100) {
      toast.error('Progress must be between 0% and 100%')
      return
    }

    setLoading(true)
    try {
      // Create a snapshot for version tracking
      const progressSnapshot = {
        timestamp: new Date().toISOString(),
        previousProgress: currentProgress,
        newProgress: newProgress,
        updatedBy: currentUser.id,
        reason: reason.trim(),
        version: project.version + 1
      }

      // Update milestones based on new progress percentage
      const updatedMilestones = project.milestones.map((milestone, index) => {
        const milestoneThreshold = ((index + 1) / totalMilestones) * 100
        const shouldBeCompleted = newProgress >= milestoneThreshold
        
        if (shouldBeCompleted && !milestone.completed) {
          return {
            ...milestone,
            completed: true,
            completedAt: new Date().toISOString()
          }
        } else if (!shouldBeCompleted && milestone.completed) {
          return {
            ...milestone,
            completed: false,
            completedAt: undefined
          }
        }
        return milestone
      })

      // Update project with new progress and milestone states
      const updatedProject = centralizedDb.updateProject(
        project.id,
        {
          milestones: updatedMilestones,
          lastActivity: new Date().toISOString()
        },
        currentUser.id
      )

      if (updatedProject) {
        // Log the progress update activity
        centralizedDb.logActivity(
          currentUser.id,
          'UPDATE_PROGRESS',
          'project',
          project.id,
          `Updated project progress from ${currentProgress.toFixed(1)}% to ${newProgress}%: ${reason}`,
          progressSnapshot
        )

        toast.success(`Project progress updated to ${newProgress}%!`)
        onProjectUpdate(updatedProject)
        setReason('')
        setNewProgress(0)
        onClose()
      } else {
        toast.error('Failed to update project progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update project progress')
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600'
    if (progress >= 70) return 'text-blue-600'
    if (progress >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusFromProgress = (progress: number) => {
    if (progress === 100) return 'completed'
    if (progress > 0) return 'active'
    return 'pending'
  }

  if (!canEditProgress) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Access Denied
            </DialogTitle>
            <DialogDescription>
              Only Program Managers can edit project progress.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Project Progress
          </DialogTitle>
          <DialogDescription>
            Update the progress of "{project.title}" with a required reason for the change.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Progress Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Progress:</span>
                <span className={`font-bold text-lg ${getProgressColor(currentProgress)}`}>
                  {currentProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={currentProgress} className="w-full" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority: </span>
                  <Badge variant="outline">{project.priority}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Completed Milestones:</span>
                <span>{completedMilestones} of {totalMilestones}</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress Update Form */}
          <form onSubmit={handleProgressUpdate} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Update Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newProgress">New Progress Percentage *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="newProgress"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newProgress}
                      onChange={(e) => setNewProgress(parseFloat(e.target.value) || 0)}
                      placeholder="Enter new progress (0-100)"
                      required
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  {newProgress > 0 && (
                    <div className="mt-2">
                      <Progress value={newProgress} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span className={getProgressColor(newProgress)}>
                          {newProgress.toFixed(1)}%
                        </span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Progress Update *</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why you are updating the progress (required for audit trail)..."
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This reason will be logged in the project history for audit purposes.
                  </p>
                </div>

                {newProgress !== currentProgress && newProgress > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p>
                          <strong>Progress Change:</strong> {currentProgress.toFixed(1)}% → {newProgress.toFixed(1)}%
                        </p>
                        <p>
                          <strong>Status will change to:</strong> {getStatusFromProgress(newProgress)}
                        </p>
                        {totalMilestones > 0 && (
                          <p>
                            <strong>Milestones affected:</strong> {Math.floor((newProgress / 100) * totalMilestones)} of {totalMilestones} will be marked as completed
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !reason.trim() || newProgress === currentProgress}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Progress
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Version History Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-4 w-4" />
                <span>Current Version: v{project.version}</span>
                <span>•</span>
                <span>Last Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}