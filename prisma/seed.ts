import { PrismaClient, Priority, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@dits.dev' },
    update: {},
    create: {
      email: 'demo@dits.dev',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5XYq9eS8J7Hfq', // password: demo1234
      name: 'Demo User',
      preferences: {
        theme: 'dark',
        defaultView: 'list',
      },
    },
  });

  console.log('Created demo user:', user.email);

  // Create default workflow
  const workflow = await prisma.workflow.create({
    data: {
      userId: user.id,
      name: 'Default Workflow',
      transitions: [
        { from: 'Backlog', to: ['To Do', 'In Progress'] },
        { from: 'To Do', to: ['In Progress', 'Backlog'] },
        { from: 'In Progress', to: ['In Review', 'To Do'] },
        { from: 'In Review', to: ['Done', 'In Progress'] },
        { from: 'Done', to: [] },
      ],
    },
  });

  console.log('Created default workflow');

  // Create statuses for the workflow
  const statuses = await prisma.$transaction([
    prisma.status.create({
      data: {
        workflowId: workflow.id,
        name: 'Backlog',
        color: '#94a3b8',
        position: 0,
        isClosed: false,
      },
    }),
    prisma.status.create({
      data: {
        workflowId: workflow.id,
        name: 'To Do',
        color: '#3b82f6',
        position: 1,
        isClosed: false,
      },
    }),
    prisma.status.create({
      data: {
        workflowId: workflow.id,
        name: 'In Progress',
        color: '#f59e0b',
        position: 2,
        isClosed: false,
      },
    }),
    prisma.status.create({
      data: {
        workflowId: workflow.id,
        name: 'In Review',
        color: '#8b5cf6',
        position: 3,
        isClosed: false,
      },
    }),
    prisma.status.create({
      data: {
        workflowId: workflow.id,
        name: 'Done',
        color: '#10b981',
        position: 4,
        isClosed: true,
      },
    }),
  ]);

  console.log('Created workflow statuses');

  // Create a sample project
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'DITS Development',
      description: 'Developer Issue Tracking System - Core development project',
      status: ProjectStatus.ACTIVE,
      startDate: new Date(),
      settings: {
        defaultWorkflowId: workflow.id,
      },
    },
  });

  console.log('Created sample project');

  // Create sample areas
  const areas = await prisma.$transaction([
    prisma.area.create({
      data: {
        userId: user.id,
        name: 'Work',
        description: 'Professional work-related tasks',
        color: '#3b82f6',
      },
    }),
    prisma.area.create({
      data: {
        userId: user.id,
        name: 'Personal',
        description: 'Personal projects and tasks',
        color: '#10b981',
      },
    }),
    prisma.area.create({
      data: {
        userId: user.id,
        name: 'Learning',
        description: 'Learning and skill development',
        color: '#f59e0b',
      },
    }),
  ]);

  console.log('Created sample areas');

  // Create sample labels
  const labels = await prisma.$transaction([
    prisma.label.create({
      data: {
        userId: user.id,
        name: 'bug',
        color: '#ef4444',
      },
    }),
    prisma.label.create({
      data: {
        userId: user.id,
        name: 'feature',
        color: '#3b82f6',
      },
    }),
    prisma.label.create({
      data: {
        userId: user.id,
        name: 'documentation',
        color: '#8b5cf6',
      },
    }),
    prisma.label.create({
      data: {
        userId: user.id,
        name: 'enhancement',
        color: '#10b981',
      },
    }),
  ]);

  console.log('Created sample labels');

  // Create sample issues
  const todoStatus = statuses.find((s) => s.name === 'To Do')!;
  const inProgressStatus = statuses.find((s) => s.name === 'In Progress')!;
  const doneStatus = statuses.find((s) => s.name === 'Done')!;

  const issues = await prisma.$transaction([
    // Issue 1: With project
    prisma.issue.create({
      data: {
        userId: user.id,
        projectId: project.id,
        statusId: inProgressStatus.id,
        title: 'Implement user authentication',
        description:
          '# Authentication Implementation\n\nImplement JWT-based authentication with refresh tokens.\n\n## Requirements\n- [ ] JWT token generation\n- [ ] Refresh token rotation\n- [ ] Password hashing with bcrypt\n- [ ] Login endpoint\n- [ ] Register endpoint',
        priority: Priority.HIGH,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    }),
    // Issue 2: With area
    prisma.issue.create({
      data: {
        userId: user.id,
        areaId: areas[2].id, // Learning area
        statusId: todoStatus.id,
        title: 'Learn advanced TypeScript patterns',
        description:
          'Study advanced TypeScript patterns including:\n- Conditional types\n- Template literal types\n- Mapped types\n- Utility types',
        priority: Priority.MEDIUM,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    }),
    // Issue 3: Completed
    prisma.issue.create({
      data: {
        userId: user.id,
        projectId: project.id,
        statusId: doneStatus.id,
        title: 'Set up database schema',
        description: 'Create Prisma schema with all required models',
        priority: Priority.HIGH,
        completedAt: new Date(),
      },
    }),
    // Issue 4: With labels
    prisma.issue.create({
      data: {
        userId: user.id,
        projectId: project.id,
        statusId: todoStatus.id,
        title: 'Fix Docker connection issues',
        description: 'Database connection fails when using Docker Compose',
        priority: Priority.URGENT,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
    }),
  ]);

  console.log('Created sample issues');

  // Link labels to issues
  await prisma.issueLabel.createMany({
    data: [
      { issueId: issues[0].id, labelId: labels[1].id }, // feature
      { issueId: issues[3].id, labelId: labels[0].id }, // bug
    ],
  });

  console.log('Linked labels to issues');

  // Create issue relation (dependency)
  await prisma.issueRelation.create({
    data: {
      sourceId: issues[0].id,
      targetId: issues[2].id,
      relationType: 'BLOCKED_BY',
    },
  });

  console.log('Created issue relation');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDemo credentials:');
  console.log('Email: demo@dits.dev');
  console.log('Password: demo1234');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
