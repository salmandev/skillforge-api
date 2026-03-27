import { z } from 'zod';

// ============================================
// Platform Compatibility Schema
// ============================================

export const platformCompatibilitySchema = z.object({
  claude: z.boolean().default(false),
  gpt: z.boolean().default(false),
  gemini: z.boolean().default(false),
  qwen: z.boolean().default(false),
  cursor: z.boolean().default(false),
  codex: z.boolean().default(false),
});

// ============================================
// Skills Schemas
// ============================================

export const createSkillSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(10).max(2000),
  skill_md_content: z.string().min(1),
  category: z.enum(['DevOps', 'EdTech', 'Security', 'Finance', 'Productivity', 'IAM', 'AI/ML', 'Data', 'Other']),
  tags: z.array(z.string()).optional().default([]),
  trigger_keywords: z.array(z.string()).optional().default([]),
  install_cmd: z.string().optional().or(z.string().max(0)).nullable(),
  github_url: z.string().url().optional().or(z.string().max(0)).nullable(),
  author_id: z.string().uuid().optional().nullable(),
  author_name: z.string().optional().nullable(),
  platform_claude: z.boolean().optional().default(false),
  platform_gpt: z.boolean().optional().default(false),
  platform_gemini: z.boolean().optional().default(false),
  platform_qwen: z.boolean().optional().default(false),
  platform_cursor: z.boolean().optional().default(false),
  platform_codex: z.boolean().optional().default(false),
  language: z.enum(['en', 'ar', 'both']).optional().default('en'),
  verified: z.boolean().optional().default(false),
});

export const updateSkillSchema = createSkillSchema.partial();

export const skillsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  platform: z.string().optional(),
  language: z.enum(['en', 'ar', 'both']).optional(),
  verified: z.string().transform(v => v === 'true').optional(),
  sort: z.enum(['created_at', 'updated_at', 'star_count', 'security_score', 'name', 'download_count']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const checkCompatibilitySchema = z.object({
  skill_md_content: z.string().min(1),
  platforms: z.array(z.string()).optional().default(['claude', 'gpt', 'gemini', 'qwen', 'cursor', 'codex']),
});

// ============================================
// Agents Schemas
// ============================================

export const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(10).max(2000),
  soul_md_content: z.string().min(1),
  persona_type: z.enum(['assistant', 'specialist', 'orchestrator', 'critic', 'creative']),
  compatible_frameworks: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  arabic_support: z.boolean().optional().default(false),
  author_id: z.string().uuid().optional().nullable(),
  author_name: z.string().optional().nullable(),
  verified: z.boolean().optional().default(false),
});

export const updateAgentSchema = createAgentSchema.partial();

export const agentsQuerySchema = z.object({
  search: z.string().optional(),
  persona_type: z.string().optional(),
  framework: z.string().optional(),
  arabic_support: z.string().transform(v => v === 'true').optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// ============================================
// Workflows Schemas
// ============================================

export const workflowStepSchema = z.object({
  order: z.number().optional().default(1),
  skill_id: z.string().uuid().optional().nullable(),
  agent_id: z.string().uuid().optional().nullable(),
  input_map: z.record(z.string(), z.string()).optional().nullable(),
  output_map: z.record(z.string(), z.string()).optional().nullable(),
  description: z.string().optional().default(''),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(10).max(2000),
  use_case: z.string().min(1).max(500),
  trigger_phrase: z.string().optional().nullable(),
  steps: z.array(workflowStepSchema).min(1),
  tags: z.array(z.string()).optional().default([]),
  author_id: z.string().uuid().optional().nullable(),
  author_name: z.string().optional().nullable(),
  verified: z.boolean().optional().default(false),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

export const workflowsQuerySchema = z.object({
  search: z.string().optional(),
  use_case: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// ============================================
// MCP Servers Schemas
// ============================================

export const createMCPServerSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(10).max(2000),
  server_url: z.string().url(),
  capabilities: z.array(z.string()).optional().default([]),
  auth_type: z.enum(['none', 'apikey', 'oauth', 'bearer']).optional().default('none'),
  compatible_skill_ids: z.array(z.string().uuid()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  author_name: z.string().optional().nullable(),
  verified: z.boolean().optional().default(false),
});

export const updateMCPServerSchema = createMCPServerSchema.partial();

export const mcpServersQuerySchema = z.object({
  search: z.string().optional(),
  auth_type: z.enum(['none', 'apikey', 'oauth', 'bearer']).optional(),
  capabilities: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// ============================================
// Prompt Keywords Schemas
// ============================================

export const createPromptKeywordSchema = z.object({
  keyword: z.string().min(1).max(255),
  skill_id: z.string().uuid().optional().nullable(),
  agent_id: z.string().uuid().optional().nullable(),
  intent_category: z.string().max(100).optional().nullable(),
  confidence_score: z.number().min(0).max(1).optional().default(1.0),
});

export const keywordMatchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  threshold: z.coerce.number().min(0).max(1).optional().default(0.3),
  limit: z.coerce.number().min(1).max(20).optional().default(5),
});

// ============================================
// Stars Schema
// ============================================

export const createStarSchema = z.object({
  resource_type: z.enum(['skill', 'agent', 'workflow', 'mcp_server']),
  resource_id: z.string().uuid(),
});

// ============================================
// Export all schemas in a single object for convenience
// ============================================

export const schemas = {
  createSkill: createSkillSchema,
  updateSkill: updateSkillSchema,
  skillsQuery: skillsQuerySchema,
  checkCompatibility: checkCompatibilitySchema,
  createAgent: createAgentSchema,
  updateAgent: updateAgentSchema,
  agentsQuery: agentsQuerySchema,
  workflowStep: workflowStepSchema,
  createWorkflow: createWorkflowSchema,
  updateWorkflow: updateWorkflowSchema,
  workflowsQuery: workflowsQuerySchema,
  createMCPServer: createMCPServerSchema,
  updateMCPServer: updateMCPServerSchema,
  mcpServersQuery: mcpServersQuerySchema,
  createPromptKeyword: createPromptKeywordSchema,
  keywordMatchQuery: keywordMatchQuerySchema,
  createStar: createStarSchema,
};
