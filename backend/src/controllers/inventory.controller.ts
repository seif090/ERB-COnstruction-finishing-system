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

// @desc    Get all inventory items with pagination
// @route   GET /api/inventory
// @access  Private
export const getInventoryItems = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { supplier: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by category if provided
  if (req.query.category) {
    where.category = req.query.category;
  }

  // Filter by active status if provided
  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  // Filter by low stock if provided
  if (req.query.lowStock === 'true') {
    where.quantity = { lte: prisma.inventoryItem.fields.minQuantity };
  }

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            transactions: true,
            projectMaterials: true,
          },
        },
      },
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    items,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItemById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      projectMaterials: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          transactions: true,
          projectMaterials: true,
        },
      },
    },
  });

  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  res.status(200).json({ item });
};

// @desc    Create a new inventory item
// @route   POST /api/inventory
// @access  Private
export const createInventoryItem = async (req: AuthRequest, res: Response) => {
  const {
    name,
    code,
    category,
    description,
    unit,
    quantity,
    minQuantity,
    price,
    supplier,
    location,
  } = req.body;

  // Check if code already exists
  const existingItem = await prisma.inventoryItem.findUnique({ where: { code } });
  if (existingItem) {
    throw new AppError('Inventory item with this code already exists', 400);
  }

  const item = await prisma.inventoryItem.create({
    data: {
      name,
      code,
      category,
      description,
      unit,
      quantity,
      minQuantity,
      price,
      supplier,
      location,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'inventory_item_created', {
    message: 'New inventory item created',
    item,
  });

  res.status(201).json({
    message: 'Inventory item created successfully',
    item,
  });
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  // Check code uniqueness if code is being updated
  if (req.body.code && req.body.code !== item.code) {
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { code: req.body.code },
    });
    if (existingItem) {
      throw new AppError('Inventory item with this code already exists', 400);
    }
  }

  const updatedItem = await prisma.inventoryItem.update({
    where: { id },
    data: req.body,
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'inventory_item_updated', {
    message: 'Inventory item updated',
    item: updatedItem,
  });

  res.status(200).json({
    message: 'Inventory item updated successfully',
    item: updatedItem,
  });
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin only)
export const deleteInventoryItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  await prisma.inventoryItem.delete({ where: { id } });

  res.status(200).json({
    message: 'Inventory item deleted successfully',
  });
};

// @desc    Record inventory transaction
// @route   POST /api/inventory/:id/transactions
// @access  Private
export const recordInventoryTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type, quantity, unitPrice, referenceId, referenceType, notes } = req.body;

  // Validate transaction type
  const validTypes = ['IN', 'OUT', 'RETURN', 'ADJUSTMENT'];
  if (!validTypes.includes(type)) {
    throw new AppError('Invalid transaction type. Must be IN, OUT, RETURN, or ADJUSTMENT', 400);
  }

  // Verify item exists
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  // Validate quantity
  if (quantity <= 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }

  // For OUT transactions, check if there's enough stock
  if (type === 'OUT' && Number(item.quantity) < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Calculate total amount
  const totalAmount = Number(unitPrice) * Number(quantity);

  // Create transaction record
  const transaction = await prisma.inventoryTransaction.create({
    data: {
      itemId: id,
      type,
      quantity,
      unitPrice,
      totalAmount,
      referenceId,
      referenceType,
      notes,
      performedById: req.user!.id,
    },
    include: {
      item: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  // Update item quantity based on transaction type
  let newQuantity = Number(item.quantity);

  switch (type) {
    case 'IN':
    case 'RETURN':
      newQuantity += Number(quantity);
      break;
    case 'OUT':
      newQuantity -= Number(quantity);
      break;
    case 'ADJUSTMENT':
      newQuantity = Number(quantity);
      break;
  }

  const updatedItem = await prisma.inventoryItem.update({
    where: { id },
    data: { quantity: newQuantity },
  });

  // Check if item is now low stock
  if (newQuantity <= Number(item.minQuantity)) {
    const io = req.app.get('io');
    emitNotification(io, req.user!.id, 'low_stock_alert', {
      message: `Low stock alert: ${item.name} (${item.code}) is below minimum level`,
      item: updatedItem,
    });
  }

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'inventory_transaction', {
    message: `Inventory transaction recorded: ${type} - ${item.name}`,
    transaction,
    item: updatedItem,
  });

  res.status(201).json({
    message: 'Transaction recorded successfully',
    transaction,
    item: updatedItem,
  });
};

// @desc    Get inventory statistics
// @route   GET /api/inventory/stats
// @access  Private
export const getInventoryStats = async (req: AuthRequest, res: Response) => {
  const [
    total,
    byCategory,
    active,
    lowStock,
    totalValue,
  ] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.groupBy({
      by: ['category'],
      _count: true,
    }),
    prisma.inventoryItem.count({ where: { isActive: true } }),
    prisma.inventoryItem.count({
      where: {
        isActive: true,
      },
    }),
    prisma.inventoryItem.aggregate({
      _sum: {
        quantity: true,
      },
    }),
  ]);

  // Calculate total inventory value (quantity * price for each item)
  const allItems = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    select: {
      quantity: true,
      price: true,
    },
  });

  const inventoryValue = allItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
    0
  );

  // Get low stock count
  const lowStockCount = allItems.filter(
    (item) => Number(item.quantity) <= 0
  ).length;

  // Get recent transactions count
  const totalTransactions = await prisma.inventoryTransaction.count();

  res.status(200).json({
    stats: {
      total,
      active,
      lowStockCount,
      totalItems: total,
      inventoryValue,
      totalTransactions,
      byCategory,
    },
  });
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
export const getLowStockItems = async (req: AuthRequest, res: Response) => {
  const { page, limit } = parsePaginationParams(req.query);

  // Get all active items
  const allItems = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: { quantity: 'asc' },
  });

  // Filter items where quantity <= minQuantity
  const lowStockItems = allItems.filter(
    (item) => Number(item.quantity) <= Number(item.minQuantity)
  );

  // Paginate manually
  const paginatedItems = lowStockItems.slice(
    (page - 1) * limit,
    page * limit
  );

  const response: PaginatedResponse<any> = createPaginatedResponse(
    paginatedItems,
    lowStockItems.length,
    page,
    limit
  );

  res.status(200).json(response);
};
