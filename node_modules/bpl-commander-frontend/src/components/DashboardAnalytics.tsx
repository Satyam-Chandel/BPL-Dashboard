import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { centralizedDb } from '../utils/centralizedDb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Lightbulb, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react'
import { useCurrency } from './CurrencySelector'

interface AnalyticsData {
  statusData: { name: string; value: number; color: string; percentage: number }[]
  priorityData: { name: string; value: number; color: string; percentage: number }[]
  workloadData: { name: string; projectLoad: number; overBeyond: number; total: number; available: number }[]
  budgetData: { name: string; budget: number; currency: string; utilization: number }[]
  timelineData: { month: string; projects: number }[]
  teamPerformance: { name: string; completed: number; active: number; total: number; completionRate: number }[]
  metrics: {
    totalProjects: number
    activeProjects: number
    totalInitiatives: number
    totalBudget: number
    avgProgress: number
    overloadedEmployees: number
    highPriorityProjects: number
    teamMembers: number
  }
}

export function DashboardAnalytics() {
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      generateAnalytics()
    }
  }, [user])

  const generateAnalytics = () => {
    try {
      const projects = centralizedDb.getProjects()
      const initiatives = centralizedDb.getInitiatives()
      const users = centralizedDb.getUsers()

      // Filter data based on user permissions
      const visibleProjects = projects.filter(p => centralizedDb.canViewProject(user!.id, p.id))
      const visibleInitiatives = user!.role === 'admin' ? initiatives : 
        initiatives.filter(i => i.createdBy === user!.id || i.assignedTo === user!.id)

      // Project Status Distribution
      const statusDistribution = visibleProjects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalProjects = visibleProjects.length
      const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
        name: status.replace('-', ' '),
        value: count,
        color: getStatusColor(status),
        percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0
      }))

      // Priority Distribution
      const priorityDistribution = visibleProjects.reduce((acc, project) => {
        acc[project.priority] = (acc[project.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const priorityData = Object.entries(priorityDistribution).map(([priority, count]) => ({
        name: priority,
        value: count,
        color: getPriorityColor(priority),
        percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0
      }))

      // Workload Analysis
      const workloadData = users
        .filter(u => u.role === 'employee' || u.role === 'manager')
        .map(u => {
          const workload = centralizedDb.getEmployeeWorkload(u.id)
          return {
            name: u.name,
            projectLoad: workload.projectWorkload,
            overBeyond: workload.overBeyondWorkload,
            total: workload.totalWorkload,
            available: workload.availableCapacity
          }
        })
        .sort((a, b) => b.total - a.total)

      // Budget Analysis
      const budgetData = visibleProjects
        .filter(p => p.budget)
        .map(p => ({
          name: p.title.substring(0, 20) + (p.title.length > 20 ? '...' : ''),
          budget: p.budget!.amount,
          currency: p.budget!.currency,
          utilization: p.actualHours && p.estimatedHours ? 
            (p.actualHours / p.estimatedHours) * 100 : 0
        }))

      // Timeline Analysis
      const timelineData = visibleProjects.map(p => {
        const createdMonth = new Date(p.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        })
        return { month: createdMonth, projects: 1 }
      }).reduce((acc, curr) => {
        const existing = acc.find(item => item.month === curr.month)
        if (existing) {
          existing.projects += 1
        } else {
          acc.push(curr)
        }
        return acc
      }, [] as Array<{month: string, projects: number}>)
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

      // Team Performance
      const teamPerformance = users
        .filter(u => u.role === 'employee')
        .map(u => {
          const userProjects = visibleProjects.filter(p => 
            p.assignedEmployees.some(emp => emp.employeeId === u.id)
          )
          const completedProjects = userProjects.filter(p => p.status === 'completed').length
          const activeProjects = userProjects.filter(p => p.status === 'active').length
          
          return {
            name: u.name,
            completed: completedProjects,
            active: activeProjects,
            total: userProjects.length,
            completionRate: userProjects.length > 0 ? 
              (completedProjects / userProjects.length) * 100 : 0
          }
        })
        .filter(u => u.total > 0)
        .sort((a, b) => b.completionRate - a.completionRate)

      // Key Metrics
      const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0)
      const avgProjectProgress = visibleProjects.reduce((sum, p) => {
        const progress = p.milestones.length > 0 ? 
          (p.milestones.filter(m => m.completed).length / p.milestones.length) * 100 : 0
        return sum + progress
      }, 0) / (visibleProjects.length || 1)

      const overloadedEmployees = workloadData.filter(u => u.total > 100).length
      const highPriorityProjects = visibleProjects.filter(p => 
        p.priority === 'high' || p.priority === 'critical'
      ).length

      setAnalytics({
        statusData,
        priorityData,
        workloadData: workloadData.slice(0, 10), // Top 10
        budgetData,
        timelineData,
        teamPerformance: teamPerformance.slice(0, 8), // Top 8
        metrics: {
          totalProjects: visibleProjects.length,
          activeProjects: visibleProjects.filter(p => p.status === 'active').length,
          totalInitiatives: visibleInitiatives.length,
          totalBudget,
          avgProgress: avgProjectProgress,
          overloadedEmployees,
          highPriorityProjects,
          teamMembers: workloadData.length
        }
      })
    } catch (error) {
      console.error('Error generating analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#22c55e',
      completed: '#3b82f6',
      pending: '#eab308',
      'on-hold': '#f97316',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#22c55e'
    }
    return colors[priority] || '#6b7280'
  }

  if (loading || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dashboard Analytics
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
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{analytics.metrics.totalProjects}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">{analytics.metrics.activeProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{analytics.metrics.avgProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.metrics.highPriorityProjects}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Current status of all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.statusData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="capitalize">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.value}</span>
                          <span className="text-sm text-muted-foreground">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Project priorities breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.priorityData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="capitalize">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.value}</span>
                          <span className="text-sm text-muted-foreground">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Creation Timeline</CardTitle>
              <CardDescription>Projects created over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.timelineData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{item.month}</span>
                    </div>
                    <Badge variant="outline">
                      {item.projects} project{item.projects !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Workload Analysis
              </CardTitle>
              <CardDescription>
                Current workload distribution across team members
                {analytics.metrics.overloadedEmployees > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {analytics.metrics.overloadedEmployees} overloaded
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.workloadData.map((member, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{member.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.total > 100 ? "destructive" : member.total > 80 ? "default" : "secondary"}>
                          {member.total.toFixed(1)}% total
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Projects: {member.projectLoad.toFixed(1)}%</span>
                        <span className="text-muted-foreground">Over & Beyond: {member.overBeyond.toFixed(1)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={member.projectLoad} className="h-3" />
                        <Progress 
                          value={member.overBeyond} 
                          className="h-1 absolute top-0 bg-yellow-200 dark:bg-yellow-900" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Overview
                </CardTitle>
                <CardDescription>Total budget allocation across projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  {formatCurrency(analytics.metrics.totalBudget)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Across {analytics.budgetData.length} funded projects
                </div>
                <div className="space-y-3">
                  {analytics.budgetData.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.budget, item.currency)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Utilization</CardTitle>
                <CardDescription>Hours vs. budget efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.budgetData.slice(0, 8).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <Badge variant={item.utilization > 100 ? "destructive" : "default"}>
                          {item.utilization.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress 
                        value={Math.min(item.utilization, 100)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Team Performance
              </CardTitle>
              <CardDescription>Project completion rates by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.teamPerformance.map((member, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{member.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {member.completed}/{member.total} completed
                        </Badge>
                        <span className="text-sm font-medium">
                          {member.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={member.completionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}