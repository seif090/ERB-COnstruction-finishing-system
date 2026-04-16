import { Response } from 'express';
import prisma from '..//database';
import { AppError } from '..//errorHandler';
import { AuthRequest } from '..//auth';
import {
  parsePaginationParams,
  createPaginatedResponse,
  PaginatedResponse,
} from '..//pagination';
import { emitNotification } from '..//socket';

// @desc    Get all clients with pagination
// @route   GET /api/clients
// @access  Private
export const getClients = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            projects: true,
            contracts: true,
          },
        },
      },
    }),
    prisma.client.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    clients,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
          budget: true,
          progress: true,
        },
      },
      contracts: {
        select: {
          id: true,
          contractNumber: true,
          type: true,
          status: true,
          contractValue: true,
        },
      },
      clientNotes: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          projects: true,
          contracts: true,
          attachments: true,
          interactions: true,
        },
      },
    },
  });

  if (!client) {
    throw new AppError('Client not found', 404);
  }

  res.status(200).json({ client });
};

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
export const createClient = async (req: AuthRequest, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    altPhone,
    company,
    position,
    status,
    source,
    address,
    city,
    country,
    nationalId,
    notes,
  } = req.body;

  // Check if email already exists
  const existingClient = await prisma.client.findUnique({ where: { email } });
  if (existingClient) {
    throw new AppError('Client with this email already exists', 400);
  }

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      altPhone,
      company,
      position,
      status,
      source,
      address,
      city,
      country,
      nationalId,
      notes,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'client_created', {
    message: 'New client created',
    client,
  });

  res.status(201).json({
    message: 'Client created successfully',
    client,
  });
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({
    message: 'Client updated successfully',
    client: updatedClient,
  });
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (Admin only)
export const deleteClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  await prisma.client.delete({ where: { id } });

  res.status(200).json({
    message: 'Client deleted successfully',
  });
};

// @desc    Add note to client
// @route   POST /api/clients/:id/notes
// @access  Private
export const addClientNote = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  const note = await prisma.clientNote.create({
    data: {
      clientId: id,
      content,
      createdBy: req.user!.id,
    },
  });

  res.status(201).json({
    message: 'Note added successfully',
    note,
  });
};

// @desc    Add interaction to client
// @route   POST /api/clients/:id/interactions
// @access  Private
export const addClientInteraction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type, subject, description, date } = req.body;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  const interaction = await prisma.clientInteraction.create({
    data: {
      clientId: id,
      type,
      subject,
      description,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user!.id,
    },
  });

  res.status(201).json({
    message: 'Interaction added successfully',
    interaction,
  });
};

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private
export const getClientStats = async (req: AuthRequest, res: Response) => {
  const [total, byStatus, newThisMonth, active] = await Promise.all([
    prisma.client.count(),
    prisma.client.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.client.count({
      where: { status: 'ACTIVE' },
    }),
  ]);

  res.status(200).json({
    stats: {
      total,
      byStatus,
      newThisMonth,
      active,
    },
  });
};


