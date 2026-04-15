import { Response } from 'express';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import {
  parsePaginationParams,
  createPaginatedResponse,
  PaginatedResponse,
} from '../../utils/pagination';
import { emitNotification } from '../../utils/socket';

// @desc    Get all contractors with pagination
// @route   GET /api/contractors
// @access  Private
export const getContractors = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by specialty if provided
  if (req.query.specialty) {
    const specialty = req.query.specialty as string;
    where.specialty = { has: specialty };
  }

  // Filter by active status if provided
  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  const [contractors, total] = await Promise.all([
    prisma.contractor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            assignments: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.contractor.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    contractors,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get contractor by ID
// @route   GET /api/contractors/:id
// @access  Private
export const getContractorById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const contractor = await prisma.contractor.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          assignments: true,
          reviews: true,
        },
      },
    },
  });

  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  res.status(200).json({ contractor });
};

// @desc    Create a new contractor
// @route   POST /api/contractors
// @access  Private
export const createContractor = async (req: AuthRequest, res: Response) => {
  const {
    name,
    email,
    phone,
    altPhone,
    specialty,
    experienceYears,
    idNumber,
    dailyRate,
    notes,
  } = req.body;

  // Check if email already exists
  const existingContractor = await prisma.contractor.findUnique({ where: { email } });
  if (existingContractor) {
    throw new AppError('Contractor with this email already exists', 400);
  }

  const contractor = await prisma.contractor.create({
    data: {
      name,
      email,
      phone,
      altPhone,
      specialty: specialty || [],
      experienceYears,
      idNumber,
      dailyRate,
      notes,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'contractor_created', {
    message: 'New contractor created',
    contractor,
  });

  res.status(201).json({
    message: 'Contractor created successfully',
    contractor,
  });
};

// @desc    Update contractor
// @route   PUT /api/contractors/:id
// @access  Private
export const updateContractor = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  // Check email uniqueness if email is being updated
  if (req.body.email && req.body.email !== contractor.email) {
    const existingContractor = await prisma.contractor.findUnique({
      where: { email: req.body.email },
    });
    if (existingContractor) {
      throw new AppError('Contractor with this email already exists', 400);
    }
  }

  const updatedContractor = await prisma.contractor.update({
    where: { id },
    data: req.body,
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'contractor_updated', {
    message: 'Contractor updated',
    contractor: updatedContractor,
  });

  res.status(200).json({
    message: 'Contractor updated successfully',
    contractor: updatedContractor,
  });
};

// @desc    Delete contractor
// @route   DELETE /api/contractors/:id
// @access  Private (Admin only)
export const deleteContractor = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  await prisma.contractor.delete({ where: { id } });

  res.status(200).json({
    message: 'Contractor deleted successfully',
  });
};

// @desc    Assign contractor to project
// @route   POST /api/contractors/:id/assign
// @access  Private
export const assignContractorToProject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { projectId, role, hourlyRate, endDate, notes } = req.body;

  // Verify contractor exists
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if contractor is already assigned to this project
  const existingAssignment = await prisma.contractorAssignment.findFirst({
    where: {
      contractorId: id,
      projectId,
      status: 'ACTIVE',
    },
  });

  if (existingAssignment) {
    throw new AppError('Contractor is already assigned to this project', 400);
  }

  const assignment = await prisma.contractorAssignment.create({
    data: {
      contractorId: id,
      projectId,
      role,
      hourlyRate,
      endDate: endDate ? new Date(endDate) : undefined,
      notes,
    },
    include: {
      contractor: {
        select: {
          id: true,
          name: true,
          specialty: true,
          phone: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'contractor_assigned', {
    message: 'Contractor assigned to project',
    assignment,
  });

  res.status(201).json({
    message: 'Contractor assigned to project successfully',
    assignment,
  });
};

// @desc    Review contractor
// @route   POST /api/contractors/:id/reviews
// @access  Private
export const reviewContractor = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { projectId, rating, comment } = req.body;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Verify contractor exists
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  // Create review
  const review = await prisma.contractorReview.create({
    data: {
      contractorId: id,
      projectId,
      rating,
      comment,
      createdBy: req.user!.id,
    },
  });

  // Update contractor's average rating
  const reviews = await prisma.contractorReview.findMany({
    where: { contractorId: id },
    select: { rating: true },
  });

  const avgRating =
    reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length;

  await prisma.contractor.update({
    where: { id },
    data: { rating: avgRating },
  });

  res.status(201).json({
    message: 'Review submitted successfully',
    review,
  });
};

// @desc    Get contractor statistics
// @route   GET /api/contractors/stats
// @access  Private
export const getContractorStats = async (req: AuthRequest, res: Response) => {
  const [total, bySpecialty, active, avgRating] = await Promise.all([
    prisma.contractor.count(),
    prisma.contractor.groupBy({
      by: ['specialty'],
      _count: true,
    }),
    prisma.contractor.count({
      where: { isActive: true },
    }),
    prisma.contractor.aggregate({
      _avg: { rating: true },
    }),
  ]);

  // Get active assignments count
  const activeAssignments = await prisma.contractorAssignment.count({
    where: { status: 'ACTIVE' },
  });

  // Get total reviews count
  const totalReviews = await prisma.contractorReview.count();

  res.status(200).json({
    stats: {
      total,
      active,
      activeAssignments,
      totalReviews,
      avgRating: avgRating._avg.rating || 0,
      bySpecialty,
    },
  });
};
