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
import PDFDocument from 'pdfkit';

// Helper function to generate contract number
const generateContractNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const count = await prisma.contract.count();
  const sequence = String(count + 1).padStart(5, '0');

  return `CNT-${year}${month}-${sequence}`;
};

// @desc    Get all contracts with pagination
// @route   GET /api/contracts
// @access  Private
export const getContracts = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, search } = parsePaginationParams(req.query);

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { contractNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
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

  // Filter by client if provided
  if (req.query.clientId) {
    where.clientId = req.query.clientId;
  }

  // Filter by project if provided
  if (req.query.projectId) {
    where.projectId = req.query.projectId;
  }

  // Filter by unit if provided
  if (req.query.unitId) {
    where.unitId = req.query.unitId;
  }

  // Filter by date range if provided
  if (req.query.startDateFrom || req.query.startDateTo) {
    where.startDate = {};
    if (req.query.startDateFrom) {
      where.startDate.gte = new Date(req.query.startDateFrom as string);
    }
    if (req.query.startDateTo) {
      where.startDate.lte = new Date(req.query.startDateTo as string);
    }
  }

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
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
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        unit: {
          select: {
            id: true,
            title: true,
            type: true,
            city: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true,
          },
          orderBy: { dueDate: 'asc' },
          take: 5,
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    }),
    prisma.contract.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    contracts,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Get contract by ID
// @route   GET /api/contracts/:id
// @access  Private
export const getContractById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const contract = await prisma.contract.findUnique({
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
          address: true,
          city: true,
          country: true,
          nationalId: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          location: true,
          budget: true,
        },
      },
      unit: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          price: true,
          area: true,
          bedrooms: true,
          bathrooms: true,
          floor: true,
          buildingName: true,
          location: true,
          city: true,
          amenities: true,
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
      payments: {
        orderBy: { dueDate: 'asc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  res.status(200).json({ contract });
};

// @desc    Create a new contract
// @route   POST /api/contracts
// @access  Private
export const createContract = async (req: AuthRequest, res: Response) => {
  const {
    type,
    status,
    title,
    description,
    clientId,
    projectId,
    unitId,
    contractValue,
    startDate,
    endDate,
    renewalDate,
    terms,
    conditions,
    notes,
    documentUrl,
  } = req.body;

  // Verify client exists
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  // Verify project exists if provided
  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new AppError('Project not found', 404);
    }
  }

  // Verify unit exists if provided
  if (unitId) {
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new AppError('Unit not found', 404);
    }
  }

  // Generate contract number
  const contractNumber = await generateContractNumber();

  // Calculate remaining amount
  const remainingAmount = contractValue;

  const contract = await prisma.contract.create({
    data: {
      contractNumber,
      type,
      status,
      title,
      description,
      clientId,
      projectId,
      unitId,
      contractValue,
      remainingAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      renewalDate: renewalDate ? new Date(renewalDate) : undefined,
      terms,
      conditions,
      notes,
      documentUrl,
      createdById: req.user!.id,
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
  emitNotification(io, req.user!.id, 'contract_created', {
    message: 'New contract created',
    contract,
  });

  res.status(201).json({
    message: 'Contract created successfully',
    contract,
  });
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
export const updateContract = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  const updatedContract = await prisma.contract.update({
    where: { id },
    data: {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      renewalDate: req.body.renewalDate ? new Date(req.body.renewalDate) : undefined,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'contract_updated', {
    message: 'Contract updated',
    contract: updatedContract,
  });

  res.status(200).json({
    message: 'Contract updated successfully',
    contract: updatedContract,
  });
};

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private (Admin/Manager only)
export const deleteContract = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  await prisma.contract.delete({ where: { id } });

  res.status(200).json({
    message: 'Contract deleted successfully',
  });
};

// @desc    Generate contract PDF
// @route   GET /api/contracts/:id/pdf
// @access  Private
export const generateContractPDF = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      client: true,
      project: {
        select: {
          name: true,
          description: true,
          location: true,
        },
      },
      unit: {
        select: {
          title: true,
          type: true,
          area: true,
          location: true,
          city: true,
        },
      },
      payments: {
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Create PDF document
  const doc = new PDFDocument({
    margin: 50,
    info: {
      Title: `Contract ${contract.contractNumber}`,
      Author: 'ERB Construction ERP System',
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.contractNumber}.pdf`);

  doc.pipe(res);

  // Helper function for formatted currency
  const formatCurrency = (amount: any) => {
    const num = Number(amount);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SAR';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ---- Header ----
  doc
    .fillColor('#1a365d')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('CONTRACT AGREEMENT', { align: 'center' });

  doc
    .moveDown(0.5)
    .strokeColor('#1a365d')
    .lineWidth(2)
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();

  // ---- Contract Details ----
  doc
    .moveDown(1)
    .fillColor('#2d3748')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Contract Details', { underline: true });

  doc
    .moveDown(0.5)
    .fillColor('#4a5568')
    .fontSize(11)
    .font('Helvetica');

  const details = [
    ['Contract Number', contract.contractNumber],
    ['Type', contract.type],
    ['Status', contract.status],
    ['Title', contract.title],
    ['Contract Value', formatCurrency(contract.contractValue)],
    ['Paid Amount', formatCurrency(contract.paidAmount)],
    ['Remaining Amount', formatCurrency(contract.remainingAmount)],
    ['Start Date', formatDate(contract.startDate)],
    ['End Date', formatDate(contract.endDate)],
  ];

  if (contract.renewalDate) {
    details.push(['Renewal Date', formatDate(contract.renewalDate)]);
  }

  details.forEach(([label, value]) => {
    doc
      .font('Helvetica-Bold')
      .text(`${label}:`, { continued: true })
      .font('Helvetica')
      .text(` ${String(value)}`);
  });

  // ---- Client Information ----
  doc
    .moveDown(1)
    .fillColor('#2d3748')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Client Information', { underline: true });

  doc
    .moveDown(0.5)
    .fillColor('#4a5568')
    .fontSize(11)
    .font('Helvetica');

  const clientInfo = [
    ['Name', `${contract.client.firstName} ${contract.client.lastName}`],
    ['Email', contract.client.email],
    ['Phone', contract.client.phone || 'N/A'],
    ['Company', contract.client.company || 'N/A'],
    ['Address', contract.client.address || 'N/A'],
    ['City', `${contract.client.city || ''} ${contract.client.country || ''}`.trim() || 'N/A'],
  ];

  clientInfo.forEach(([label, value]) => {
    doc
      .font('Helvetica-Bold')
      .text(`${label}:`, { continued: true })
      .font('Helvetica')
      .text(` ${value}`);
  });

  // ---- Project Information (if applicable) ----
  if (contract.project) {
    doc
      .moveDown(1)
      .fillColor('#2d3748')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Project Information', { underline: true });

    doc
      .moveDown(0.5)
      .fillColor('#4a5568')
      .fontSize(11)
      .font('Helvetica');

    doc
      .font('Helvetica-Bold')
      .text('Project Name:', { continued: true })
      .font('Helvetica')
      .text(` ${contract.project.name}`);

    if (contract.project.location) {
      doc
        .font('Helvetica-Bold')
        .text('Location:', { continued: true })
        .font('Helvetica')
        .text(` ${contract.project.location}`);
    }

    if (contract.project.description) {
      doc
        .font('Helvetica-Bold')
        .text('Description:', { continued: true })
        .font('Helvetica')
        .text(` ${contract.project.description}`);
    }
  }

  // ---- Unit Information (if applicable) ----
  if (contract.unit) {
    doc
      .moveDown(1)
      .fillColor('#2d3748')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Unit Information', { underline: true });

    doc
      .moveDown(0.5)
      .fillColor('#4a5568')
      .fontSize(11)
      .font('Helvetica');

    doc
      .font('Helvetica-Bold')
      .text('Unit Title:', { continued: true })
      .font('Helvetica')
      .text(` ${contract.unit.title}`);

    doc
      .font('Helvetica-Bold')
      .text('Type:', { continued: true })
      .font('Helvetica')
      .text(` ${contract.unit.type}`);

    doc
      .font('Helvetica-Bold')
      .text('Area:', { continued: true })
      .font('Helvetica')
      .text(` ${Number(contract.unit.area).toLocaleString()} sqm`);

    doc
      .font('Helvetica-Bold')
      .text('Location:', { continued: true })
      .font('Helvetica')
      .text(` ${contract.unit.location || ''} ${contract.unit.city}`);
  }

  // ---- Terms and Conditions ----
  if (contract.terms || contract.conditions) {
    doc
      .moveDown(1)
      .fillColor('#2d3748')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Terms & Conditions', { underline: true });

    doc
      .moveDown(0.5)
      .fillColor('#4a5568')
      .fontSize(11)
      .font('Helvetica');

    if (contract.terms) {
      doc
        .font('Helvetica-Bold')
        .text('Terms:', { continued: true })
        .font('Helvetica')
        .text(` ${contract.terms}`, { width: 500 });
    }

    if (contract.conditions) {
      doc
        .font('Helvetica-Bold')
        .text('Conditions:', { continued: true })
        .font('Helvetica')
        .text(` ${contract.conditions}`, { width: 500 });
    }
  }

  // ---- Payment Schedule ----
  if (contract.payments.length > 0) {
    doc
      .moveDown(1)
      .fillColor('#2d3748')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Payment Schedule', { underline: true });

    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const colWidths = [60, 100, 100, 100, 100];
    const colX = [50, 110, 210, 310, 410];

    doc
      .fillColor('#1a365d')
      .fontSize(10)
      .font('Helvetica-Bold');

    doc.text('#', colX[0], tableTop);
    doc.text('Amount', colX[1], tableTop);
    doc.text('Status', colX[2], tableTop);
    doc.text('Due Date', colX[3], tableTop);
    doc.text('Paid Date', colX[4], tableTop);

    // Draw line under header
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(doc.page.width - 50, tableTop + 15)
      .stroke();

    // Table rows
    doc
      .fillColor('#4a5568')
      .fontSize(10)
      .font('Helvetica');

    contract.payments.forEach((payment, index) => {
      const rowY = tableTop + 25 + index * 20;

      // Check if we need a new page
      if (rowY > doc.page.height - 100) {
        doc.addPage();
        // Re-draw header on new page
        doc
          .fillColor('#1a365d')
          .fontSize(10)
          .font('Helvetica-Bold');
        doc.text('#', colX[0], 50);
        doc.text('Amount', colX[1], 50);
        doc.text('Status', colX[2], 50);
        doc.text('Due Date', colX[3], 50);
        doc.text('Paid Date', colX[4], 50);

        doc
          .strokeColor('#e2e8f0')
          .lineWidth(1)
          .moveTo(50, 65)
          .lineTo(doc.page.width - 50, 65)
          .stroke();

        doc
          .fillColor('#4a5568')
          .fontSize(10)
          .font('Helvetica');

        const newRowY = 75;
        doc.text(String(index + 1), colX[0], newRowY);
        doc.text(formatCurrency(payment.amount), colX[1], newRowY);
        doc.text(payment.status, colX[2], newRowY);
        doc.text(formatDate(payment.dueDate), colX[3], newRowY);
        doc.text(payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A', colX[4], newRowY);
      } else {
        doc.text(String(index + 1), colX[0], rowY);
        doc.text(formatCurrency(payment.amount), colX[1], rowY);
        doc.text(payment.status, colX[2], rowY);
        doc.text(formatDate(payment.dueDate), colX[3], rowY);
        doc.text(payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A', colX[4], rowY);
      }
    });
  }

  // ---- Notes ----
  if (contract.notes) {
    doc
      .moveDown(1)
      .fillColor('#2d3748')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Notes', { underline: true });

    doc
      .moveDown(0.5)
      .fillColor('#4a5568')
      .fontSize(11)
      .font('Helvetica')
      .text(contract.notes, { width: 500 });
  }

  // ---- Footer ----
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    // Add page number
    doc
      .fillColor('#a0aec0')
      .fontSize(9)
      .font('Helvetica')
      .text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 30,
        { align: 'center' }
      );

    // Add company name
    doc
      .fillColor('#a0aec0')
      .fontSize(9)
      .font('Helvetica')
      .text(
        'ERB Construction Finishing System',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
  }

  doc.end();
};

// @desc    Get contract statistics
// @route   GET /api/contracts/stats
// @access  Private
export const getContractStats = async (req: AuthRequest, res: Response) => {
  const [
    total,
    byType,
    byStatus,
    totalValue,
    activeContracts,
    expiredContracts,
    completedContracts,
  ] = await Promise.all([
    prisma.contract.count(),
    prisma.contract.groupBy({
      by: ['type'],
      _count: true,
    }),
    prisma.contract.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.contract.aggregate({
      _sum: { contractValue: true },
    }),
    prisma.contract.count({ where: { status: 'ACTIVE' } }),
    prisma.contract.count({ where: { status: 'EXPIRED' } }),
    prisma.contract.count({ where: { status: 'COMPLETED' } }),
  ]);

  res.status(200).json({
    stats: {
      total,
      activeContracts,
      expiredContracts,
      completedContracts,
      totalContractValue: totalValue._sum.contractValue || 0,
      byType,
      byStatus,
    },
  });
};


