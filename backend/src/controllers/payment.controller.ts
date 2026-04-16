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

// Helper function to generate payment number
const generatePaymentNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const count = await prisma.payment.count();
  const sequence = String(count + 1).padStart(5, '0');

  return `PAY-${year}${month}-${sequence}`;
};

// @desc    Get all payments with pagination
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = {};

  if (search) {
    where.OR = [
      { paymentNumber: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by status if provided
  if (req.query.status) {
    where.status = req.query.status;
  }

  // Filter by contract if provided
  if (req.query.contractId) {
    where.contractId = req.query.contractId;
  }

  // Filter by project if provided
  if (req.query.projectId) {
    where.projectId = req.query.projectId;
  }

  // Filter by payment method if provided
  if (req.query.paymentMethod) {
    where.paymentMethod = req.query.paymentMethod;
  }

  // Filter by date range if provided
  if (req.query.dueDateFrom || req.query.dueDateTo) {
    where.dueDate = {};
    if (req.query.dueDateFrom) {
      where.dueDate.gte = new Date(req.query.dueDateFrom as string);
    }
    if (req.query.dueDateTo) {
      where.dueDate.lte = new Date(req.query.dueDateTo as string);
    }
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            title: true,
            type: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    payments,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      contract: {
        select: {
          id: true,
          contractNumber: true,
          title: true,
          type: true,
          status: true,
          contractValue: true,
          clientId: true,
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          location: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  res.status(200).json({ payment });
};

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req: AuthRequest, res: Response) => {
  const {
    contractId,
    projectId,
    amount,
    status,
    paymentMethod,
    dueDate,
    notes,
    receiptUrl,
  } = req.body;

  // Verify contract exists
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Verify project exists if provided
  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new AppError('Project not found', 404);
    }
  }

  // Generate payment number
  const paymentNumber = await generatePaymentNumber();

  const payment = await prisma.payment.create({
    data: {
      paymentNumber,
      contractId,
      projectId,
      amount,
      status,
      paymentMethod,
      dueDate: new Date(dueDate),
      notes,
      receiptUrl,
      createdById: req.user!.id,
    },
    include: {
      contract: {
        select: {
          id: true,
          contractNumber: true,
          title: true,
        },
      },
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'payment_created', {
    message: 'New payment created',
    payment,
  });

  res.status(201).json({
    message: 'Payment created successfully',
    payment,
  });
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: {
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'payment_updated', {
    message: 'Payment updated',
    payment: updatedPayment,
  });

  res.status(200).json({
    message: 'Payment updated successfully',
    payment: updatedPayment,
  });
};

// @desc    Record payment (mark as paid)
// @route   POST /api/payments/:id/record
// @access  Private
export const recordPayment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { paymentMethod, receiptUrl, notes } = req.body;

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status === 'PAID') {
    throw new AppError('Payment has already been recorded', 400);
  }

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: {
      status: 'PAID',
      paidAmount: payment.amount,
      paymentMethod: paymentMethod || payment.paymentMethod,
      paymentDate: new Date(),
      receiptUrl: receiptUrl || payment.receiptUrl,
      notes: notes || payment.notes,
    },
    include: {
      contract: true,
    },
  });

  // Update contract paid amount
  const contractPayments = await prisma.payment.findMany({
    where: { contractId: payment.contractId, status: 'PAID' },
    select: { amount: true },
  });

  const totalPaid = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  await prisma.contract.update({
    where: { id: payment.contractId },
    data: {
      paidAmount: totalPaid,
      remainingAmount: Number(payment.contract.contractValue) - totalPaid,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'payment_recorded', {
    message: 'Payment recorded successfully',
    payment: updatedPayment,
  });

  res.status(200).json({
    message: 'Payment recorded successfully',
    payment: updatedPayment,
  });
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
export const getPaymentStats = async (req: AuthRequest, res: Response) => {
  const [
    total,
    byStatus,
    totalAmount,
    totalPaid,
    pendingCount,
    overdueCount,
    paidCount,
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.groupBy({
      by: ['status'],
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      _sum: { paidAmount: true },
      where: { status: 'PAID' },
    }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({ where: { status: 'OVERDUE' } }),
    prisma.payment.count({ where: { status: 'PAID' } }),
  ]);

  // Get upcoming payments (next 30 days)
  const upcomingPayments = await prisma.payment.aggregate({
    _sum: { amount: true },
    _count: true,
    where: {
      status: 'PENDING',
      dueDate: {
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        gte: new Date(),
      },
    },
  });

  res.status(200).json({
    stats: {
      total,
      pendingCount,
      overdueCount,
      paidCount,
      totalAmount: totalAmount._sum.amount || 0,
      totalPaid: totalPaid._sum.paidAmount || 0,
      upcomingPayments: upcomingPayments._sum.amount || 0,
      upcomingCount: upcomingPayments._count || 0,
      byStatus,
    },
  });
};

// @desc    Get overdue payments
// @route   GET /api/payments/overdue
// @access  Private
export const getOverduePayments = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = parsePaginationParams(req.query);

  const now = new Date();

  const where = {
    status: {
      in: ['PENDING', 'PARTIALLY_PAID'],
    },
    dueDate: {
      lt: now,
    },
  };

  const [overduePayments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            title: true,
            type: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
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
    }),
    prisma.payment.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    overduePayments,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};


