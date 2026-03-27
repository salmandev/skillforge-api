import { Router } from 'express';
import * as mcpServersController from '../controllers/mcpServersController';
import { validate } from '../middleware/validate';
import { createMCPServerSchema, updateMCPServerSchema, mcpServersQuerySchema } from '../schemas/index';
import { validateQuery } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();

// GET /api/mcp-servers - List MCP servers
router.get('/', validateQuery(mcpServersQuerySchema), mcpServersController.getMCPServers);

// GET /api/mcp-servers/:slug - Get single MCP server
router.get('/:slug', mcpServersController.getMCPServerBySlug);

// POST /api/mcp-servers - Create new MCP server
router.post('/', rateLimiter, validate(createMCPServerSchema), mcpServersController.createMCPServer);

// PUT /api/mcp-servers/:slug - Update MCP server
router.put('/:slug', validate(updateMCPServerSchema), mcpServersController.updateMCPServer);

// DELETE /api/mcp-servers/:slug - Delete MCP server
router.delete('/:slug', mcpServersController.deleteMCPServer);

// POST /api/mcp-servers/:slug/star - Star MCP server
router.post('/:slug/star', mcpServersController.starMCPServer);

export default router;
