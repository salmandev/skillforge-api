import { Router } from 'express';
import * as workflowsController from '../controllers/workflowsController.js';
import { validate } from '../middleware/validate.js';
import { createWorkflowSchema, updateWorkflowSchema, workflowsQuerySchema } from '../schemas/index.js';
import { validateQuery } from '../middleware/validate.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = Router();

// GET /api/workflows - List workflows
router.get('/', validateQuery(workflowsQuerySchema), workflowsController.getWorkflows);

// GET /api/workflows/:slug - Get single workflow with populated steps
router.get('/:slug', workflowsController.getWorkflowBySlug);

// POST /api/workflows - Create new workflow
router.post('/', rateLimiter, validate(createWorkflowSchema), workflowsController.createWorkflow);

// PUT /api/workflows/:slug - Update workflow
router.put('/:slug', validate(updateWorkflowSchema), workflowsController.updateWorkflow);

// DELETE /api/workflows/:slug - Delete workflow
router.delete('/:slug', workflowsController.deleteWorkflow);

// POST /api/workflows/:slug/star - Star workflow
router.post('/:slug/star', workflowsController.starWorkflow);

export default router;
