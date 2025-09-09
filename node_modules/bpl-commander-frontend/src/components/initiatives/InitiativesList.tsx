import React from 'react'
import { CentralizedInitiative, centralizedDb } from '../../utils/centralizedDb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { Lightbulb, Calendar, User, Clock } from 'lucide-react'
import { getPriorityColor, getStatusColor, formatDate } from '../../utils/projectHelpers'

interface InitiativesListProps {
  initiatives: CentralizedInitiative[]
  canCreateInitiatives: boolean
  onCreateInitiative: () => void
}

export function InitiativesList({ 
  initiatives, 
  canCreateInitiatives, 
  onCreateInitiative 
}: InitiativesListProps) {
  if (initiatives.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3>No Over & Beyond Initiatives</h3>
        <p className="text-muted-foreground mb-4">
          {canCreateInitiatives 
            ? "Create innovative projects beyond regular work" 
            : "No initiatives have been created yet"}
        </p>
        {canCreateInitiatives && (
          <Button onClick={onCreateInitiative}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Create First Initiative
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {initiatives.map((initiative) => {
        const creator = centralizedDb.getUserById(initiative.createdBy)
        const assignee = initiative.assignedTo ? centralizedDb.getUserById(initiative.assignedTo) : null
        const completionRate = initiative.actualHours && initiative.estimatedHours 
          ? (initiative.actualHours / initiative.estimatedHours) * 100 
          : 0

        return (
          <Card key={initiative.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{initiative.title}</CardTitle>
                  <CardDescription className="mt-1">{initiative.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(initiative.status)}>{initiative.status}</Badge>
                  <Badge className={getPriorityColor(initiative.priority)}>{initiative.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Created by</p>
                    <p>{creator?.name || 'Unknown'}</p>
                  </div>
                </div>
                {assignee && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Assigned to</p>
                      <p>{assignee.name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Workload</p>
                    <p>{initiative.workloadPercentage}%</p>
                  </div>
                </div>
                {initiative.dueDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p>{formatDate(initiative.dueDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress ({initiative.estimatedHours}h estimated)</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} />

              <div className="mt-3">
                <Badge variant="outline">{initiative.category}</Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}