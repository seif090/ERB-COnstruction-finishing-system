import { Router } from 'express';
import {
  getUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitStats,
} from '../controllers/unit.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /units/stats:
 *   get:
 *     summary: Get unit statistics
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unit statistics retrieved
 */
router.get('/stats', getUnitStats);

/**
 * @swagger
 * /units:
 *   get:
 *     summary: Get all units with pagination
 *     tags: [Units]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, SOLD, RENTED, RESERVED]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Units retrieved successfully
 */
router.get('/', getUnits);

/**
 * @swagger
 * /units/{id}:
 *   get:
 *     summary: Get unit by ID
 *     tags: [Units]
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
 *         description: Unit retrieved successfully
 *       404:
 *         description: Unit not found
 */
router.get('/:id', getUnitById);

/**
 * @swagger
 * /units:
 *   post:
 *     summary: Create a new unit
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, status, price, area]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, VILLA, COMMERCIAL, LAND, OFFICE, PENTHOUSE]
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, SOLD, RENTED, RESERVED]
 *               furnishingStatus:
 *                 type: string
 *                 enum: [FURNISHED, SEMI_FURNISHED, UNFURNISHED]
 *               price:
 *                 type: number
 *               rentPrice:
 *                 type: number
 *               area:
 *                 type: number
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               floor:
 *                 type: integer
 *               buildingName:
 *                 type: string
 *               location:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               yearBuilt:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Unit created successfully
 */
router.post('/', createUnit);

/**
 * @swagger
 * /units/{id}:
 *   put:
 *     summary: Update unit
 *     tags: [Units]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *               price:
 *                 type: number
 *               area:
 *                 type: number
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               features:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *       404:
 *         description: Unit not found
 */
router.put('/:id', updateUnit);

/**
 * @swagger
 * /units/{id}:
 *   delete:
 *     summary: Delete unit
 *     tags: [Units]
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
 *         description: Unit deleted successfully
 *       404:
 *         description: Unit not found
 */
router.delete('/:id', authorize('ADMIN'), deleteUnit);

export default router;
