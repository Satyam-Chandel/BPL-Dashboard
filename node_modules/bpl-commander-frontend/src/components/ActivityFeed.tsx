import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { centralizedDb, ActivityLog } from '../utils/centralizedDb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback } from './ui/avatar'
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  MessageCircle,
  Target,
  Lightbulb,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { formatRelativeTime, formatDateTime } from '../utils/projectHelpers'

interface ActivityFeedProps {
  entityType?: 'project' | 'initiative' | 'user'
  entityId?: string
  showUserFilter?: boolean
  maxItems?: number
  className?: string
}

export function ActivityFeed({ 
  entityType, 
  entityId, 
  showUserFilter = false, 
  maxItems = 20,
  className = ""
}: ActivityFeedProps) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'projects' | 'initiatives' | 'users'>('all')

  useEffect(() => {
    fetchActivities()
  }, [entityType, entityId, filter, user])

  const fetchActivities = () => {
    try {
      setLoading(true)
      let fetchedActivities: ActivityLog[]

      if (entityType && entityId) {
        // Get activities for specific entity
        fetchedActivities = centralizedDb.getActivityLog(maxItems, entityType, entityId)
      } else {
        // Get general activity log
        fetchedActivities = centralizedDb.getActivityLog(maxItems)
      }

      // Apply filter
      if (filter !== 'all') {
        fetchedActivities = fetchedActivities.filter(activity => {
          switch (filter) {
            case 'projects': return activity.entityType === 'project'
            case 'initiatives': return activity.entityType === 'initiative'
            case 'users': return activity.entityType === 'user'
            default: return true
          }
        })
      }

      // Filter to only show activities the user can see
      if (user) {
        fetchedActivities = fetchedActivities.filter(activity => {
          if (activity.entityType === 'project') {
            return centralizedDb.canViewProject(user.id, activity.entityId)
          }
          if (activity.entityType === 'user' && user.role !== 'admin') {
            return activity.entityId === user.id || activity.userId === user.id
          }
          return true
        })
      }

      setActivities(fetchedActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATE_PROJECT':
      case 'CREATE_INITIATIVE':
      case 'CREATE_USER':
        return <Plus className="h-4 w-4" />
      case 'UPDATE_PROJECT':
      case 'UPDATE_INITIATIVE':
      case 'UPDATE_USER':
        return <Edit className="h-4 w-4" />
      case 'DELETE_PROJECT':
      case 'DELETE_INITIATIVE':
        return <Trash2 className="h-4 w-4" />
      case 'ASSIGN_EMPLOYEE':
      case 'REMOVE_EMPLOYEE':
        return <User className="h-4 w-4" />
      case 'ADD_COMMENT':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'CREATE_PROJECT':
      case 'CREATE_INITIATIVE':
      case 'CREATE_USER':
        return 'text-green-600 dark:text-green-400'
      case 'UPDATE_PROJECT':
      case 'UPDATE_INITIATIVE':
      case 'UPDATE_USER':
        return 'text-blue-600 dark:text-blue-400'
      case 'DELETE_PROJECT':
      case 'DELETE_INITIATIVE':
        return 'text-red-600 dark:text-red-400'
      case 'ASSIGN_EMPLOYEE':
        return 'text-purple-600 dark:text-purple-400'
      case 'REMOVE_EMPLOYEE':
        return 'text-orange-600 dark:text-orange-400'
      case 'ADD_COMMENT':
        return 'text-teal-600 dark:text-teal-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'project': return <Target className="h-3 w-3" />
      case 'initiative': return <Lightbulb className="h-3 w-3" />
      case 'user': return <User className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const formatActivityMessage = (activity: ActivityLog) => {
    const actor = centralizedDb.getUserById(activity.userId)
    const actorName = actor?.name || 'Unknown User'
    
    // Get entity information for context
    let entityName = 'Unknown'
    if (activity.entityType === 'project') {
      const project = centralizedDb.getProjectById(activity.entityId)
      entityName = project?.title || 'Unknown Project'
    } else if (activity.entityType === 'initiative') {
      const initiative = centralizedDb.getInitiatives().find(i => i.id === activity.entityId)
      entityName = initiative?.title || 'Unknown Initiative'
    } else if (activity.entityType === 'user') {
      const user = centralizedDb.getUserById(activity.entityId)
      entityName = user?.name || 'Unknown User'
    }

    return {
      actorName,
      entityName,
      details: activity.details
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </div>
          <Button variant="ghost" size="sm" onClick={fetchActivities}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        {!entityType && (
          <CardDescription>
            Latest updates and changes across your projects and initiatives
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Filter Buttons */}
        {showUserFilter && !entityType && (
          <div className="flex gap-2 mb-4">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'projects' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('projects')}
            >
              Projects
            </Button>
            <Button 
              variant={filter === 'initiatives' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('initiatives')}
            >
              Initiatives
            </Button>
            {user?.role === 'admin' && (
              <Button 
                variant={filter === 'users' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('users')}
              >
                Users
              </Button>
            )}
          </div>
        )}

        {/* Activity List */}
        <ScrollArea className="h-96">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const { actorName, entityName, details } = formatActivityMessage(activity)
                const actor = centralizedDb.getUserById(activity.userId)
                
                return (
                  <div key={`${activity.id}-${index}`} className="flex items-start gap-3 pb-4">
                    {/* Actor Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {actor?.name.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={getActivityColor(activity.action)}>
                          {getActivityIcon(activity.action)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getEntityIcon(activity.entityType)}
                          <span className="ml-1 capitalize">{activity.entityType}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm">
                        <span className="font-medium">{actorName}</span> {details.toLowerCase()}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground" title={formatDateTime(activity.timestamp)}>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDateTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        
        {activities.length > 0 && activities.length >= maxItems && (
          <div className="text-center pt-4 border-t">
            <Button variant="outline" size="sm" onClick={fetchActivities}>
              Load More Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}