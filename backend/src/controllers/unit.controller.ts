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

// @desc    Get all units with pagination
// @route   GET /api/units
// @access  Private
export const getUnits = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { buildingName: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by type if provided
  if (req.query.type) {
    where.type = req.query.type;
  }

  // Filter by status if provided
  if (req.query.status) {
    where.status = req.query.status;
  }

  // Filter by city if provided
  if (req.query.city) {
    where.city = { contains: req.query.city as string, mode: 'insensitive' };
  }

  // Filter by price range if provided
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) {
      where.price.gte = parseFloat(req.query.minPrice as string);
    }
    if (req.query.maxPrice) {
      where.price.lte = parseFloat(req.query.maxPrice as string);
    }
  }

  // Filter by bedrooms if provided
  if (req.query.bedrooms) {
    where.bedrooms = parseInt(req.query.bedrooms as string);
  }

  const [units, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        unitFeatures: true,
        _count: {
          select: {
            contracts: true,
          },
        },
      },
    }),
    prisma.unit.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    units,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get unit by ID
// @route   GET /api/units/:id
// @access  Private
export const getUnitById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      unitFeatures: true,
      contracts: {
        select: {
          id: true,
          contractNumber: true,
          type: true,
          status: true,
          contractValue: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  res.status(200).json({ unit });
};

// @desc    Create a new unit
// @route   POST /api/units
// @access  Private
export const createUnit = async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    type,
    status,
    furnishingStatus,
    price,
    rentPrice,
    area,
    bedrooms,
    bathrooms,
    floor,
    buildingName,
    location,
    city,
    country,
    amenities,
    yearBuilt,
    images,
    notes,
    features,
  } = req.body;

  const unit = await prisma.unit.create({
    data: {
      title,
      description,
      type,
      status,
      furnishingStatus,
      price,
      rentPrice,
      area,
      bedrooms,
      bathrooms,
      floor,
      buildingName,
      location,
      city,
      country,
      amenities: amenities || [],
      yearBuilt,
      images: images || [],
      notes,
    },
  });

  // Create unit features if provided
  if (features && Array.isArray(features)) {
    await prisma.unitFeature.createMany({
      data: features.map((feature: { name: string; value?: string }) => ({
        unitId: unit.id,
        name: feature.name,
        value: feature.value,
      })),
    });
  }

  // Fetch complete unit with features
  const createdUnit = await prisma.unit.findUnique({
    where: { id: unit.id },
    include: {
      unitFeatures: true,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'unit_created', {
    message: 'New unit created',
    unit: createdUnit,
  });

  res.status(201).json({
    message: 'Unit created successfully',
    unit: createdUnit,
  });
};

// @desc    Update unit
// @route   PUT /api/units/:id
// @access  Private
export const updateUnit = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { features, ...unitData } = req.body;

  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  // Update unit
  const updatedUnit = await prisma.unit.update({
    where: { id },
    data: unitData,
    include: {
      unitFeatures: true,
    },
  });

  // Update features if provided
  if (features && Array.isArray(features)) {
    // Delete existing features
    await prisma.unitFeature.deleteMany({
      where: { unitId: id },
    });

    // Create new features
    await prisma.unitFeature.createMany({
      data: features.map((feature: { name: string; value?: string }) => ({
        unitId: id,
        name: feature.name,
        value: feature.value,
      })),
    });
  }

  // Fetch complete updated unit
  const completeUnit = await prisma.unit.findUnique({
    where: { id },
    include: {
      unitFeatures: true,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'unit_updated', {
    message: 'Unit updated',
    unit: completeUnit,
  });

  res.status(200).json({
    message: 'Unit updated successfully',
    unit: completeUnit,
  });
};

// @desc    Delete unit
// @route   DELETE /api/units/:id
// @access  Private (Admin only)
export const deleteUnit = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  await prisma.unit.delete({ where: { id } });

  res.status(200).json({
    message: 'Unit deleted successfully',
  });
};

// @desc    Get unit statistics
// @route   GET /api/units/stats
// @access  Private
export const getUnitStats = async (req: AuthRequest, res: Response) => {
  const [
    total,
    byType,
    byStatus,
    byCity,
    available,
    sold,
    rented,
    avgPrice,
  ] = await Promise.all([
    prisma.unit.count(),
    prisma.unit.groupBy({
      by: ['type'],
      _count: true,
    }),
    prisma.unit.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.unit.groupBy({
      by: ['city'],
      _count: true,
    }),
    prisma.unit.count({ where: { status: 'AVAILABLE' } }),
    prisma.unit.count({ where: { status: 'SOLD' } }),
    prisma.unit.count({ where: { status: 'RENTED' } }),
    prisma.unit.aggregate({
      _avg: { price: true },
    }),
  ]);

  res.status(200).json({
    stats: {
      total,
      available,
      sold,
      rented,
      avgPrice: avgPrice._avg.price || 0,
      byType,
      byStatus,
      byCity,
    },
  });
};
