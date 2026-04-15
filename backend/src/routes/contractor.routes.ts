import { Router } from 'express';
import {
  getContractors,
  getContractorById,
  createContractor,
  updateContractor,
  deleteContractor,
  assignContractorToProject,
  reviewContractor,
  getContractorStats,
} from '../controllers/contractor.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /contractors/stats:
 *   get:
 *     summary: Get contractor statistics
 *     tags: [Contractors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contractor statistics retrieved
 */
router.get('/stats', getContractorStats);

/**
 * @swagger
 * /contractors:
 *   get:
 *     summary: Get all contractors with pagination
 *     tags: [Contractors]
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
 *         name: specialty
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Contractors retrieved successfully
 */
router.get('/', getContractors);

/**
 * @swagger
 * /contractors/{id}:
 *   get:
 *     summary: Get contractor by ID
 *     tags: [Contractors]
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
 *         description: Contractor retrieved successfully
 *       404:
 *         description: Contractor not found
 */
router.get('/:id', getContractorById);

/**
 * @swagger
 * /contractors:
 *   post:
 *     summary: Create a new contractor
 *     tags: [Contractors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               altPhone:
 *                 type: string
 *               specialty:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceYears:
 *                 type: integer
 *               idNumber:
 *                 type: string
 *               dailyRate:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contractor created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createContractor);

/**
 * @swagger
 * /contractors/{id}:
 *   put:
 *     summary: Update contractor
 *     tags: [Contractors]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               altPhone:
 *                 type: string
 *               specialty:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceYears:
 *                 type: integer
 *               dailyRate:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contractor updated successfully
 *       404:
 *         description: Contractor not found
 */
router.put('/:id', updateContractor);

/**
 * @swagger
 * /contractors/{id}:
 *   delete:
 *     summary: Delete contractor
 *     tags: [Contractors]
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
 *         description: Contractor deleted successfully
 *       404:
 *         description: Contractor not found
 */
router.delete('/:id', authorize('ADMIN'), deleteContractor);

/**
 * @swagger
 * /contractors/{id}/assign:
 *   post:
 *     summary: Assign contractor to project
 *     tags: [Contractors]
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
 *             required: [projectId]
 *             properties:
 *               projectId:
 *                 type: string
 *               role:
 *                 type: string
 *               hourlyRate:
 *                 type: number
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contractor assigned to project successfully
 *       400:
 *         description: Contractor already assigned to this project
 *       404:
 *         description: Contractor or project not found
 */
router.post('/:id/assign', assignContractorToProject);

/**
 * @swagger
 * /contractors/{id}/reviews:
 *   post:
 *     summary: Review contractor
 *     tags: [Contractors]
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
 *             required: [rating]
 *             properties:
 *               projectId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Invalid rating
 *       404:
 *         description: Contractor not found
 */
router.post('/:id/reviews', reviewContractor);

export default router;
