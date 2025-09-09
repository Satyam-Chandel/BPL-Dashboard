import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.initiative.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users with different roles
  console.log('👥 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bpl.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      designation: 'System Admin',
      department: 'IT',
      skills: ['System Administration', 'Database Management', 'Security'],
      workloadCap: 100,
      overBeyondCap: 20,
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: true
      }
    }
  });

  // Program Manager
  const programManager = await prisma.user.create({
    data: {
      email: 'pm@bpl.com',
      password: hashedPassword,
      name: 'Sarah Johnson',
      role: 'PROGRAM_MANAGER',
      designation: 'Senior Program Manager',
      department: 'Program Management',
      skills: ['Program Management', 'Strategic Planning', 'Stakeholder Management'],
      workloadCap: 100,
      overBeyondCap: 15,
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: true
      }
    }
  });

  // R&D Manager
  const rdManager = await prisma.user.create({
    data: {
      email: 'rd.manager@bpl.com',
      password: hashedPassword,
      name: 'Dr. Michael Chen',
      role: 'RD_MANAGER',
      designation: 'R&D Manager',
      department: 'Research & Development',
      skills: ['Research Management', 'Innovation', 'Technical Leadership'],
      workloadCap: 100,
      overBeyondCap: 25,
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: false
      }
    }
  });

  // Team Managers
  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@bpl.com',
      password: hashedPassword,
      name: 'Emily Rodriguez',
      role: 'MANAGER',
      designation: 'Engineering Manager',
      managerId: programManager.id,
      department: 'Engineering',
      skills: ['Team Management', 'Software Development', 'Agile Methodologies'],
      workloadCap: 100,
      overBeyondCap: 20,
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: true
      }
    }
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@bpl.com',
      password: hashedPassword,
      name: 'James Wilson',
      role: 'MANAGER',
      designation: 'Product Manager',
      managerId: programManager.id,
      department: 'Product',
      skills: ['Product Management', 'Market Analysis', 'User Experience'],
      workloadCap: 100,
      overBeyondCap: 15,
      notificationSettings: {
        email: true,
        inApp: true,
        projectUpdates: true,
        deadlineReminders: true,
        weeklyReports: true
      }
    }
  });

  // Employees
  const employees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice.smith@bpl.com',
        password: hashedPassword,
        name: 'Alice Smith',
        role: 'EMPLOYEE',
        designation: 'Senior Software Engineer',
        managerId: manager1.id,
        department: 'Engineering',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        workloadCap: 100,
        overBeyondCap: 20,
        notificationSettings: {
          email: true,
          inApp: true,
          projectUpdates: true,
          deadlineReminders: true,
          weeklyReports: false
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob.jones@bpl.com',
        password: hashedPassword,
        name: 'Bob Jones',
        role: 'EMPLOYEE',
        designation: 'Full Stack Developer',
        managerId: manager1.id,
        department: 'Engineering',
        skills: ['Python', 'Django', 'React', 'AWS'],
        workloadCap: 100,
        overBeyondCap: 15,
        notificationSettings: {
          email: true,
          inApp: true,
          projectUpdates: true,
          deadlineReminders: true,
          weeklyReports: false
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'carol.davis@bpl.com',
        password: hashedPassword,
        name: 'Carol Davis',
        role: 'EMPLOYEE',
        designation: 'UX Designer',
        managerId: manager2.id,
        department: 'Product',
        skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
        workloadCap: 100,
        overBeyondCap: 10,
        notificationSettings: {
          email: true,
          inApp: true,
          projectUpdates: true,
          deadlineReminders: true,
          weeklyReports: false
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'david.brown@bpl.com',
        password: hashedPassword,
        name: 'David Brown',
        role: 'EMPLOYEE',
        designation: 'DevOps Engineer',
        managerId: manager1.id,
        department: 'Engineering',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        workloadCap: 100,
        overBeyondCap: 25,
        notificationSettings: {
          email: true,
          inApp: true,
          projectUpdates: true,
          deadlineReminders: true,
          weeklyReports: false
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'eva.garcia@bpl.com',
        password: hashedPassword,
        name: 'Eva Garcia',
        role: 'EMPLOYEE',
        designation: 'Data Analyst',
        managerId: rdManager.id,
        department: 'Research & Development',
        skills: ['Python', 'SQL', 'Data Visualization', 'Machine Learning'],
        workloadCap: 100,
        overBeyondCap: 20,
        notificationSettings: {
          email: true,
          inApp: true,
          projectUpdates: true,
          deadlineReminders: true,
          weeklyReports: true
        }
      }
    })
  ]);

  console.log(`✅ Created ${6 + employees.length} users`);

  // Create projects
  console.log('📊 Creating projects...');
  
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'BPL Commander - Project Management System',
        description: 'A comprehensive project management system for BPL with workload tracking, initiative management, and analytics.',
        managerId: manager1.id,
        status: 'ACTIVE',
        priority: 'HIGH',
        estimatedHours: 800,
        actualHours: 320,
        budgetAmount: 150000,
        budgetCurrency: 'USD',
        timeline: 'Q1 2025 - Q3 2025',
        tags: ['web-app', 'management', 'typescript', 'react']
      }
    }),
    prisma.project.create({
      data: {
        title: 'Mobile App Development',
        description: 'Cross-platform mobile application for field operations and real-time data collection.',
        managerId: manager2.id,
        status: 'ACTIVE',
        priority: 'MEDIUM',
        estimatedHours: 600,
        actualHours: 180,
        budgetAmount: 120000,
        budgetCurrency: 'USD',
        timeline: 'Q2 2025 - Q4 2025',
        tags: ['mobile', 'react-native', 'cross-platform']
      }
    }),
    prisma.project.create({
      data: {
        title: 'Data Analytics Platform',
        description: 'Advanced analytics platform for business intelligence and reporting with machine learning capabilities.',
        managerId: rdManager.id,
        status: 'PENDING',
        priority: 'HIGH',
        estimatedHours: 1000,
        budgetAmount: 200000,
        budgetCurrency: 'USD',
        timeline: 'Q3 2025 - Q1 2026',
        tags: ['analytics', 'machine-learning', 'big-data']
      }
    }),
    prisma.project.create({
      data: {
        title: 'Infrastructure Modernization',
        description: 'Modernizing legacy infrastructure with cloud-native solutions and microservices architecture.',
        managerId: manager1.id,
        status: 'ON_HOLD',
        priority: 'MEDIUM',
        estimatedHours: 400,
        actualHours: 120,
        budgetAmount: 80000,
        budgetCurrency: 'USD',
        timeline: 'Q4 2025 - Q2 2026',
        tags: ['infrastructure', 'cloud', 'microservices']
      }
    }),
    prisma.project.create({
      data: {
        title: 'Security Enhancement Initiative',
        description: 'Comprehensive security audit and enhancement of all systems with zero-trust implementation.',
        managerId: admin.id,
        status: 'COMPLETED',
        priority: 'CRITICAL',
        estimatedHours: 300,
        actualHours: 285,
        budgetAmount: 60000,
        budgetCurrency: 'USD',
        timeline: 'Q4 2024 - Q1 2025',
        tags: ['security', 'audit', 'zero-trust']
      }
    })
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  // Create project assignments
  console.log('🔗 Creating project assignments...');
  
  const assignments = await Promise.all([
    // BPL Commander Project assignments
    prisma.projectAssignment.create({
      data: {
        projectId: projects[0].id,
        employeeId: employees[0].id, // Alice Smith
        involvementPercentage: 80,
        role: 'Lead Developer'
      }
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: projects[0].id,
        employeeId: employees[1].id, // Bob Jones
        involvementPercentage: 60,
        role: 'Backend Developer'
      }
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: projects[0].id,
        employeeId: employees[2].id, // Carol Davis
        involvementPercentage: 40,
        role: 'UX Designer'
      }
    }),
    
    // Mobile App assignments
    prisma.projectAssignment.create({
      data: {
        projectId: projects[1].id,
        employeeId: employees[1].id, // Bob Jones
        involvementPercentage: 40,
        role: 'Mobile Developer'
      }
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: projects[1].id,
        employeeId: employees[2].id, // Carol Davis
        involvementPercentage: 60,
        role: 'UI/UX Designer'
      }
    }),
    
    // Data Analytics Platform
    prisma.projectAssignment.create({
      data: {
        projectId: projects[2].id,
        employeeId: employees[4].id, // Eva Garcia
        involvementPercentage: 90,
        role: 'Data Scientist'
      }
    }),
    
    // Infrastructure Modernization
    prisma.projectAssignment.create({
      data: {
        projectId: projects[3].id,
        employeeId: employees[3].id, // David Brown
        involvementPercentage: 70,
        role: 'DevOps Lead'
      }
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: projects[3].id,
        employeeId: employees[0].id, // Alice Smith
        involvementPercentage: 20,
        role: 'Technical Consultant'
      }
    })
  ]);

  console.log(`✅ Created ${assignments.length} project assignments`);

  // Create milestones
  console.log('🎯 Creating milestones...');
  
  const milestones = await Promise.all([
    // BPL Commander milestones
    prisma.milestone.create({
      data: {
        projectId: projects[0].id,
        title: 'Backend API Development',
        description: 'Complete REST API with authentication and core endpoints',
        dueDate: new Date('2025-02-15'),
        completed: true,
        completedAt: new Date('2025-02-10')
      }
    }),
    prisma.milestone.create({
      data: {
        projectId: projects[0].id,
        title: 'Frontend Dashboard',
        description: 'User dashboard with project management features',
        dueDate: new Date('2025-03-30'),
        completed: false
      }
    }),
    prisma.milestone.create({
      data: {
        projectId: projects[0].id,
        title: 'Testing & Deployment',
        description: 'Comprehensive testing and production deployment',
        dueDate: new Date('2025-04-30'),
        completed: false
      }
    }),
    
    // Mobile App milestones
    prisma.milestone.create({
      data: {
        projectId: projects[1].id,
        title: 'UI/UX Design',
        description: 'Complete mobile app design and user flow',
        dueDate: new Date('2025-03-15'),
        completed: false
      }
    }),
    prisma.milestone.create({
      data: {
        projectId: projects[1].id,
        title: 'Core Features Development',
        description: 'Implement core mobile app functionality',
        dueDate: new Date('2025-05-30'),
        completed: false
      }
    })
  ]);

  console.log(`✅ Created ${milestones.length} milestones`);

  // Create initiatives (Over & Beyond work)
  console.log('💡 Creating initiatives...');
  
  const initiatives = await Promise.all([
    prisma.initiative.create({
      data: {
        title: 'Code Quality Improvement',
        description: 'Implement automated code quality checks and improve existing codebase documentation',
        category: 'Process Improvement',
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedHours: 20,
        actualHours: 12,
        workloadPercentage: 15,
        assignedTo: employees[0].id, // Alice Smith
        createdBy: manager1.id,
        dueDate: new Date('2025-03-15')
      }
    }),
    prisma.initiative.create({
      data: {
        title: 'Team Knowledge Sharing Sessions',
        description: 'Organize weekly tech talks and knowledge sharing sessions for the team',
        category: 'Team Development',
        priority: 'LOW',
        status: 'ACTIVE',
        estimatedHours: 10,
        actualHours: 6,
        workloadPercentage: 10,
        assignedTo: employees[1].id, // Bob Jones
        createdBy: manager1.id,
        dueDate: new Date('2025-04-30')
      }
    }),
    prisma.initiative.create({
      data: {
        title: 'Design System Documentation',
        description: 'Create comprehensive design system documentation and component library',
        category: 'Documentation',
        priority: 'HIGH',
        status: 'COMPLETED',
        estimatedHours: 25,
        actualHours: 28,
        workloadPercentage: 20,
        assignedTo: employees[2].id, // Carol Davis
        createdBy: manager2.id,
        completedAt: new Date('2025-01-20')
      }
    })
  ]);

  console.log(`✅ Created ${initiatives.length} initiatives`);

  // Create comments
  console.log('💬 Creating comments...');
  
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great progress on the API development! The authentication system is working perfectly.',
        userId: manager1.id,
        projectId: projects[0].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'I\'ve completed the user management endpoints. Moving on to project management next.',
        userId: employees[0].id,
        projectId: projects[0].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'The database schema looks comprehensive. Should we add any additional indexes for performance?',
        userId: employees[1].id,
        projectId: projects[0].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Design mockups are ready for review. I\'ve incorporated the latest feedback from stakeholders.',
        userId: employees[2].id,
        projectId: projects[1].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'This initiative has been very valuable for our code quality. Recommending to extend it.',
        userId: employees[0].id,
        initiativeId: initiatives[0].id
      }
    })
  ]);

  console.log(`✅ Created ${comments.length} comments`);

  // Create notifications
  console.log('🔔 Creating notifications...');
  
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: employees[0].id,
        type: 'DEADLINE',
        title: 'Milestone Due Soon',
        message: 'Frontend Dashboard milestone is due in 3 days',
        entityType: 'MILESTONE',
        entityId: milestones[1].id,
        priority: 'HIGH',
        actionUrl: `/projects/${projects[0].id}/milestones`
      }
    }),
    prisma.notification.create({
      data: {
        userId: employees[2].id,
        type: 'ASSIGNMENT',
        title: 'New Project Assignment',
        message: 'You have been assigned to Mobile App Development project',
        entityType: 'PROJECT',
        entityId: projects[1].id,
        priority: 'MEDIUM',
        actionUrl: `/projects/${projects[1].id}`
      }
    }),
    prisma.notification.create({
      data: {
        userId: manager1.id,
        type: 'WORKLOAD',
        title: 'Employee Workload Alert',
        message: 'Alice Smith is at 100% workload capacity',
        entityType: 'USER',
        entityId: employees[0].id,
        priority: 'HIGH',
        actionUrl: `/users/${employees[0].id}/workload`
      }
    }),
    prisma.notification.create({
      data: {
        userId: employees[1].id,
        type: 'COMMENT',
        title: 'New Comment on Project',
        message: 'Emily Rodriguez commented on BPL Commander project',
        entityType: 'PROJECT',
        entityId: projects[0].id,
        priority: 'LOW',
        read: true,
        actionUrl: `/projects/${projects[0].id}/comments`
      }
    })
  ]);

  console.log(`✅ Created ${notifications.length} notifications`);

  // Create activity logs
  console.log('📋 Creating activity logs...');
  
  const activityLogs = await Promise.all([
    prisma.activityLog.create({
      data: {
        userId: manager1.id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: projects[0].id,
        projectId: projects[0].id,
        details: 'Created BPL Commander project with initial team assignments'
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: employees[0].id,
        action: 'MILESTONE_COMPLETED',
        entityType: 'MILESTONE',
        entityId: milestones[0].id,
        projectId: projects[0].id,
        details: 'Completed Backend API Development milestone ahead of schedule'
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: employees[2].id,
        action: 'INITIATIVE_COMPLETED',
        entityType: 'INITIATIVE',
        entityId: initiatives[2].id,
        initiativeId: initiatives[2].id,
        details: 'Completed Design System Documentation initiative'
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: manager2.id,
        action: 'USER_ASSIGNED',
        entityType: 'PROJECT',
        entityId: projects[1].id,
        projectId: projects[1].id,
        details: 'Assigned Carol Davis as UI/UX Designer to Mobile App Development'
      }
    })
  ]);

  console.log(`✅ Created ${activityLogs.length} activity logs`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`👥 Users: ${6 + employees.length}`);
  console.log(`📊 Projects: ${projects.length}`);
  console.log(`🔗 Assignments: ${assignments.length}`);
  console.log(`🎯 Milestones: ${milestones.length}`);
  console.log(`💡 Initiatives: ${initiatives.length}`);
  console.log(`💬 Comments: ${comments.length}`);
  console.log(`🔔 Notifications: ${notifications.length}`);
  console.log(`📋 Activity Logs: ${activityLogs.length}`);
  
  console.log('\n🔐 Test Login Credentials:');
  console.log('Admin: admin@bpl.com / password123');
  console.log('Program Manager: pm@bpl.com / password123');
  console.log('R&D Manager: rd.manager@bpl.com / password123');
  console.log('Manager: manager1@bpl.com / password123');
  console.log('Employee: alice.smith@bpl.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });









