import { Router } from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  generateContractPDF,
  getContractStats,
} from '../controllers/contract.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /contracts/stats:
 *   get:
 *     summary: Get contract statistics
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contract statistics retrieved
 */
router.get('/stats', getContractStats);

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Get all contracts with pagination
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SALE, RENTAL, SERVICE, CONSTRUCTION, MAINTENANCE]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, EXPIRED, CANCELLED]
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: startDateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Contracts retrieved successfully
 */
router.get('/', getContracts);

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract retrieved successfully
 *       404:
 *         description: Contract not found
 */
router.get('/:id', getContractById);

/**
 * @swagger
 * /contracts/{id}/pdf:
 *   get:
 *     summary: Generate contract PDF
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Contract not found
 */
router.get('/:id/pdf', generateContractPDF);

/**
 * @swagger
 * /contracts:
 *   post:
 *     summary: Create a new contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, status, title, clientId, contractValue, startDate, endDate]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SALE, RENTAL, SERVICE, CONSTRUCTION, MAINTENANCE]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, COMPLETED, EXPIRED, CANCELLED]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               clientId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               unitId:
 *                 type: string
 *               contractValue:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               renewalDate:
 *                 type: string
 *                 format: date-time
 *               terms:
 *                 type: string
 *               conditions:
 *                 type: string
 *               notes:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Client, project, or unit not found
 */
router.post('/', createContract);

/**
 * @swagger
 * /contracts/{id}:
 *   put:
 *     summary: Update contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               contractValue:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               renewalDate:
 *                 type: string
 *                 format: date-time
 *               terms:
 *                 type: string
 *               conditions:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contract updated successfully
 *       404:
 *         description: Contract not found
 */
router.put('/:id', updateContract);

/**
 * @swagger
 * /contracts/{id}:
 *   delete:
 *     summary: Delete contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract deleted successfully
 *       404:
 *         description: Contract not found
 */
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteContract);

export default router;
