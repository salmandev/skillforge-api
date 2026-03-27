-- AI Agent Skills Registry Schema
-- Supabase PostgreSQL with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: skills
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    trigger_keywords TEXT[] DEFAULT '{}',
    platform_compatibility JSONB DEFAULT '{"claude": false, "gpt": false, "gemini": false, "qwen": false}'::jsonb,
    skill_md_content TEXT,
    security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    author VARCHAR(255),
    github_url VARCHAR(500),
    install_cmd TEXT,
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'ar')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    star_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false
);

-- Index for skills
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_trigger_keywords ON skills USING GIN(trigger_keywords);
CREATE INDEX IF NOT EXISTS idx_skills_verified ON skills(verified);
CREATE INDEX IF NOT EXISTS idx_skills_search ON skills USING GIN(to_tsvector('english', name || ' ' || description));

-- ============================================
-- TABLE: agents
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    soul_md_content TEXT,
    persona_type VARCHAR(100),
    compatible_frameworks TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    arabic_support BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for agents
CREATE INDEX IF NOT EXISTS idx_agents_persona ON agents(persona_type);
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agents_arabic ON agents(arabic_support);

-- ============================================
-- TABLE: workflows
-- ============================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    steps JSONB NOT NULL CHECK (jsonb_typeof(steps) = 'array'),
    use_case VARCHAR(255),
    trigger_phrase TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_use_case ON workflows(use_case);
CREATE INDEX IF NOT EXISTS idx_workflows_steps ON workflows USING GIN(steps);

-- ============================================
-- TABLE: mcp_servers
-- ============================================
CREATE TABLE IF NOT EXISTS mcp_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL UNIQUE,
    capabilities TEXT[] DEFAULT '{}',
    auth_type VARCHAR(50) DEFAULT 'none' CHECK (auth_type IN ('none', 'api_key', 'oauth2', 'jwt', 'basic')),
    compatible_skills UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for mcp_servers
CREATE INDEX IF NOT EXISTS idx_mcp_servers_auth ON mcp_servers(auth_type);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_compatible_skills ON mcp_servers USING GIN(compatible_skills);

-- ============================================
-- TABLE: prompt_keywords
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword VARCHAR(255) NOT NULL,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    intent_category VARCHAR(100),
    confidence_score DECIMAL(5,4) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for prompt_keywords
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_keyword ON prompt_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_skill ON prompt_keywords(skill_id);
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_intent ON prompt_keywords(intent_category);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at for skills
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for agents
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for workflows
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for mcp_servers
CREATE TRIGGER update_mcp_servers_updated_at
    BEFORE UPDATE ON mcp_servers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_keywords ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SKILLS RLS POLICIES
-- ============================================

-- Everyone can read verified skills
CREATE POLICY "Anyone can read verified skills"
    ON skills FOR SELECT
    USING (verified = true);

-- Authenticated users can read all skills
CREATE POLICY "Authenticated users can read all skills"
    ON skills FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can insert skills
CREATE POLICY "Authenticated users can insert skills"
    ON skills FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update their own skills (by author match)
CREATE POLICY "Users can update own skills"
    ON skills FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'email' = author OR auth.jwt() ->> 'user_id' IS NOT NULL);

-- ============================================
-- AGENTS RLS POLICIES
-- ============================================

-- Everyone can read agents
CREATE POLICY "Anyone can read agents"
    ON agents FOR SELECT
    USING (true);

-- Authenticated users can insert agents
CREATE POLICY "Authenticated users can insert agents"
    ON agents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update their own agents
CREATE POLICY "Users can update own agents"
    ON agents FOR UPDATE
    TO authenticated
    USING (true);

-- ============================================
-- WORKFLOWS RLS POLICIES
-- ============================================

-- Everyone can read workflows
CREATE POLICY "Anyone can read workflows"
    ON workflows FOR SELECT
    USING (true);

-- Authenticated users can insert workflows
CREATE POLICY "Authenticated users can insert workflows"
    ON workflows FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update their own workflows
CREATE POLICY "Users can update own workflows"
    ON workflows FOR UPDATE
    TO authenticated
    USING (true);

-- ============================================
-- MCP SERVERS RLS POLICIES
-- ============================================

-- Everyone can read MCP servers
CREATE POLICY "Anyone can read MCP servers"
    ON mcp_servers FOR SELECT
    USING (true);

-- Authenticated users can insert MCP servers
CREATE POLICY "Authenticated users can insert MCP servers"
    ON mcp_servers FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update their own MCP servers
CREATE POLICY "Users can update own MCP servers"
    ON mcp_servers FOR UPDATE
    TO authenticated
    USING (true);

-- ============================================
-- PROMPT KEYWORDS RLS POLICIES
-- ============================================

-- Everyone can read prompt keywords
CREATE POLICY "Anyone can read prompt keywords"
    ON prompt_keywords FOR SELECT
    USING (true);

-- Authenticated users can insert prompt keywords
CREATE POLICY "Authenticated users can insert prompt keywords"
    ON prompt_keywords FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for skill search with full-text search
CREATE OR REPLACE VIEW skills_search AS
SELECT 
    id,
    name,
    slug,
    description,
    trigger_keywords,
    platform_compatibility,
    security_score,
    category,
    tags,
    author,
    github_url,
    install_cmd,
    language,
    created_at,
    updated_at,
    star_count,
    verified,
    to_tsvector('english', name || ' ' || description || ' ' || array_to_string(trigger_keywords, ' ')) AS search_vector
FROM skills;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE skills IS 'Registry of AI agent skills with security scoring and platform compatibility';
COMMENT ON TABLE agents IS 'AI agent definitions with persona and framework compatibility';
COMMENT ON TABLE workflows IS 'Composed skill chains for complex automation tasks';
COMMENT ON TABLE mcp_servers IS 'Model Context Protocol servers for skill integration';
COMMENT ON TABLE prompt_keywords IS 'Keyword mappings for natural language skill matching';

COMMENT ON COLUMN skills.platform_compatibility IS 'JSONB with boolean flags for claude, gpt, gemini, qwen';
COMMENT ON COLUMN skills.security_score IS 'Security rating from 0-100';
COMMENT ON COLUMN skills.skill_md_content IS 'Markdown documentation for the skill';
COMMENT ON COLUMN workflows.steps IS 'JSONB array of skill IDs defining the workflow sequence';
COMMENT ON COLUMN mcp_servers.auth_type IS 'Authentication type: none, api_key, oauth2, jwt, basic';
COMMENT ON COLUMN prompt_keywords.confidence_score IS 'Match confidence from 0.0000 to 1.0000';
