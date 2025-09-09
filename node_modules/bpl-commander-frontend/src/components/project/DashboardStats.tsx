import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Target, CheckCircle, Lightbulb, Users } from 'lucide-react'

interface DashboardStatsProps {
  totalProjects: number
  activeProjects: number
  totalInitiatives: number
  uniqueTeamMembers: number
}

export function DashboardStats({
  totalProjects,
  activeProjects,
  totalInitiatives,
  uniqueTeamMembers
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Over & Beyond',
      value: totalInitiatives,
      icon: Lightbulb,
      color: 'text-purple-600'
    },
    {
      label: 'Team Members',
      value: uniqueTeamMembers,
      icon: Users,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-medium">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}