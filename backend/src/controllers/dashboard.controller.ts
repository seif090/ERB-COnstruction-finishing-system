import { Response } from 'express';
import prisma from '..//database';
import { AppError } from '..//errorHandler';
import { AuthRequest } from '..//auth';
import { emitNotification } from '..//socket';

// @desc    Get dashboard overview (all KPIs)
// @route   GET /api/dashboard/overview
// @access  Private
export const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

  // Parallel fetch all KPI data
  const [
    // User stats
    totalUsers,
    activeUsers,

    // Client stats
    totalClients,
    activeClients,
    newClientsThisMonth,

    // Project stats
    totalProjects,
    inProgressProjects,
    completedProjects,
    pendingProjects,

    // Revenue stats
    totalRevenue,
    monthlyRevenue,
    yearlyRevenue,

    // Expense stats
    totalExpenses,
    monthlyExpenses,

    // Contract stats
    totalContracts,
    activeContracts,
    expiringContracts,

    // Payment stats
    totalPayments,
    pendingPayments,
    overduePayments,
    paidPayments,

    // Unit stats
    totalUnits,
    availableUnits,
    soldUnits,
    rentedUnits,

    // Inventory stats
    totalInventoryItems,
    lowStockItems,

    // Task stats
    totalTasks,
    pendingTasks,
    completedTasks,
    overdueTasks,
  ] = await Promise.all([
    // Users
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),

    // Clients
    prisma.client.count(),
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.client.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }),

    // Projects
    prisma.project.count(),
    prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.project.count({ where: { status: 'PENDING' } }),

    // Revenue
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: 'INCOME',
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: 'INCOME',
        date: {
          gte: firstDayOfYear,
          lte: now,
        },
      },
    }),

    // Expenses
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENSE' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: 'EXPENSE',
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }),

    // Contracts
    prisma.contract.count(),
    prisma.contract.count({ where: { status: 'ACTIVE' } }),
    prisma.contract.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Payments
    prisma.payment.count(),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        dueDate: { lt: now },
      },
    }),
    prisma.payment.count({ where: { status: 'PAID' } }),

    // Units
    prisma.unit.count(),
    prisma.unit.count({ where: { status: 'AVAILABLE' } }),
    prisma.unit.count({ where: { status: 'SOLD' } }),
    prisma.unit.count({ where: { status: 'RENTED' } }),

    // Inventory
    prisma.inventoryItem.count({ where: { isActive: true } }),
    prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: { quantity: true, minQuantity: true },
    }),

    // Tasks
    prisma.task.count(),
    prisma.task.count({
      where: { status: { in: ['TODO', 'IN_PROGRESS'] } },
    }),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
    }),
  ]);

  // Calculate profit
  const totalIncome = totalRevenue._sum.amount || 0;
  const totalExpense = totalExpenses._sum.amount || 0;
  const profit = totalIncome - totalExpense;

  // Calculate monthly profit
  const monthIncome = monthlyRevenue._sum.amount || 0;
  const monthExpense = monthlyExpenses._sum.amount || 0;
  const monthlyProfit = monthIncome - monthExpense;

  // Count actual low stock items
  const lowStockCount = (lowStockItems as any[]).filter(
    (item: any) => Number(item.quantity) <= Number(item.minQuantity)
  ).length;

  // Calculate profit margin
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0;

  res.status(200).json({
    overview: {
      // Financial
      totalRevenue: totalIncome,
      totalExpenses: totalExpense,
      profit,
      profitMargin: parseFloat(profitMargin as string),
      monthlyRevenue: monthIncome,
      monthlyExpenses: monthExpense,
      monthlyProfit,
      yearlyRevenue: yearlyRevenue._sum.amount || 0,

      // Clients
      totalClients,
      activeClients,
      newClientsThisMonth,

      // Projects
      totalProjects,
      inProgressProjects,
      completedProjects,
      pendingProjects,

      // Contracts
      totalContracts,
      activeContracts,
      expiringContracts,

      // Payments
      totalPayments,
      pendingPayments,
      overduePayments,
      paidPayments,
      pendingPaymentAmount: 0, // Can be enhanced with aggregate

      // Units
      totalUnits,
      availableUnits,
      soldUnits,
      rentedUnits,

      // Inventory
      totalInventoryItems,
      lowStockItems: lowStockCount,

      // Tasks
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,

      // Users
      totalUsers,
      activeUsers,
    },
  });
};

// @desc    Get revenue chart data (monthly)
// @route   GET /api/dashboard/revenue-chart
// @access  Private
export const getRevenueChart = async (req: AuthRequest, res: Response) => {
  const { months = 12 } = req.query;
  const numMonths = parseInt(months as string);
  const now = new Date();

  const monthlyData: any[] = [];

  for (let i = numMonths - 1; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [income, expenses] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'INCOME',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'EXPENSE',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    monthlyData.push({
      month: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`,
      revenue: income._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
      profit: (income._sum.amount || 0) - (expenses._sum.amount || 0),
    });
  }

  res.status(200).json({
    chart: {
      type: 'monthly',
      data: monthlyData,
    },
  });
};

// @desc    Get project progress chart
// @route   GET /api/dashboard/project-progress
// @access  Private
export const getProjectProgressChart = async (req: AuthRequest, res: Response) => {
  const projects = await prisma.project.findMany({
    where: {
      status: { in: ['IN_PROGRESS', 'PLANNING', 'PENDING'] },
    },
    select: {
      id: true,
      name: true,
      status: true,
      progress: true,
      startDate: true,
      endDate: true,
      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { progress: 'desc' },
  });

  // Group projects by status
  const byStatus = projects.reduce((acc: any, project) => {
    if (!acc[project.status]) {
      acc[project.status] = [];
    }
    acc[project.status].push({
      id: project.id,
      name: project.name,
      progress: project.progress,
      client: `${project.client.firstName} ${project.client.lastName}`,
      startDate: project.startDate,
      endDate: project.endDate,
    });
    return acc;
  }, {});

  // Calculate average progress
  const avgProgress =
    projects.length > 0
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
      : 0;

  res.status(200).json({
    chart: {
      projects,
      byStatus,
      avgProgress: Math.round(avgProgress),
      totalActive: projects.length,
    },
  });
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
export const getRecentActivities = async (req: AuthRequest, res: Response) => {
  const { limit = 20 } = req.query;
  const activitiesLimit = parseInt(limit as string);

  // Fetch recent data from different entities
  const [
    recentClients,
    recent_projects,
    recent_contracts,
    recent_payments,
    recent_transactions,
    recent_inventory,
  ] = await Promise.all([
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        progress: true,
        createdAt: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.contract.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contractNumber: true,
        title: true,
        status: true,
        createdAt: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        status: true,
        createdAt: true,
        contract: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        category: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.inventoryTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        quantity: true,
        totalAmount: true,
        createdAt: true,
        item: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    }),
  ]);

  // Combine and format all activities
  const activities: any[] = [];

  recent_clients.forEach((client) => {
    activities.push({
      id: client.id,
      type: 'client_created',
      title: `New client: ${client.firstName} ${client.lastName}`,
      description: 'A new client was added to the system',
      timestamp: client.createdAt,
    });
  });

  recent_projects.forEach((project) => {
    activities.push({
      id: project.id,
      type: 'project_created',
      title: `New project: ${project.name}`,
      description: `Project created for ${project.client.firstName} ${project.client.lastName}`,
      timestamp: project.createdAt,
    });
  });

  recent_contracts.forEach((contract) => {
    activities.push({
      id: contract.id,
      type: 'contract_created',
      title: `New contract: ${contract.contractNumber}`,
      description: contract.title,
      timestamp: contract.createdAt,
    });
  });

  recent_payments.forEach((payment) => {
    activities.push({
      id: payment.id,
      type: 'payment_recorded',
      title: `Payment: ${payment.paymentNumber}`,
      description: `Amount: ${Number(payment.amount).toLocaleString()} SAR - ${payment.status}`,
      timestamp: payment.createdAt,
    });
  });

  recent_transactions.forEach((transaction) => {
    activities.push({
      id: transaction.id,
      type: 'transaction_created',
      title: `${transaction.type}: ${transaction.description}`,
      description: `${transaction.category} - ${Number(transaction.amount).toLocaleString()} SAR`,
      timestamp: transaction.createdAt,
    });
  });

  recent_inventory.forEach((inv) => {
    activities.push({
      id: inv.id,
      type: 'inventory_transaction',
      title: `Inventory ${inv.type}: ${inv.item.name}`,
      description: `Quantity: ${Number(inv.quantity)} - Total: ${Number(inv.totalAmount).toLocaleString()} SAR`,
      timestamp: inv.createdAt,
    });
  });

  // Sort by timestamp descending and limit
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.status(200).json({
    activities: activities.slice(0, activitiesLimit),
  });
};

// @desc    Get notifications for dashboard
// @route   GET /api/dashboard/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
  const { limit = 10 } = req.query;
  const notificationsLimit = parseInt(limit as string);

  const [
    overduePayments,
    expiringContracts,
    lowStockItems,
    overdueTasks,
    unreadNotifications,
  ] = await Promise.all([
    // Overdue payments
    prisma.payment.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        dueDate: { lt: new Date() },
      },
      take: 5,
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        dueDate: true,
        status: true,
        contract: {
          select: {
            title: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    }),

    // Expiring contracts (within 30 days)
    prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      take: 5,
      select: {
        id: true,
        contractNumber: true,
        title: true,
        endDate: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { endDate: 'asc' },
    }),

    // Low stock inventory items
    prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        minQuantity: true,
      },
    }),

    // Overdue tasks
    prisma.task.findMany({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
      },
      take: 5,
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        priority: true,
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    }),

    // Unread notifications for user
    prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    }),
  ]);

  // Filter low stock items
  const lowStock = (lowStockItems as any[]).filter(
    (item: any) => Number(item.quantity) <= Number(item.minQuantity)
  );

  // Build notifications array
  const notifications: any[] = [];

  overduePayments.forEach((payment) => {
    notifications.push({
      type: 'PAYMENT_DUE',
      severity: 'error',
      title: 'Overdue Payment',
      message: `Payment ${payment.paymentNumber} is overdue`,
      entity: payment,
      timestamp: payment.dueDate,
    });
  });

  expiringContracts.forEach((contract) => {
    notifications.push({
      type: 'CONTRACT_EXPIRY',
      severity: 'warning',
      title: 'Contract Expiring Soon',
      message: `Contract ${contract.contractNumber} expires on ${new Date(contract.endDate).toLocaleDateString()}`,
      entity: contract,
      timestamp: contract.endDate,
    });
  });

  lowStock.forEach((item) => {
    notifications.push({
      type: 'INFO',
      severity: 'warning',
      title: 'Low Stock Alert',
      message: `${item.name} (${item.code}) is below minimum stock level`,
      entity: item,
      timestamp: new Date(),
    });
  });

  overdueTasks.forEach((task) => {
    notifications.push({
      type: 'PROJECT_UPDATE',
      severity: 'warning',
      title: 'Overdue Task',
      message: `Task "${task.title}" in project ${task.project.name} is overdue`,
      entity: task,
      timestamp: task.dueDate,
    });
  });

  // Sort by timestamp
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.status(200).json({
    notifications: notifications.slice(0, notificationsLimit),
    summary: {
      overduePaymentsCount: overduePayments.length,
      expiringContractsCount: expiringContracts.length,
      lowStockItemsCount: lowStock.length,
      overdueTasksCount: overdueTasks.length,
      unreadNotifications,
      totalAlerts:
        overduePayments.length +
        expiringContracts.length +
        lowStock.length +
        overdueTasks.length,
    },
  });
};


