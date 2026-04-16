import { Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import {
  parsePaginationParams,
  createPaginatedResponse,
  PaginatedResponse,
} from '../utils/pagination';
import { emitNotification } from '../utils/socket';

// @desc    Get all projects with pagination
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by status if provided
  if (req.query.status) {
    where.status = req.query.status;
  }

  // Filter by client if provided
  if (req.query.clientId) {
    where.clientId = req.query.clientId;
  }

  // Filter by manager if provided
  if (req.query.managerId) {
    where.managerId = req.query.managerId;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            stages: true,
            tasks: true,
            payments: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    projects,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
        },
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      stages: {
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: {
              tasks: true,
              materials: true,
            },
          },
        },
      },
      tasks: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      payments: {
        orderBy: { dueDate: 'asc' },
      },
      materials: {
        include: {
          item: true,
        },
      },
      photos: {
        orderBy: { createdAt: 'desc' },
      },
      contractorAssignments: {
        include: {
          contractor: {
            select: {
              id: true,
              name: true,
              specialty: true,
              phone: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.status(200).json({ project });
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req: AuthRequest, res: Response) => {
  const {
    name,
    description,
    clientId,
    managerId,
    status,
    budget,
    startDate,
    endDate,
    location,
    area,
    contractValue,
    profitMargin,
    notes,
  } = req.body;

  // Verify client exists
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      clientId,
      managerId,
      status,
      budget,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      area,
      contractValue,
      profitMargin,
      notes,
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'project_created', {
    message: 'New project created',
    project,
  });

  res.status(201).json({
    message: 'Project created successfully',
    project,
  });
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      actualEndDate: req.body.actualEndDate ? new Date(req.body.actualEndDate) : undefined,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'project_updated', {
    message: 'Project updated',
    project: updatedProject,
  });

  res.status(200).json({
    message: 'Project updated successfully',
    project: updatedProject,
  });
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Manager only)
export const deleteProject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await prisma.project.delete({ where: { id } });

  res.status(200).json({
    message: 'Project deleted successfully',
  });
};

// @desc    Create project stage
// @route   POST /api/projects/:id/stages
// @access  Private
export const createProjectStage = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, order, status, budget, startDate, endDate, progress } = req.body;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const stage = await prisma.projectStage.create({
    data: {
      projectId: id,
      name,
      description,
      order,
      status,
      budget,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      progress,
    },
  });

  // Update project progress automatically
  await updateProjectProgress(id);

  res.status(201).json({
    message: 'Project stage created successfully',
    stage,
  });
};

// @desc    Update project stage
// @route   PUT /api/projects/:projectId/stages/:stageId
// @access  Private
export const updateProjectStage = async (req: AuthRequest, res: Response) => {
  const { projectId, stageId } = req.params;

  const stage = await prisma.projectStage.findFirst({
    where: { id: stageId, projectId },
  });

  if (!stage) {
    throw new AppError('Project stage not found', 404);
  }

  const updatedStage = await prisma.projectStage.update({
    where: { id: stageId },
    data: {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    },
  });

  // Update project progress automatically
  await updateProjectProgress(projectId);

  res.status(200).json({
    message: 'Project stage updated successfully',
    stage: updatedStage,
  });
};

// @desc    Delete project stage
// @route   DELETE /api/projects/:projectId/stages/:stageId
// @access  Private
export const deleteProjectStage = async (req: AuthRequest, res: Response) => {
  const { projectId, stageId } = req.params;

  const stage = await prisma.projectStage.findFirst({
    where: { id: stageId, projectId },
  });

  if (!stage) {
    throw new AppError('Project stage not found', 404);
  }

  await prisma.projectStage.delete({ where: { id: stageId } });

  // Update project progress automatically
  await updateProjectProgress(projectId);

  res.status(200).json({
    message: 'Project stage deleted successfully',
  });
};

// @desc    Create task for project
// @route   POST /api/projects/:id/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, stageId, assigneeId, priority, dueDate } = req.body;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const task = await prisma.task.create({
    data: {
      projectId: id,
      stageId,
      title,
      description,
      assigneeId,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      creatorId: req.user!.id,
    },
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Notify assignee
  if (assigneeId) {
    const io = req.app.get('io');
    emitNotification(io, assigneeId, 'task_assigned', {
      message: 'You have been assigned a new task',
      task,
    });
  }

  res.status(201).json({
    message: 'Task created successfully',
    task,
  });
};

// @desc    Update task
// @route   PUT /api/projects/:projectId/tasks/:taskId
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response) => {
  const { projectId, taskId } = req.params;

  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      completedAt: req.body.status === 'COMPLETED' ? new Date() : undefined,
    },
  });

  res.status(200).json({
    message: 'Task updated successfully',
    task: updatedTask,
  });
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = async (req: AuthRequest, res: Response) => {
  const [total, byStatus, inProgress, completed, totalBudget] = await Promise.all([
    prisma.project.count(),
    prisma.project.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.project.count({
      where: { status: 'IN_PROGRESS' },
    }),
    prisma.project.count({
      where: { status: 'COMPLETED' },
    }),
    prisma.project.aggregate({
      _sum: { budget: true },
    }),
  ]);

  res.status(200).json({
    stats: {
      total,
      byStatus,
      inProgress,
      completed,
      totalBudget: totalBudget._sum.budget || 0,
    },
  });
};

// Helper function to update project progress based on stages
async function updateProjectProgress(projectId: string) {
  const stages = await prisma.projectStage.findMany({
    where: { projectId },
    select: { progress: true },
  });

  if (stages.length > 0) {
    const avgProgress = Math.round(
      stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length
    );

    await prisma.project.update({
      where: { id: projectId },
      data: { progress: avgProgress },
    });
  }
}


