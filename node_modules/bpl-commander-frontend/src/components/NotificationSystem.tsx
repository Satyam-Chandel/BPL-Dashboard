import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { centralizedDb, CentralizedProject, CentralizedInitiative } from '../utils/centralizedDb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Users, 
  DollarSign,
  TrendingUp,
  Clock,
  X,
  Settings
} from 'lucide-react'
import { formatRelativeTime, formatDate } from '../utils/projectHelpers'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'deadline' | 'workload' | 'assignment' | 'milestone' | 'budget' | 'comment' | 'status'
  title: string
  message: string
  entityId: string
  entityType: 'project' | 'initiative' | 'user'
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  createdAt: string
  actionUrl?: string
}

export function NotificationSystem() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('unread')

  useEffect(() => {
    if (user) {
      generateNotifications()
      // Check for notifications every 5 minutes
      const interval = setInterval(generateNotifications, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const generateNotifications = () => {
    if (!user) return

    const newNotifications: Notification[] = []
    const now = new Date()

    // Get user's projects and initiatives
    const projects = centralizedDb.getProjects().filter(p => 
      centralizedDb.canViewProject(user.id, p.id)
    )
    const initiatives = centralizedDb.getInitiatives().filter(i =>
      i.createdBy === user.id || i.assignedTo === user.id
    )

    // Check for overdue milestones
    projects.forEach(project => {
      project.milestones.forEach(milestone => {
        if (!milestone.completed && new Date(milestone.dueDate) < now) {
          newNotifications.push({
            id: `overdue-${project.id}-${milestone.id}`,
            type: 'deadline',
            title: 'Overdue Milestone',
            message: `"${milestone.title}" in project "${project.title}" is overdue`,
            entityId: project.id,
            entityType: 'project',
            priority: 'high',
            read: false,
            createdAt: new Date().toISOString()
          })
        }
      })
    })

    // Check for workload issues
    if (user.role === 'employee' || user.role === 'manager') {
      const workload = centralizedDb.getEmployeeWorkload(user.id)
      if (workload.totalWorkload > 100) {
        newNotifications.push({
          id: `workload-${user.id}`,
          type: 'workload',
          title: 'Workload Exceeded',
          message: `Your total workload is ${workload.totalWorkload.toFixed(1)}%, which exceeds the recommended limit`,
          entityId: user.id,
          entityType: 'user',
          priority: 'critical',
          read: false,
          createdAt: new Date().toISOString()
        })
      } else if (workload.overBeyondWorkload > 15) {
        newNotifications.push({
          id: `over-beyond-${user.id}`,
          type: 'workload',
          title: 'High Over & Beyond Workload',
          message: `Your Over & Beyond workload is ${workload.overBeyondWorkload.toFixed(1)}%, approaching the 20% limit`,
          entityId: user.id,
          entityType: 'user',
          priority: 'medium',
          read: false,
          createdAt: new Date().toISOString()
        })
      }
    }

    // Check for upcoming deadlines (next 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    projects.forEach(project => {
      project.milestones.forEach(milestone => {
        const dueDate = new Date(milestone.dueDate)
        if (!milestone.completed && dueDate <= sevenDaysFromNow && dueDate > now) {
          newNotifications.push({
            id: `upcoming-${project.id}-${milestone.id}`,
            type: 'deadline',
            title: 'Upcoming Deadline',
            message: `"${milestone.title}" in project "${project.title}" is due on ${formatDate(milestone.dueDate)}`,
            entityId: project.id,
            entityType: 'project',
            priority: 'medium',
            read: false,
            createdAt: new Date().toISOString()
          })
        }
      })
    })

    initiatives.forEach(initiative => {
      if (initiative.dueDate) {
        const dueDate = new Date(initiative.dueDate)
        if (initiative.status !== 'completed' && dueDate <= sevenDaysFromNow && dueDate > now) {
          newNotifications.push({
            id: `initiative-due-${initiative.id}`,
            type: 'deadline',
            title: 'Initiative Deadline Approaching',
            message: `Initiative "${initiative.title}" is due on ${formatDate(initiative.dueDate)}`,
            entityId: initiative.id,
            entityType: 'initiative',
            priority: 'medium',
            read: false,
            createdAt: new Date().toISOString()
          })
        }
      }
    })

    // Check for projects without team members (for managers)
    if (['admin', 'program_manager', 'manager'].includes(user.role)) {
      projects.filter(p => p.managerId === user.id || user.role === 'admin').forEach(project => {
        if (project.status === 'active' && project.assignedEmployees.length === 0) {
          newNotifications.push({
            id: `no-team-${project.id}`,
            type: 'assignment',
            title: 'Project Needs Team',
            message: `Active project "${project.title}" has no assigned team members`,
            entityId: project.id,
            entityType: 'project',
            priority: 'high',
            read: false,
            createdAt: new Date().toISOString()
          })
        }
      })
    }

    // Check for budget alerts (if budget is consumed over 80%)
    projects.forEach(project => {
      if (project.budget && project.actualHours && project.estimatedHours) {
        const budgetUtilization = (project.actualHours / project.estimatedHours) * 100
        if (budgetUtilization > 80) {
          newNotifications.push({
            id: `budget-${project.id}`,
            type: 'budget',
            title: budgetUtilization > 100 ? 'Budget Exceeded' : 'Budget Alert',
            message: `Project "${project.title}" has used ${budgetUtilization.toFixed(1)}% of estimated hours`,
            entityId: project.id,
            entityType: 'project',
            priority: budgetUtilization > 100 ? 'critical' : 'high',
            read: false,
            createdAt: new Date().toISOString()
          })
        }
      }
    })

    // Remove notifications that are no longer relevant
    setNotifications(prev => {
      const relevantIds = newNotifications.map(n => n.id)
      const existingRelevant = prev.filter(n => 
        relevantIds.includes(n.id) || n.read // Keep read notifications
      )
      
      // Add new notifications
      const existingIds = existingRelevant.map(n => n.id)
      const actuallyNew = newNotifications.filter(n => !existingIds.includes(n.id))
      
      // Show toast for new high/critical priority notifications
      actuallyNew.forEach(notification => {
        if (notification.priority === 'high' || notification.priority === 'critical') {
          toast.warning(notification.title, {
            description: notification.message,
            duration: 6000
          })
        }
      })
      
      return [...existingRelevant, ...actuallyNew]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <Calendar className="h-4 w-4" />
      case 'workload': return <TrendingUp className="h-4 w-4" />
      case 'assignment': return <Users className="h-4 w-4" />
      case 'milestone': return <CheckCircle className="h-4 w-4" />
      case 'budget': return <DollarSign className="h-4 w-4" />
      case 'comment': return <Bell className="h-4 w-4" />
      case 'status': return <AlertTriangle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-muted-foreground'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read
      case 'high': return notification.priority === 'high' || notification.priority === 'critical'
      case 'all': return true
      default: return true
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </Button>
            <Button 
              variant={filter === 'high' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('high')}
            >
              High Priority
            </Button>
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          <div className="px-6 pb-6">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      !notification.read ? 'bg-muted/50' : ''
                    }`}>
                      <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                      )}
                    </div>
                    {index < filteredNotifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}