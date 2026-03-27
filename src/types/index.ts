// ============================================
// SkillForge API - Shared Types
// ============================================

export interface SecurityFlag {
  severity: 'critical' | 'high' | 'medium';
  type: string;
  description: string;
}

export interface SecurityScanResult {
  score: number;
  flags: SecurityFlag[];
}

export interface PlatformCompatibility {
  claude: boolean;
  gpt: boolean;
  gemini: boolean;
  qwen: boolean;
  cursor: boolean;
  codex: boolean;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  skill_md_content: string;
  category: string;
  tags: string[];
  trigger_keywords: string[];
  install_cmd: string | null;
  github_url: string | null;
  author_id: string | null;
  author_name: string | null;
  platform_claude: boolean;
  platform_gpt: boolean;
  platform_gemini: boolean;
  platform_qwen: boolean;
  platform_cursor: boolean;
  platform_codex: boolean;
  language: 'en' | 'ar' | 'both';
  security_score: number;
  security_flags: SecurityFlag[];
  verified: boolean;
  star_count: number;
  download_count: number;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string;
  soul_md_content: string;
  persona_type: 'assistant' | 'specialist' | 'orchestrator' | 'critic' | 'creative';
  compatible_frameworks: string[];
  tags: string[];
  arabic_support: boolean;
  author_id: string | null;
  author_name: string | null;
  verified: boolean;
  star_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  order: number;
  skill_id: string | null;
  agent_id: string | null;
  input_map: Record<string, string> | null;
  output_map: Record<string, string> | null;
  description: string;
}

export interface Workflow {
  id: string;
  name: string;
  slug: string;
  description: string;
  use_case: string;
  trigger_phrase: string | null;
  steps: WorkflowStep[];
  tags: string[];
  author_id: string | null;
  author_name: string | null;
  verified: boolean;
  star_count: number;
  created_at: string;
  updated_at: string;
}

export interface MCPServer {
  id: string;
  name: string;
  slug: string;
  description: string;
  server_url: string;
  capabilities: string[];
  auth_type: 'none' | 'apikey' | 'oauth' | 'bearer';
  compatible_skill_ids: string[];
  tags: string[];
  author_name: string | null;
  verified: boolean;
  star_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromptKeyword {
  id: string;
  keyword: string;
  normalized_keyword: string;
  skill_id: string | null;
  agent_id: string | null;
  intent_category: string | null;
  confidence_score: number;
  created_at: string;
}

export interface Star {
  id: string;
  user_id: string;
  resource_type: 'skill' | 'agent' | 'workflow' | 'mcp_server';
  resource_id: string;
  created_at: string;
}

// ============================================
// Create Input Types
// ============================================

export interface CreateSkillInput {
  name: string;
  description: string;
  skill_md_content: string;
  category: string;
  tags?: string[];
  trigger_keywords?: string[];
  install_cmd?: string;
  github_url?: string;
  author_id?: string;
  author_name?: string;
  platform_claude?: boolean;
  platform_gpt?: boolean;
  platform_gemini?: boolean;
  platform_qwen?: boolean;
  platform_cursor?: boolean;
  platform_codex?: boolean;
  language?: 'en' | 'ar' | 'both';
  verified?: boolean;
}

export interface CreateAgentInput {
  name: string;
  description: string;
  soul_md_content: string;
  persona_type: 'assistant' | 'specialist' | 'orchestrator' | 'critic' | 'creative';
  compatible_frameworks?: string[];
  tags?: string[];
  arabic_support?: boolean;
  author_id?: string;
  author_name?: string;
  verified?: boolean;
}

export interface CreateWorkflowInput {
  name: string;
  description: string;
  use_case: string;
  trigger_phrase?: string;
  steps: WorkflowStep[];
  tags?: string[];
  author_id?: string;
  author_name?: string;
  verified?: boolean;
}

export interface CreateMCPServerInput {
  name: string;
  description: string;
  server_url: string;
  capabilities?: string[];
  auth_type?: 'none' | 'apikey' | 'oauth' | 'bearer';
  compatible_skill_ids?: string[];
  tags?: string[];
  author_name?: string;
  verified?: boolean;
}

export interface CreatePromptKeywordInput {
  keyword: string;
  skill_id?: string;
  agent_id?: string;
  intent_category?: string;
  confidence_score?: number;
}

export interface CreateStarInput {
  user_id: string;
  resource_type: 'skill' | 'agent' | 'workflow' | 'mcp_server';
  resource_id: string;
}

// ============================================
// Update Input Types (partial)
// ============================================

export type UpdateSkillInput = Partial<CreateSkillInput>;
export type UpdateAgentInput = Partial<CreateAgentInput>;
export type UpdateWorkflowInput = Partial<CreateWorkflowInput>;
export type UpdateMCPServerInput = Partial<CreateMCPServerInput>;

// ============================================
// API Response Types
// ============================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ListResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface KeywordMatchResult {
  id: string;
  keyword: string;
  normalized_keyword: string;
  skill_id: string | null;
  agent_id: string | null;
  intent_category: string | null;
  confidence_score: number;
  similarity: number;
  skill_name: string | null;
  skill_slug: string | null;
  skill_description: string | null;
  skill_category: string | null;
  skill_tags: string[] | null;
  skill_platform_compatibility: PlatformCompatibility | null;
  skill_verified: boolean | null;
  agent_name: string | null;
  agent_slug: string | null;
  agent_description: string | null;
  agent_persona_type: string | null;
  agent_verified: boolean | null;
}

export interface RegistryStats {
  total_skills: number;
  total_agents: number;
  total_workflows: number;
  total_mcp_servers: number;
  total_keywords: number;
  verified_count: number;
  languages: {
    en: number;
    ar: number;
    both: number;
  };
  platforms: {
    claude: number;
    gpt: number;
    gemini: number;
    qwen: number;
    cursor: number;
    codex: number;
  };
  categories: Record<string, number>;
  recent_skills: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    created_at: string;
  }>;
  last_updated: string;
}

export interface PlatformCompatibilityCheck {
  platform: string;
  compatible: boolean;
  indicators: string[];
  score: number;
}

export interface CompatibilityCheckResponse {
  overall_score: number;
  platforms: PlatformCompatibilityCheck[];
  recommendations: string[];
}
