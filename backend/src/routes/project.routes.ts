import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createProjectStage,
  updateProjectStage,
  deleteProjectStage,
  createTask,
  updateTask,
  getProjectStats,
} from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  createProjectStageSchema,
} from '../validations/project.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Stats route (must be before :id routes)
router.get('/stats', getProjectStats);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects with pagination
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 */
router.get('/', getProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
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
 *         description: Project retrieved successfully
 */
router.get('/:id', getProjectById);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, clientId, budget]
 *             properties:
 *               name:
 *                 type: string
 *               clientId:
 *                 type: string
 *               budget:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [PENDING, PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED]
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post('/', validate(createProjectSchema), createProject);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
router.put('/:id', validate(updateProjectSchema), updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 */
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteProject);

// Stage routes
router.post('/:id/stages', validate(createProjectStageSchema), createProjectStage);
router.put('/:projectId/stages/:stageId', updateProjectStage);
router.delete('/:projectId/stages/:stageId', deleteProjectStage);

// Task routes
router.post('/:id/tasks', createTask);
router.put('/:projectId/tasks/:taskId', updateTask);

export default router;
