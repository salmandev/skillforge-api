-- SkillForge API - Initial Schema Migration
-- PostgreSQL with Supabase (Auth + RLS + Storage)
-- Run this file in your Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TABLE: skills
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    skill_md_content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    trigger_keywords TEXT[] DEFAULT '{}',
    install_cmd TEXT,
    github_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    platform_claude BOOLEAN DEFAULT false,
    platform_gpt BOOLEAN DEFAULT false,
    platform_gemini BOOLEAN DEFAULT false,
    platform_qwen BOOLEAN DEFAULT false,
    platform_cursor BOOLEAN DEFAULT false,
    platform_codex BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar', 'both')),
    security_score INTEGER DEFAULT -1 CHECK (security_score >= -1 AND security_score <= 100),
    security_flags JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT false,
    star_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: agents
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    soul_md_content TEXT NOT NULL,
    persona_type TEXT NOT NULL,
    compatible_frameworks TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    arabic_support BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    verified BOOLEAN DEFAULT false,
    star_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: workflows
-- ============================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    use_case TEXT NOT NULL,
    trigger_phrase TEXT,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    verified BOOLEAN DEFAULT false,
    star_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: mcp_servers
-- ============================================
CREATE TABLE IF NOT EXISTS mcp_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    server_url TEXT NOT NULL,
    capabilities TEXT[] DEFAULT '{}',
    auth_type TEXT DEFAULT 'none' CHECK (auth_type IN ('none', 'apikey', 'oauth', 'bearer')),
    compatible_skill_ids UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    author_name TEXT,
    verified BOOLEAN DEFAULT false,
    star_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: prompt_keywords
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    normalized_keyword TEXT NOT NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    intent_category TEXT,
    confidence_score FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: stars
-- ============================================
CREATE TABLE IF NOT EXISTS stars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('skill', 'agent', 'workflow', 'mcp_server')),
    resource_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, resource_type, resource_id)
);

-- ============================================
-- INDEXES: skills
-- ============================================
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_verified ON skills(verified);
CREATE INDEX IF NOT EXISTS idx_skills_language ON skills(language);
CREATE INDEX IF NOT EXISTS idx_skills_security_score ON skills(security_score);
CREATE INDEX IF NOT EXISTS idx_skills_author_id ON skills(author_id);

-- GIN indexes for arrays
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_trigger_keywords ON skills USING GIN(trigger_keywords);
CREATE INDEX IF NOT EXISTS idx_skills_security_flags ON skills USING GIN(security_flags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_skills_search_fts ON skills USING GIN(
    to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' '))
);

-- Trigram index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm ON skills USING GIN(name gin_trgm_ops);

-- ============================================
-- INDEXES: agents
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_persona_type ON agents(persona_type);
CREATE INDEX IF NOT EXISTS idx_agents_arabic_support ON agents(arabic_support);
CREATE INDEX IF NOT EXISTS idx_agents_verified ON agents(verified);
CREATE INDEX IF NOT EXISTS idx_agents_author_id ON agents(author_id);

-- GIN indexes for arrays
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agents_compatible_frameworks ON agents USING GIN(compatible_frameworks);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_agents_search_fts ON agents USING GIN(
    to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' '))
);

-- Trigram index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_agents_name_trgm ON agents USING GIN(name gin_trgm_ops);

-- ============================================
-- INDEXES: workflows
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workflows_slug ON workflows(slug);
CREATE INDEX IF NOT EXISTS idx_workflows_use_case ON workflows(use_case);
CREATE INDEX IF NOT EXISTS idx_workflows_verified ON workflows(verified);
CREATE INDEX IF NOT EXISTS idx_workflows_author_id ON workflows(author_id);

-- GIN indexes for arrays
CREATE INDEX IF NOT EXISTS idx_workflows_tags ON workflows USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_workflows_steps ON workflows USING GIN(steps);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_workflows_search_fts ON workflows USING GIN(
    to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' '))
);

-- Trigram index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_workflows_name_trgm ON workflows USING GIN(name gin_trgm_ops);

-- ============================================
-- INDEXES: mcp_servers
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mcp_servers_slug ON mcp_servers(slug);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_auth_type ON mcp_servers(auth_type);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_verified ON mcp_servers(verified);

-- GIN indexes for arrays
CREATE INDEX IF NOT EXISTS idx_mcp_servers_tags ON mcp_servers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_capabilities ON mcp_servers USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_compatible_skill_ids ON mcp_servers USING GIN(compatible_skill_ids);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_mcp_servers_search_fts ON mcp_servers USING GIN(
    to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' '))
);

-- Trigram index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_mcp_servers_name_trgm ON mcp_servers USING GIN(name gin_trgm_ops);

-- ============================================
-- INDEXES: prompt_keywords
-- ============================================
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_keyword ON prompt_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_normalized ON prompt_keywords(normalized_keyword);
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_skill_id ON prompt_keywords(skill_id);
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_agent_id ON prompt_keywords(agent_id);
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_intent_category ON prompt_keywords(intent_category);

-- Trigram index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_prompt_keywords_keyword_trgm ON prompt_keywords USING GIN(normalized_keyword gin_trgm_ops);

-- ============================================
-- INDEXES: stars
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stars_user_id ON stars(user_id);
CREATE INDEX IF NOT EXISTS idx_stars_resource ON stars(resource_type, resource_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(
            TRIM(input_name),
            '[^a-zA-Z0-9\s-]',
            '',
            'g'
        ),
        '[\s_-]+',
        '-',
        'g'
    ));
END;
$$ LANGUAGE plpgsql;

-- Function to increment star count
CREATE OR REPLACE FUNCTION increment_star_count(
    p_resource_type TEXT,
    p_resource_id UUID
) RETURNS VOID AS $$
DECLARE
    table_name TEXT;
BEGIN
    IF p_resource_type = 'skill' THEN
        table_name := 'skills';
    ELSIF p_resource_type = 'agent' THEN
        table_name := 'agents';
    ELSIF p_resource_type = 'workflow' THEN
        table_name := 'workflows';
    ELSIF p_resource_type = 'mcp_server' THEN
        table_name := 'mcp_servers';
    ELSE
        RAISE EXCEPTION 'Invalid resource type: %', p_resource_type;
    END IF;

    EXECUTE format(
        'UPDATE %I SET star_count = star_count + 1 WHERE id = $1',
        table_name
    ) USING p_resource_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement star count
CREATE OR REPLACE FUNCTION decrement_star_count(
    p_resource_type TEXT,
    p_resource_id UUID
) RETURNS VOID AS $$
DECLARE
    table_name TEXT;
BEGIN
    IF p_resource_type = 'skill' THEN
        table_name := 'skills';
    ELSIF p_resource_type = 'agent' THEN
        table_name := 'agents';
    ELSIF p_resource_type = 'workflow' THEN
        table_name := 'workflows';
    ELSIF p_resource_type = 'mcp_server' THEN
        table_name := 'mcp_servers';
    ELSE
        RAISE EXCEPTION 'Invalid resource type: %', p_resource_type;
    END IF;

    EXECUTE format(
        'UPDATE %I SET star_count = GREATEST(0, star_count - 1) WHERE id = $1',
        table_name
    ) USING p_resource_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(
    p_skill_id UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE skills SET download_count = download_count + 1 WHERE id = p_skill_id;
END;
$$ LANGUAGE plpgsql;

-- Function for keyword matching with pg_trgm similarity
CREATE OR REPLACE FUNCTION match_keywords(
    search_query TEXT,
    similarity_threshold FLOAT DEFAULT 0.3,
    result_limit INTEGER DEFAULT 5
) RETURNS TABLE (
    id UUID,
    keyword TEXT,
    normalized_keyword TEXT,
    skill_id UUID,
    agent_id UUID,
    intent_category TEXT,
    confidence_score FLOAT,
    similarity FLOAT,
    skill_name TEXT,
    skill_slug TEXT,
    skill_description TEXT,
    skill_category TEXT,
    skill_tags TEXT[],
    skill_platform_compatibility JSONB,
    skill_verified BOOLEAN,
    agent_name TEXT,
    agent_slug TEXT,
    agent_description TEXT,
    agent_persona_type TEXT,
    agent_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pk.id,
        pk.keyword,
        pk.normalized_keyword,
        pk.skill_id,
        pk.agent_id,
        pk.intent_category,
        pk.confidence_score,
        similarity(pk.normalized_keyword, LOWER(TRIM(search_query))) AS similarity,
        s.name AS skill_name,
        s.slug AS skill_slug,
        s.description AS skill_description,
        s.category AS skill_category,
        s.tags AS skill_tags,
        jsonb_build_object(
            'claude', s.platform_claude,
            'gpt', s.platform_gpt,
            'gemini', s.platform_gemini,
            'qwen', s.platform_qwen,
            'cursor', s.platform_cursor,
            'codex', s.platform_codex
        ) AS skill_platform_compatibility,
        s.verified AS skill_verified,
        a.name AS agent_name,
        a.slug AS agent_slug,
        a.description AS agent_description,
        a.persona_type AS agent_persona_type,
        a.verified AS agent_verified
    FROM prompt_keywords pk
    LEFT JOIN skills s ON pk.skill_id = s.id
    LEFT JOIN agents a ON pk.agent_id = a.id
    WHERE similarity(pk.normalized_keyword, LOWER(TRIM(search_query))) >= similarity_threshold
    ORDER BY similarity DESC, pk.confidence_score DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at for all tables
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SKILLS RLS POLICIES
-- ============================================

-- Public read access for verified skills
CREATE POLICY "public_read_verified_skills"
    ON skills FOR SELECT
    USING (verified = true);

-- Authenticated users can read all skills
CREATE POLICY "authenticated_read_skills"
    ON skills FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can insert skills
CREATE POLICY "authenticated_insert_skills"
    ON skills FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can update their own skills
CREATE POLICY "authors_update_own_skills"
    ON skills FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can delete their own skills
CREATE POLICY "authors_delete_own_skills"
    ON skills FOR DELETE
    TO authenticated
    USING (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- Service role can update verified status
CREATE POLICY "service_role_update_verified"
    ON skills FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- AGENTS RLS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "public_read_agents"
    ON agents FOR SELECT
    USING (true);

-- Authenticated users can insert agents
CREATE POLICY "authenticated_insert_agents"
    ON agents FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can update their own agents
CREATE POLICY "authors_update_own_agents"
    ON agents FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can delete their own agents
CREATE POLICY "authors_delete_own_agents"
    ON agents FOR DELETE
    TO authenticated
    USING (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- ============================================
-- WORKFLOWS RLS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "public_read_workflows"
    ON workflows FOR SELECT
    USING (true);

-- Authenticated users can insert workflows
CREATE POLICY "authenticated_insert_workflows"
    ON workflows FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can update their own workflows
CREATE POLICY "authors_update_own_workflows"
    ON workflows FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can delete their own workflows
CREATE POLICY "authors_delete_own_workflows"
    ON workflows FOR DELETE
    TO authenticated
    USING (
        author_id = auth.uid() OR 
        auth.jwt() ->> 'email' = author_name
    );

-- ============================================
-- MCP SERVERS RLS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "public_read_mcp_servers"
    ON mcp_servers FOR SELECT
    USING (true);

-- Authenticated users can insert MCP servers
CREATE POLICY "authenticated_insert_mcp_servers"
    ON mcp_servers FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can update their own MCP servers
CREATE POLICY "authors_update_own_mcp_servers"
    ON mcp_servers FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = author_name
    );

-- Authors can delete their own MCP servers
CREATE POLICY "authors_delete_own_mcp_servers"
    ON mcp_servers FOR DELETE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = author_name
    );

-- ============================================
-- PROMPT KEYWORDS RLS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "public_read_prompt_keywords"
    ON prompt_keywords FOR SELECT
    USING (true);

-- Authenticated users can insert prompt keywords
CREATE POLICY "authenticated_insert_prompt_keywords"
    ON prompt_keywords FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- STARS RLS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "public_read_stars"
    ON stars FOR SELECT
    USING (true);

-- Authenticated users can insert their own stars
CREATE POLICY "authenticated_insert_stars"
    ON stars FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own stars
CREATE POLICY "users_delete_own_stars"
    ON stars FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE skills IS 'Registry of AI agent skills with security scoring and platform compatibility';
COMMENT ON TABLE agents IS 'AI agent personas with soul.md templates and framework compatibility';
COMMENT ON TABLE workflows IS 'Composed skill chains for complex automation tasks';
COMMENT ON TABLE mcp_servers IS 'Model Context Protocol servers for skill integration';
COMMENT ON TABLE prompt_keywords IS 'Keyword mappings for natural language skill/agent matching';
COMMENT ON TABLE stars IS 'User stars/favorites for resources';

COMMENT ON COLUMN skills.skill_md_content IS 'Raw SKILL.md file content';
COMMENT ON COLUMN skills.security_score IS 'Security rating: -1=unscanned, 0-100=score';
COMMENT ON COLUMN skills.security_flags IS 'Array of {severity, type, description} objects';
COMMENT ON COLUMN skills.platform_claude IS 'Compatible with Claude/Anthropic';
COMMENT ON COLUMN skills.platform_gpt IS 'Compatible with ChatGPT/OpenAI';
COMMENT ON COLUMN skills.platform_gemini IS 'Compatible with Google Gemini';
COMMENT ON COLUMN skills.platform_qwen IS 'Compatible with Alibaba Qwen';
COMMENT ON COLUMN skills.platform_cursor IS 'Compatible with Cursor IDE';
COMMENT ON COLUMN skills.platform_codex IS 'Compatible with GitHub Copilot/Codex';

COMMENT ON COLUMN agents.soul_md_content IS 'Raw SOUL.md / persona template content';
COMMENT ON COLUMN agents.persona_type IS 'Type: assistant | specialist | orchestrator | critic | creative';

COMMENT ON COLUMN workflows.steps IS 'Array of {order, skill_id, agent_id, input_map, output_map, description}';

COMMENT ON COLUMN mcp_servers.server_url IS 'Base URL for the MCP server';
COMMENT ON COLUMN mcp_servers.auth_type IS 'Authentication: none | apikey | oauth | bearer';

COMMENT ON COLUMN prompt_keywords.normalized_keyword IS 'Lowercase, trimmed keyword for matching';
COMMENT ON COLUMN prompt_keywords.intent_category IS 'Intent: create | analyze | convert | search | deploy | review | other';
