import { Router } from 'express';
import * as skillsController from '../controllers/skillsController';
import { validate } from '../middleware/validate';
import { createSkillSchema, updateSkillSchema, skillsQuerySchema, checkCompatibilitySchema } from '../schemas/index';
import { validateQuery } from '../middleware/validate';
import { rateLimiter, strictRateLimiter } from '../middleware/rateLimit';

const router = Router();

// GET /api/skills - List skills with filtering and pagination
router.get('/', validateQuery(skillsQuerySchema), skillsController.getSkills);

// GET /api/skills/:slug - Get single skill by slug
router.get('/:slug', skillsController.getSkillBySlug);

// POST /api/skills - Create new skill
router.post('/', rateLimiter, validate(createSkillSchema), skillsController.createSkill);

// PUT /api/skills/:slug - Update skill
router.put('/:slug', validate(updateSkillSchema), skillsController.updateSkill);

// DELETE /api/skills/:slug - Delete skill
router.delete('/:slug', skillsController.deleteSkill);

// POST /api/skills/:slug/scan - Trigger security scan
router.post('/:slug/scan', strictRateLimiter, skillsController.scanSkill);

// POST /api/skills/:slug/star - Star/unstar skill
router.post('/:slug/star', skillsController.starSkill);

// GET /api/skills/:slug/related - Get related skills
router.get('/:slug/related', skillsController.getRelatedSkills);

// POST /api/skills/check-compatibility - Check platform compatibility
router.post('/check-compatibility', validate(checkCompatibilitySchema), skillsController.checkCompatibility);

export default router;
