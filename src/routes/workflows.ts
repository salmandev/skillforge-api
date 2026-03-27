import { Router } from 'express';
import * as workflowsController from '../controllers/workflowsController';
import { validate } from '../middleware/validate';
import { createWorkflowSchema, updateWorkflowSchema, workflowsQuerySchema } from '../schemas/index';
import { validateQuery } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimit';

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
