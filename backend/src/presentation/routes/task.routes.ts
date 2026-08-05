import { Router } from 'express';
import * as taskHandler from '../handlers/task.handler';
import { validate } from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/task.validator';

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: List all tasks
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, done]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 nextCursor:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', validate(taskQuerySchema, 'query'), taskHandler.list);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or manager role
 *       500:
 *         description: Internal server error
 */
router.post('/', authorize('admin', 'manager'), validate(createTaskSchema), taskHandler.create);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', taskHandler.getById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
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
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or manager role
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authorize('admin', 'manager'), validate(updateTaskSchema), taskHandler.update);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or manager role
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authorize('admin', 'manager'), taskHandler.remove);

export default router;
