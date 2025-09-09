import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { CurrencySelector, useCurrency } from '../CurrencySelector'
import { Badge } from '../ui/badge'
import { CalendarIcon, DollarSignIcon, ClockIcon, AlertTriangleIcon } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'

interface ProjectForm {
  title: string
  description: string
  timeline: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedHours: string
  budget: string
  currency: string
  tags: string[]
}

interface ProjectCreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  formData: ProjectForm
  setFormData: (data: ProjectForm) => void
  loading?: boolean
}

export function ProjectCreateDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  loading = false
}: ProjectCreateDialogProps) {
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { formatCurrency } = useCurrency()

  const updateField = (field: keyof ProjectForm, value: string | string[]) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Project title must be less than 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Please provide a more detailed description (minimum 20 characters)'
    }

    if (!formData.timeline.trim()) {
      newErrors.timeline = 'Timeline is required'
    }

    if (formData.estimatedHours && (parseInt(formData.estimatedHours) < 1 || parseInt(formData.estimatedHours) > 10000)) {
      newErrors.estimatedHours = 'Estimated hours must be between 1 and 10,000'
    }

    if (formData.budget && (parseFloat(formData.budget) < 0 || parseFloat(formData.budget) > 10000000)) {
      newErrors.budget = 'Budget must be between 0 and 10,000,000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(e)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      updateField('tags', [...formData.tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const estimatedBudget = formData.budget ? parseFloat(formData.budget) : 0
  const estimatedHours = formData.estimatedHours ? parseInt(formData.estimatedHours) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Set up a new project with timeline, budget, and requirements. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-title" className="flex items-center gap-1">
                  Project Title *
                </Label>
                <Input
                  id="project-title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter project title"
                  className={errors.title ? 'border-destructive' : ''}
                  maxLength={100}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-timeline" className="flex items-center gap-1">
                  Timeline *
                </Label>
                <Input
                  id="project-timeline"
                  value={formData.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  placeholder="e.g., 3 months, 6 weeks, Q1 2024"
                  className={errors.timeline ? 'border-destructive' : ''}
                />
                {errors.timeline && (
                  <p className="text-sm text-destructive">{errors.timeline}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description" className="flex items-center gap-1">
                Description *
              </Label>
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Provide a detailed project description, objectives, and key deliverables..."
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4" />
              Project Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => updateField('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <Badge className={getPriorityColor('low')} variant="secondary">
                        Low
                      </Badge>
                    </SelectItem>
                    <SelectItem value="medium">
                      <Badge className={getPriorityColor('medium')} variant="secondary">
                        Medium
                      </Badge>
                    </SelectItem>
                    <SelectItem value="high">
                      <Badge className={getPriorityColor('high')} variant="secondary">
                        High
                      </Badge>
                    </SelectItem>
                    <SelectItem value="critical">
                      <Badge className={getPriorityColor('critical')} variant="secondary">
                        Critical
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimated-hours" className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Estimated Hours
                </Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => updateField('estimatedHours', e.target.value)}
                  placeholder="e.g., 480"
                  min="1"
                  max="10000"
                  className={errors.estimatedHours ? 'border-destructive' : ''}
                />
                {errors.estimatedHours && (
                  <p className="text-sm text-destructive">{errors.estimatedHours}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-budget" className="flex items-center gap-1">
                  <DollarSignIcon className="h-4 w-4" />
                  Budget Amount
                </Label>
                <Input
                  id="project-budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                  placeholder="e.g., 50000"
                  min="0"
                  max="10000000"
                  step="1000"
                  className={errors.budget ? 'border-destructive' : ''}
                />
                {errors.budget && (
                  <p className="text-sm text-destructive">{errors.budget}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-currency">Currency</Label>
                <CurrencySelector
                  value={formData.currency}
                  onValueChange={(value) => updateField('currency', value)}
                  placeholder="Select currency"
                />
              </div>
            </div>

            {/* Budget Preview */}
            {estimatedBudget > 0 && (
              <Alert>
                <DollarSignIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Budget Preview:</strong> {formatCurrency(estimatedBudget, formData.currency)}
                  {estimatedHours > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      (≈ {formatCurrency(estimatedBudget / estimatedHours, formData.currency)} per hour)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Tags</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tag (press Enter)"
                  className="flex-1"
                  maxLength={20}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addTag}
                  disabled={!newTag.trim() || formData.tags.length >= 10}
                >
                  Add Tag
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {formData.tags.length}/10 tags. Click on tags to remove them.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}