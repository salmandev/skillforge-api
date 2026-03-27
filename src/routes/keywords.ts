import { Router } from 'express';
import * as keywordsController from '../controllers/keywordsController.js';
import { validate } from '../middleware/validate.js';
import { createPromptKeywordSchema } from '../schemas/index.js';

const router = Router();

// GET /api/keywords/match - Find skills by prompt phrase
router.get('/match', keywordsController.matchKeywords);

// GET /api/keywords - List prompt keywords
router.get('/', keywordsController.getPromptKeywords);

// POST /api/keywords - Create prompt keyword
router.post('/', validate(createPromptKeywordSchema), keywordsController.createPromptKeyword);

export default router;
