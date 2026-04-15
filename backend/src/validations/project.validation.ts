import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Project name is required'),
    description: z.string().optional(),
    clientId: z.string().uuid('Valid client ID is required'),
    managerId: z.string().uuid().optional(),
    status: z
      .enum(['PENDING', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
      .optional(),
    budget: z.number().positive('Budget must be positive'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    location: z.string().optional(),
    area: z.number().positive().optional(),
    contractValue: z.number().positive().optional(),
    profitMargin: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    clientId: z.string().uuid().optional(),
    managerId: z.string().uuid().optional(),
    status: z
      .enum(['PENDING', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
      .optional(),
    budget: z.number().positive().optional(),
    actualCost: z.number().nonnegative().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    actualEndDate: z.string().datetime().optional(),
    progress: z.number().min(0).max(100).optional(),
    location: z.string().optional(),
    area: z.number().positive().optional(),
    contractValue: z.number().positive().optional(),
    profitMargin: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  }),
});

export const createProjectStageSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Stage name is required'),
    description: z.string().optional(),
    order: z.number().int().positive('Order must be positive'),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
    budget: z.number().positive('Budget must be positive'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    progress: z.number().min(0).max(100).optional(),
  }),
});
