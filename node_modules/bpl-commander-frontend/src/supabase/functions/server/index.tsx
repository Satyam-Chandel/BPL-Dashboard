import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Initialize system with default users
app.post('/make-server-de95975d/init', async (c) => {
  try {
    // Check if any users exist
    const existingUsers = await kv.getByPrefix('user:')
    if (existingUsers.length > 0) {
      return c.json({ message: 'System already initialized' })
    }

    // Create default admin user
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@bplcommander.com',
      password: 'admin123',
      user_metadata: { name: 'System Admin', role: 'admin', designation: 'System Administrator' },
      email_confirm: true
    })
    
    if (adminError) {
      console.log('Error creating admin user:', adminError)
      return c.json({ error: adminError.message }, 400)
    }

    const adminData = {
      id: adminUser.user.id,
      email: 'admin@bplcommander.com',
      name: 'System Admin',
      role: 'admin',
      designation: 'System Administrator',
      managerId: null,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    await kv.set(`user:${adminUser.user.id}`, adminData)

    // Create default manager user
    const { data: managerUser, error: managerError } = await supabase.auth.admin.createUser({
      email: 'manager@bplcommander.com',
      password: 'manager123',
      user_metadata: { name: 'Project Manager', role: 'manager', designation: 'Senior Project Manager' },
      email_confirm: true
    })
    
    if (!managerError) {
      const managerData = {
        id: managerUser.user.id,
        email: 'manager@bplcommander.com',
        name: 'Project Manager',
        role: 'manager',
        designation: 'Senior Project Manager',
        managerId: null,
        createdAt: new Date().toISOString(),
        isActive: true
      }
      await kv.set(`user:${managerUser.user.id}`, managerData)
    }

    // Create default employee user
    const { data: employeeUser, error: employeeError } = await supabase.auth.admin.createUser({
      email: 'employee@bplcommander.com',
      password: 'employee123',
      user_metadata: { name: 'Test Employee', role: 'employee', designation: 'Software Developer' },
      email_confirm: true
    })
    
    if (!employeeError) {
      const employeeData = {
        id: employeeUser.user.id,
        email: 'employee@bplcommander.com',
        name: 'Test Employee',
        role: 'employee',
        designation: 'Software Developer',
        managerId: managerUser?.user.id || null,
        createdAt: new Date().toISOString(),
        isActive: true
      }
      await kv.set(`user:${employeeUser.user.id}`, employeeData)
    }

    return c.json({ 
      message: 'System initialized successfully',
      users: [
        { email: 'admin@bplcommander.com', password: 'admin123', role: 'admin' },
        { email: 'manager@bplcommander.com', password: 'manager123', role: 'manager' },
        { email: 'employee@bplcommander.com', password: 'employee123', role: 'employee' }
      ]
    })
  } catch (error) {
    console.log('Error initializing system:', error)
    return c.json({ error: 'Failed to initialize system' }, 500)
  }
})

// User signup endpoint
app.post('/make-server-de95975d/signup', async (c) => {
  try {
    const { email, password, name, role, designation, managerId } = await c.req.json()
    
    // Check if this is the first user (allow without auth)
    const existingUsers = await kv.getByPrefix('user:')
    const isFirstUser = existingUsers.length === 0
    
    if (!isFirstUser) {
      // Require authentication for subsequent users
      const accessToken = c.req.header('Authorization')?.split(' ')[1]
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      
      if (!user?.id) {
        return c.json({ error: 'Unauthorized' }, 401)
      }
      
      const currentUser = await kv.get(`user:${user.id}`)
      if (!currentUser || currentUser.role !== 'admin') {
        return c.json({ error: 'Insufficient permissions' }, 403)
      }
    }
    
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role, designation },
      email_confirm: true // Auto-confirm since email server not configured
    })
    
    if (authError) {
      console.log('Auth error during user creation:', authError)
      return c.json({ error: authError.message }, 400)
    }
    
    // Store additional user data in KV store
    const userData = {
      id: authUser.user.id,
      email,
      name,
      role,
      designation,
      managerId: managerId || null,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    
    await kv.set(`user:${authUser.user.id}`, userData)
    
    return c.json({ user: userData })
  } catch (error) {
    console.log('Error creating user:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// Get user profile
app.get('/make-server-de95975d/user/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const userData = await kv.get(`user:${userId}`)
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user: userData })
  } catch (error) {
    console.log('Error fetching user:', error)
    return c.json({ error: 'Failed to fetch user' }, 500)
  }
})

// Get all users (Admin only)
app.get('/make-server-de95975d/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const currentUser = await kv.get(`user:${user.id}`)
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    const users = await kv.getByPrefix('user:')
    return c.json({ users })
  } catch (error) {
    console.log('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Create project
app.post('/make-server-de95975d/projects', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const currentUser = await kv.get(`user:${user.id}`)
    if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    const { title, description, assigneeId, timeline, involvementPercentage } = await c.req.json()
    
    // Check if assignee already has 3 projects
    const assigneeProjects = await kv.getByPrefix(`project:assignee:${assigneeId}:`)
    if (assigneeProjects.length >= 3) {
      return c.json({ error: 'Employee already has maximum 3 projects assigned' }, 400)
    }
    
    // Check total involvement percentage
    const currentInvolvement = assigneeProjects.reduce((total, project) => 
      total + (project.involvementPercentage || 0), 0
    )
    
    if (currentInvolvement + involvementPercentage > 120) {
      return c.json({ error: 'Total involvement would exceed 120%' }, 400)
    }
    
    const projectId = crypto.randomUUID()
    const project = {
      id: projectId,
      title,
      description,
      assigneeId,
      managerId: user.id,
      timeline,
      involvementPercentage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
    
    await kv.set(`project:${projectId}`, project)
    await kv.set(`project:assignee:${assigneeId}:${projectId}`, project)
    
    // Create version snapshot
    await kv.set(`project:${projectId}:version:1`, {
      ...project,
      changedBy: user.id,
      changeType: 'created'
    })
    
    return c.json({ project })
  } catch (error) {
    console.log('Error creating project:', error)
    return c.json({ error: 'Failed to create project' }, 500)
  }
})

// Get projects for user
app.get('/make-server-de95975d/projects/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const projects = await kv.getByPrefix(`project:assignee:${userId}:`)
    return c.json({ projects })
  } catch (error) {
    console.log('Error fetching user projects:', error)
    return c.json({ error: 'Failed to fetch projects' }, 500)
  }
})

// Update project
app.put('/make-server-de95975d/projects/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const projectId = c.req.param('id')
    const existingProject = await kv.get(`project:${projectId}`)
    
    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404)
    }
    
    const currentUser = await kv.get(`user:${user.id}`)
    if (!currentUser || (!['admin', 'manager'].includes(currentUser.role) && existingProject.managerId !== user.id)) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    const updates = await c.req.json()
    const updatedProject = {
      ...existingProject,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: existingProject.version + 1
    }
    
    await kv.set(`project:${projectId}`, updatedProject)
    await kv.set(`project:assignee:${existingProject.assigneeId}:${projectId}`, updatedProject)
    
    // Create version snapshot
    await kv.set(`project:${projectId}:version:${updatedProject.version}`, {
      ...updatedProject,
      changedBy: user.id,
      changeType: 'updated',
      changes: updates
    })
    
    return c.json({ project: updatedProject })
  } catch (error) {
    console.log('Error updating project:', error)
    return c.json({ error: 'Failed to update project' }, 500)
  }
})

// Create initiative
app.post('/make-server-de95975d/initiatives', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { title, description, category } = await c.req.json()
    
    const initiativeId = crypto.randomUUID()
    const initiative = {
      id: initiativeId,
      title,
      description,
      category,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    
    await kv.set(`initiative:${initiativeId}`, initiative)
    
    return c.json({ initiative })
  } catch (error) {
    console.log('Error creating initiative:', error)
    return c.json({ error: 'Failed to create initiative' }, 500)
  }
})

// Get all initiatives
app.get('/make-server-de95975d/initiatives', async (c) => {
  try {
    const initiatives = await kv.getByPrefix('initiative:')
    return c.json({ initiatives })
  } catch (error) {
    console.log('Error fetching initiatives:', error)
    return c.json({ error: 'Failed to fetch initiatives' }, 500)
  }
})

// Add project comment
app.post('/make-server-de95975d/projects/:id/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const projectId = c.req.param('id')
    const { comment } = await c.req.json()
    
    const commentId = crypto.randomUUID()
    const commentData = {
      id: commentId,
      projectId,
      userId: user.id,
      comment,
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`comment:${projectId}:${commentId}`, commentData)
    
    return c.json({ comment: commentData })
  } catch (error) {
    console.log('Error adding comment:', error)
    return c.json({ error: 'Failed to add comment' }, 500)
  }
})

// Get project comments
app.get('/make-server-de95975d/projects/:id/comments', async (c) => {
  try {
    const projectId = c.req.param('id')
    const comments = await kv.getByPrefix(`comment:${projectId}:`)
    return c.json({ comments })
  } catch (error) {
    console.log('Error fetching comments:', error)
    return c.json({ error: 'Failed to fetch comments' }, 500)
  }
})

// Get Supabase configuration for frontend
app.get('/make-server-de95975d/config', async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !anonKey) {
      return c.json({ error: 'Supabase configuration not available' }, 500)
    }
    
    // Extract project ID from URL
    const urlObj = new URL(supabaseUrl)
    const projectId = urlObj.hostname.split('.')[0]
    
    return c.json({
      projectId,
      publicAnonKey: anonKey,
      supabaseUrl
    })
  } catch (error) {
    console.log('Error getting Supabase config:', error)
    return c.json({ error: 'Failed to get configuration' }, 500)
  }
})

serve(app.fetch)