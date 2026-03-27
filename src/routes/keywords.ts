import { Router } from 'express';
import * as keywordsController from '../controllers/keywordsController';
import { validate } from '../middleware/validate';
import { createPromptKeywordSchema } from '../schemas/index';

const router = Router();

// GET /api/keywords/match - Find skills by prompt phrase
router.get('/match', keywordsController.matchKeywords);

// GET /api/keywords - List prompt keywords
router.get('/', keywordsController.getPromptKeywords);

// POST /api/keywords - Create prompt keyword
router.post('/', validate(createPromptKeywordSchema), keywordsController.createPromptKeyword);

export default router;
