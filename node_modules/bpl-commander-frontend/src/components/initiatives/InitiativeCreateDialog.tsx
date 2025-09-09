import React from 'react'
import { centralizedDb } from '../../utils/centralizedDb'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertTriangle } from 'lucide-react'
import { INITIATIVE_CATEGORIES } from '../../utils/projectHelpers'

interface InitiativeForm {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours: number
  workloadPercentage: number
  assignedTo: string
  dueDate: string
}

interface InitiativeCreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  formData: InitiativeForm
  setFormData: (data: InitiativeForm) => void
  loading?: boolean
}

export function InitiativeCreateDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  loading = false
}: InitiativeCreateDialogProps) {
  const users = centralizedDb.getUsers()
  const employees = users.filter(u => u.role === 'employee' || u.role === 'manager')

  const updateField = (field: keyof InitiativeForm, value: string | number) => {
    setFormData({ ...formData, [field]: value })
  }

  const selectedEmployeeWorkload = formData.assignedTo 
    ? centralizedDb.getEmployeeWorkload(formData.assignedTo)
    : null

  const wouldExceedLimit = selectedEmployeeWorkload 
    ? (selectedEmployeeWorkload.overBeyondWorkload + formData.workloadPercentage) > 20
    : false

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Over & Beyond Initiative</DialogTitle>
          <DialogDescription>
            Create an innovative project or improvement initiative (20% workload cap enforced)
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initiative-title">Title</Label>
              <Input
                id="initiative-title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Initiative title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiative-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {INITIATIVE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initiative-description">Description</Label>
            <Textarea
              id="initiative-description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Detailed description of the initiative..."
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initiative-assignee">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => updateField('assignedTo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => {
                    const workload = centralizedDb.getEmployeeWorkload(employee.id)
                    return (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex flex-col">
                          <span>{employee.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Over & Beyond: {workload.overBeyondWorkload.toFixed(1)}% / 20%
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiative-due-date">Due Date</Label>
              <Input
                id="initiative-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initiative-priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => updateField('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-hours">Estimated Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => updateField('estimatedHours', parseInt(e.target.value) || 0)}
                min="1"
                max="200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workload-percentage">Workload % ({formData.workloadPercentage}%)</Label>
              <input
                id="workload-percentage"
                type="range"
                min="1"
                max="20"
                step="1"
                value={formData.workloadPercentage}
                onChange={(e) => updateField('workloadPercentage', parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          {selectedEmployeeWorkload && (
            <Alert className={wouldExceedLimit ? 'border-destructive' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {formData.assignedTo && (
                  <>
                    Current Over & Beyond: {selectedEmployeeWorkload.overBeyondWorkload.toFixed(1)}%<br />
                    After assignment: {(selectedEmployeeWorkload.overBeyondWorkload + formData.workloadPercentage).toFixed(1)}%<br />
                    {wouldExceedLimit && (
                      <span className="text-destructive font-medium">
                        ⚠️ This would exceed the 20% Over & Beyond limit!
                      </span>
                    )}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || wouldExceedLimit}>
              {loading ? 'Creating...' : 'Create Initiative'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}