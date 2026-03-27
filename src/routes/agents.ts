import { Router } from 'express';
import * as agentsController from '../controllers/agentsController';
import { validate } from '../middleware/validate';
import { createAgentSchema, updateAgentSchema, agentsQuerySchema } from '../schemas/index';
import { validateQuery } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();

// GET /api/agents - List agents with filtering
router.get('/', validateQuery(agentsQuerySchema), agentsController.getAgents);

// GET /api/agents/:slug - Get single agent
router.get('/:slug', agentsController.getAgentBySlug);

// POST /api/agents - Create new agent
router.post('/', rateLimiter, validate(createAgentSchema), agentsController.createAgent);

// PUT /api/agents/:slug - Update agent
router.put('/:slug', validate(updateAgentSchema), agentsController.updateAgent);

// POST /api/agents/:slug/star - Star agent
router.post('/:slug/star', agentsController.starAgent);

export default router;
