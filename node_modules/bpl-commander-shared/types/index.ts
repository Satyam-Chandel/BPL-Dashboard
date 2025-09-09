// Core entity types shared between frontend and backend
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'program_manager' | 'rd_manager' | 'manager' | 'employee';
  designation: string;
  managerId?: string;
  department?: string;
  skills: string[];
  workloadCap: number;
  overBeyondCap: number;
  avatar?: string;
  phoneNumber?: string;
  timezone?: string;
  preferredCurrency?: string;
  notificationSettings: NotificationSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  managerId: string;
  status: 'pending' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  actualHours?: number;
  budgetAmount?: number;
  budgetCurrency?: string;
  timeline?: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  
  // Relations (populated when included)
  manager?: User;
  assignments?: ProjectAssignment[];
  milestones?: Milestone[];
  comments?: Comment[];
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  employeeId: string;
  involvementPercentage: number;
  role?: string;
  assignedAt: string;
  updatedAt: string;
  
  // Relations
  project?: Project;
  employee?: User;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  estimatedHours: number;
  actualHours?: number;
  workloadPercentage: number;
  assignedTo?: string;
  createdBy: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  assignee?: User;
  creator?: User;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  projectId?: string;
  initiativeId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: User;
  project?: Project;
  initiative?: Initiative;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'deadline' | 'workload' | 'assignment' | 'milestone' | 'budget' | 'comment' | 'status' | 'system';
  title: string;
  message: string;
  entityType?: 'user' | 'project' | 'initiative' | 'milestone' | 'comment';
  entityId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'user' | 'project' | 'initiative' | 'milestone' | 'comment';
  entityId: string;
  projectId?: string;
  initiativeId?: string;
  details?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  
  // Relations
  user?: User;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  projectUpdates: boolean;
  deadlineReminders: boolean;
  weeklyReports: boolean;
}

export interface WorkloadData {
  projectWorkload: number;
  overBeyondWorkload: number;
  totalWorkload: number;
  availableCapacity: number;
  overBeyondAvailable: number;
}

// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  status?: string;
  priority?: string;
  role?: string;
  department?: string;
  search?: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: User['role'];
  designation: string;
  managerId?: string;
  department?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: User['role'];
  designation: string;
  managerId?: string;
  department?: string;
  skills?: string[];
  workloadCap?: number;
  overBeyondCap?: number;
  notificationSettings?: NotificationSettings;
}

export interface UpdateUserRequest {
  name?: string;
  designation?: string;
  managerId?: string;
  department?: string;
  skills?: string[];
  workloadCap?: number;
  overBeyondCap?: number;
  avatar?: string;
  phoneNumber?: string;
  timezone?: string;
  preferredCurrency?: string;
  notificationSettings?: NotificationSettings;
}

// Project management types
export interface CreateProjectRequest {
  title: string;
  description?: string;
  timeline?: string;
  priority?: Project['priority'];
  estimatedHours?: number;
  budgetAmount?: number;
  budgetCurrency?: string;
  tags?: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
  status?: Project['status'];
}

export interface AssignEmployeeRequest {
  projectId: string;
  employeeId: string;
  involvementPercentage: number;
  role?: string;
}

// Initiative types
export interface CreateInitiativeRequest {
  title: string;
  description?: string;
  category?: string;
  priority?: Initiative['priority'];
  estimatedHours?: number;
  workloadPercentage: number;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateInitiativeRequest extends Partial<CreateInitiativeRequest> {
  id: string;
  status?: Initiative['status'];
}

// Analytics types
export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalUsers: number;
  activeUsers: number;
  overloadedUsers: number;
  totalInitiatives: number;
  completedInitiatives: number;
  averageProjectProgress: number;
  totalWorkloadUtilization: number;
}

export interface ProjectAnalytics {
  projectsByStatus: Record<string, number>;
  projectsByPriority: Record<string, number>;
  projectsOverTime: Array<{ date: string; count: number }>;
  averageCompletionTime: number;
  budgetUtilization: number;
}

export interface WorkloadAnalytics {
  departmentWorkload: Record<string, number>;
  roleWorkload: Record<string, number>;
  overloadedEmployees: Array<{ userId: string; workload: number }>;
  capacityTrends: Array<{ date: string; capacity: number; utilization: number }>;
}

// Export types
export interface ExportRequest {
  type: 'projects' | 'users' | 'workload' | 'analytics';
  format: 'excel' | 'pdf' | 'csv' | 'json';
  filters?: FilterParams;
  dateRange?: {
    start: string;
    end: string;
  };
  includeRelations?: string[];
}

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  userId?: string;
  entityType?: 'user' | 'project' | 'initiative';
  entityId?: string;
  createdAt: string;
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'custom';
  language: string;
  timezone: string;
  currency: string;
  notificationSettings: NotificationSettings;
}

export interface SystemSettings {
  defaultCurrency: string;
  maxWorkloadPercentage: number;
  maxOverBeyondPercentage: number;
  defaultProjectStatus: Project['status'];
  allowSelfAssignment: boolean;
  requireApprovalForProjects: boolean;
}

// Action types for unified endpoints
export type ActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'assign' 
  | 'unassign' 
  | 'complete' 
  | 'activate' 
  | 'deactivate'
  | 'milestone'
  | 'comment'
  | 'markRead'
  | 'updateSettings';

export interface ActionRequest<T = any> {
  action: ActionType;
  id?: string;
  data?: T;
}

// Query parameter types for smart endpoints
export interface QueryParams extends PaginationParams, FilterParams {
  id?: string;
  include?: string; // comma-separated relations to include
  analytics?: boolean;
  workload?: boolean;
  count?: boolean;
  manager?: string;
  assignee?: string;
  creator?: string;
  unread?: boolean;
  type?: string;
}
