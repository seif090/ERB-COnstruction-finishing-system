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

// @desc    Get all transactions with pagination
// @route   GET /api/accounting/transactions
// @access  Private
export const getTransactions = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = {};

  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { referenceId: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by type if provided
  if (req.query.type) {
    where.type = req.query.type;
  }

  // Filter by category if provided
  if (req.query.category) {
    where.category = req.query.category;
  }

  // Filter by date range if provided
  if (req.query.dateFrom || req.query.dateTo) {
    where.date = {};
    if (req.query.dateFrom) {
      where.date.gte = new Date(req.query.dateFrom as string);
    }
    if (req.query.dateTo) {
      where.date.lte = new Date(req.query.dateTo as string);
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    transactions,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get transaction by ID
// @route   GET /api/accounting/transactions/:id
// @access  Private
export const getTransactionById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  res.status(200).json({ transaction });
};

// @desc    Create a new transaction
// @route   POST /api/accounting/transactions
// @access  Private
export const createTransaction = async (req: AuthRequest, res: Response) => {
  const {
    type,
    category,
    amount,
    description,
    referenceId,
    referenceType,
    date,
  } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      type,
      category,
      amount,
      description,
      referenceId,
      referenceType,
      date: date ? new Date(date) : new Date(),
      createdById: req.user!.id,
    },
    include: {
      createdBy: {
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
  emitNotification(io, req.user!.id, 'transaction_created', {
    message: 'New transaction created',
    transaction,
  });

  res.status(201).json({
    message: 'Transaction created successfully',
    transaction,
  });
};

// @desc    Update transaction
// @route   PUT /api/accounting/transactions/:id
// @access  Private
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'transaction_updated', {
    message: 'Transaction updated',
    transaction: updatedTransaction,
  });

  res.status(200).json({
    message: 'Transaction updated successfully',
    transaction: updatedTransaction,
  });
};

// @desc    Delete transaction
// @route   DELETE /api/accounting/transactions/:id
// @access  Private (Admin/Accountant only)
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  await prisma.transaction.delete({ where: { id } });

  res.status(200).json({
    message: 'Transaction deleted successfully',
  });
};

// @desc    Get financial summary
// @route   GET /api/accounting/summary
// @access  Private
export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  const { dateFrom, dateTo } = req.query;

  const dateFilter: any = {};
  if (dateFrom) {
    dateFilter.gte = new Date(dateFrom as string);
  }
  if (dateTo) {
    dateFilter.lte = new Date(dateTo as string);
  }

  const where = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

  const [
    totalIncome,
    totalExpenses,
    incomeByCategory,
    expensesByCategory,
    recentIncome,
    recentExpenses,
    transactionCount,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...where, type: 'INCOME' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...where, type: 'EXPENSE' },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: true,
      where: { ...where, type: 'INCOME' },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: true,
      where: { ...where, type: 'EXPENSE' },
    }),
    prisma.transaction.findMany({
      where: { ...where, type: 'INCOME' },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      where: { ...where, type: 'EXPENSE' },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const income = totalIncome._sum.amount || 0;
  const expenses = totalExpenses._sum.amount || 0;
  const profit = income - expenses;

  res.status(200).json({
    summary: {
      totalIncome: income,
      totalExpenses: expenses,
      profit,
      profitMargin: income > 0 ? ((profit / income) * 100).toFixed(2) : 0,
      transactionCount,
      incomeByCategory,
      expensesByCategory,
      recentIncome,
      recentExpenses,
    },
  });
};

// @desc    Get transactions by category
// @route   GET /api/accounting/transactions/category/:category
// @access  Private
export const getTransactionsByCategory = async (req: AuthRequest, res: Response) => {
  const { category } = req.params;
  const { page, limit, sortBy, sortOrder } = parsePaginationParams(req.query);

  const where: any = { category };

  // Filter by type if provided
  if (req.query.type) {
    where.type = req.query.type;
  }

  // Filter by date range if provided
  if (req.query.dateFrom || req.query.dateTo) {
    where.date = {};
    if (req.query.dateFrom) {
      where.date.gte = new Date(req.query.dateFrom as string);
    }
    if (req.query.dateTo) {
      where.date.lte = new Date(req.query.dateTo as string);
    }
  }

  const [transactions, total, categoryStats] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where,
    }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    transactions,
    total,
    page,
    limit
  );

  res.status(200).json({
    ...response,
    categoryStats: {
      totalAmount: categoryStats._sum.amount || 0,
      totalCount: categoryStats._count,
    },
  });
};
