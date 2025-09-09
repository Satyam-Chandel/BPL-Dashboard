import React from 'react'
import { CentralizedProject, centralizedDb } from '../../utils/centralizedDb'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { 
  Eye, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  MessageCircle
} from 'lucide-react'
import { 
  calculateProjectProgress, 
  calculateTotalInvolvement, 
  getStatusColor, 
  getPriorityColor,
  formatBudget,
  formatDate,
  formatRelativeTime,
  getProjectHealth,
  getProjectRisk
} from '../../utils/projectHelpers'

interface ProjectCardProps {
  project: CentralizedProject
  onViewDetails: (projectId: string) => void
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const progress = calculateProjectProgress(project)
  const assignedCount = project.assignedEmployees.length
  const totalInvolvement = calculateTotalInvolvement(project)
  const health = getProjectHealth(project)
  const risks = getProjectRisk(project)
  
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'healthy': return 'text-green-600 dark:text-green-400'
      default: return 'text-muted-foreground'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <TrendingUp className="h-4 w-4" />
      case 'healthy': return <TrendingUp className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg leading-tight">{project.title}</h3>
                <div className="flex items-center gap-1">
                  <span className={getHealthColor(health)}>
                    {getHealthIcon(health)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(project.status)} variant="secondary">
                  {project.status.replace('-', ' ')}
                </Badge>
                <Badge className={getPriorityColor(project.priority)} variant="secondary">
                  {project.priority} priority
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(project.id)}
              className="shrink-0"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-xs">Timeline</span>
                <span className="font-medium">{project.timeline}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-xs">Team Size</span>
                <span className="font-medium">{assignedCount} members</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-xs">Progress</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-xs">Involvement</span>
                <span className="font-medium">{totalInvolvement}%</span>
              </div>
            </div>
          </div>
          
          {/* Budget Information */}
          {project.budget && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground text-xs">Budget</span>
                <span className="ml-2 font-medium">{formatBudget(project.budget)}</span>
                {project.budget.notes && (
                  <span className="text-muted-foreground ml-1">({project.budget.notes})</span>
                )}
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Risk Indicators */}
          {risks.length > 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">Risks: </span>
                <span className="text-muted-foreground">{risks.join(', ')}</span>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{project.tags.length - 3} more
                </Badge>
              )}
            </div>
            
            {/* Team Avatars and Activity */}
            <div className="flex items-center gap-3">
              {/* Discussion Count */}
              {project.discussionCount !== undefined && project.discussionCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="h-3 w-3" />
                  {project.discussionCount}
                </div>
              )}
              
              {/* Team Avatars */}
              {project.assignedEmployees.length > 0 && (
                <div className="flex items-center -space-x-2">
                  {project.assignedEmployees.slice(0, 3).map((emp) => {
                    const user = centralizedDb.getUserById(emp.employeeId)
                    return (
                      <Avatar key={emp.employeeId} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {user?.name.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {project.assignedEmployees.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">+{project.assignedEmployees.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Last Activity */}
              {project.lastActivity && (
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(project.lastActivity)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}