# SkillForge API

**The Universal AI Agent Skills Registry** — "npm for AI skills"

A verified, searchable, security-scored registry for SKILL.md files, agent personas, MCP servers, and composed workflows.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Seeding Data](#seeding-data)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Security Scanning](#security-scanning)
- [Platform Compatibility](#platform-compatibility)
- [Examples](#examples)

---

## Features

- **Skills Registry**: Submit, discover, and manage AI agent skills (SKILL.md files)
- **Agent Personas**: Register AI agent definitions with SOUL.md templates
- **Workflows**: Create composed skill chains for complex automation
- **MCP Servers**: List and discover Model Context Protocol servers
- **Keyword Matching**: Fuzzy search using pg_trgm for natural language skill discovery
- **Security Scanning**: Automatic static analysis with severity scoring
- **Platform Compatibility**: Track compatibility with Claude, GPT, Gemini, Qwen, Cursor, and Codex
- **Star/Favorite System**: User-based starring with proper tracking
- **Full-Text Search**: Advanced search across all resources
- **RLS Policies**: Row-level security for multi-tenant access

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express.js |
| Database | Supabase (PostgreSQL + Auth + RLS + Storage) |
| Search | Supabase full-text search + pg_trgm |
| Validation | Zod |
| Rate Limiting | express-rate-limit |

---

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Supabase Account** ([Sign Up](https://supabase.com/))
- **npm** or **yarn**

---

## Installation

```bash
# Clone the repository
git clone https://github.com/salmandev/skillforge-api.git
cd skillforge-api

# Install dependencies
npm install
```

---

## Database Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Wait for the project to initialize

### 2. Run the Migration

1. Navigate to the **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL script

This creates:
- All tables (skills, agents, workflows, mcp_servers, prompt_keywords, stars)
- Indexes (GIN, full-text search, pg_trgm)
- Functions (security scanning helpers, star counting)
- RLS policies
- Triggers for auto-updating timestamps

### 3. Get Your Credentials

In Supabase dashboard:
- Go to **Settings** → **API**
- Copy:
  - `Project URL` → `SUPABASE_URL`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
  - `anon` public key → `SUPABASE_ANON_KEY`

---

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Running the Server

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The API will be available at `http://localhost:3000`

---

## Seeding Data

Populate the database with 25 sample skills, agents, workflows, and MCP servers:

```bash
npm run seed
```

This creates:
- 25 skills across multiple categories (Productivity, DevOps, Security, Data, AI/ML, EdTech)
- 3 agent personas
- 2 workflows
- 3 MCP servers
- Associated prompt keywords for each skill

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/skills` | List skills with filtering |
| GET | `/skills/:slug` | Get skill by slug |
| POST | `/skills` | Create new skill |
| PUT | `/skills/:slug` | Update skill |
| DELETE | `/skills/:slug` | Delete skill |
| POST | `/skills/:slug/scan` | Trigger security scan |
| POST | `/skills/:slug/star` | Star/unstar skill |
| GET | `/skills/:slug/related` | Get related skills |
| POST | `/skills/check-compatibility` | Check platform compatibility |

#### Query Parameters for GET /skills

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in name and description |
| category | string | Filter by category |
| platform | string | Filter by platform (claude, gpt, gemini, qwen, cursor, codex) |
| language | string | Filter by language (en, ar, both) |
| verified | boolean | Filter verified skills only |
| sort | string | Sort field (created_at, updated_at, star_count, security_score, name) |
| order | string | Sort order (asc, desc) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

#### Example: Create Skill

```bash
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "JSON Formatter",
    "description": "Format and validate JSON with syntax highlighting",
    "skill_md_content": "# JSON Formatter Skill\n\nFormats JSON...",
    "category": "Productivity",
    "tags": ["json", "formatting", "validation"],
    "trigger_keywords": ["format json", "validate json", "pretty print"],
    "platform_claude": true,
    "platform_gpt": true,
    "language": "en"
  }'
```

#### Example: Search Skills

```bash
curl "http://localhost:3000/api/skills?search=pdf&category=Productivity&platform=claude&limit=10"
```

---

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agents` | List agents |
| GET | `/agents/:slug` | Get agent by slug |
| POST | `/agents` | Create new agent |
| PUT | `/agents/:slug` | Update agent |
| POST | `/agents/:slug/star` | Star agent |

#### Query Parameters for GET /agents

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in name and description |
| persona_type | string | Filter by persona type |
| framework | string | Filter by framework |
| arabic_support | boolean | Filter by Arabic support |
| page | number | Page number |
| limit | number | Items per page |

#### Example: Create Agent

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Code Reviewer",
    "description": "Expert code reviewer with security focus",
    "soul_md_content": "# Code Reviewer Persona\n\nYou are a senior developer...",
    "persona_type": "specialist",
    "compatible_frameworks": ["langchain", "crewai"],
    "tags": ["code-review", "security", "quality"],
    "arabic_support": false
  }'
```

---

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows` | List workflows |
| GET | `/workflows/:slug` | Get workflow with populated steps |
| POST | `/workflows` | Create new workflow |
| PUT | `/workflows/:slug` | Update workflow |
| DELETE | `/workflows/:slug` | Delete workflow |
| POST | `/workflows/:slug/star` | Star workflow |

#### Example: Create Workflow

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Document Processing Pipeline",
    "description": "End-to-end document creation from data",
    "use_case": "Automated report generation",
    "trigger_phrase": "generate a report from this data",
    "steps": [
      {
        "order": 1,
        "skill_id": "uuid-of-data-cleaning-skill",
        "description": "Clean and normalize input data"
      },
      {
        "order": 2,
        "skill_id": "uuid-of-docx-skill",
        "description": "Generate formatted Word document"
      }
    ],
    "tags": ["documents", "automation", "reports"]
  }'
```

---

### MCP Servers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mcp-servers` | List MCP servers |
| GET | `/mcp-servers/:slug` | Get MCP server |
| POST | `/mcp-servers` | Create new MCP server |
| PUT | `/mcp-servers/:slug` | Update MCP server |
| DELETE | `/mcp-servers/:slug` | Delete MCP server |
| POST | `/mcp-servers/:slug/star` | Star MCP server |

#### Query Parameters for GET /mcp-servers

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in name and description |
| auth_type | string | Filter by auth type (none, apikey, oauth, bearer) |
| capabilities | string | Comma-separated capabilities |
| page | number | Page number |
| limit | number | Items per page |

---

### Keywords

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/keywords/match?q=<phrase>` | Match skills/agents by natural language |
| GET | `/keywords` | List prompt keywords |
| POST | `/keywords` | Create prompt keyword |

#### Example: Keyword Matching

```bash
curl "http://localhost:3000/api/keywords/match?q=create%20word%20document&threshold=0.3&limit=5"
```

Returns top 5 matched skills/agents with confidence scores using pg_trgm similarity.

---

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get registry statistics |
| GET | `/stats/category/:category` | Get stats for specific category |

#### Example Response

```json
{
  "data": {
    "total_skills": 25,
    "total_agents": 3,
    "total_workflows": 2,
    "total_mcp_servers": 3,
    "total_keywords": 125,
    "verified_count": 25,
    "languages": {
      "en": 23,
      "ar": 1,
      "both": 1
    },
    "platforms": {
      "claude": 20,
      "gpt": 18,
      "gemini": 12,
      "qwen": 10,
      "cursor": 8,
      "codex": 6
    },
    "categories": {
      "Productivity": 8,
      "DevOps": 10,
      "Security": 3,
      "Data": 2,
      "AI/ML": 2
    },
    "recent_skills": [...],
    "last_updated": "2026-03-27T12:00:00.000Z"
  }
}
```

---

## Authentication

### JWT-Based Auth

The API uses Supabase Auth for authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Endpoints

- **POST** `/skills` - Create skill (requires auth)
- **PUT** `/skills/:slug` - Update skill (author only)
- **DELETE** `/skills/:slug` - Delete skill (author only)
- **POST** `/skills/:slug/star` - Star skill (requires auth)
- **POST** `/agents` - Create agent (requires auth)
- **POST** `/workflows` - Create workflow (requires auth)
- **POST** `/mcp-servers` - Create MCP server (requires auth)

### Public Endpoints

All **GET** endpoints are public - no authentication required to browse the registry.

---

## Security Scanning

Every skill submission is automatically scanned for security issues.

### Severity Levels

| Severity | Score Deduction | Examples |
|----------|----------------|----------|
| **Critical** | -30 | Prompt injection, data exfiltration, destructive commands |
| **High** | -15 | Obfuscated content, unicode overrides, excessive permissions |
| **Medium** | -5 | Hardcoded credentials, external URLs with params |

### Score Calculation

```
base = 100
score = max(0, base + sum_of_deductions)
```

- **Score 85-100**: Safe
- **Score 50-84**: Review recommended
- **Score 0-49**: High risk, manual review required
- **Score -1**: Not yet scanned

### Detected Patterns

**Critical:**
- `ignore previous instructions`
- `disregard your`
- `forget your system prompt`
- `you are now` (persona override)
- `send to http` (data exfiltration)
- `sudo`, `rm -rf`, `drop table`

**High:**
- Base64 encoded strings (40+ chars)
- Unicode direction overrides
- `full access`, `unrestricted`, `bypass all`

**Medium:**
- Hardcoded credentials patterns
- External URLs with query parameters

---

## Platform Compatibility

Skills can be compatible with multiple AI platforms:

| Platform | Field | Detection |
|----------|-------|-----------|
| Claude | `platform_claude` | Mentions of "Claude", "Anthropic" |
| GPT | `platform_gpt` | Mentions of "GPT", "ChatGPT", "OpenAI" |
| Gemini | `platform_gemini` | Mentions of "Gemini", "Google AI", "Bard" |
| Qwen | `platform_qwen` | Mentions of "Qwen", "Alibaba", "Tongyi" |
| Cursor | `platform_cursor` | Mentions of "Cursor IDE" |
| Codex | `platform_codex` | Mentions of "Codex", "GitHub Copilot" |

### Check Compatibility Endpoint

Analyze skill content for platform-specific syntax:

```bash
curl -X POST http://localhost:3000/api/skills/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "skill_md_content": "# Claude Skill\n\nThis works great with Claude...",
    "platforms": ["claude", "gpt", "gemini"]
  }'
```

Response:

```json
{
  "data": {
    "overall_score": 33,
    "platforms": [
      {
        "platform": "claude",
        "compatible": true,
        "indicators": ["Mentions Claude/Anthropic"],
        "score": 25
      },
      {
        "platform": "gpt",
        "compatible": false,
        "indicators": [],
        "score": 0
      },
      {
        "platform": "gemini",
        "compatible": false,
        "indicators": [],
        "score": 0
      }
    ],
    "recommendations": [
      "Consider adding platform-specific instructions for better compatibility"
    ]
  }
}
```

---

## Examples

### Complete Workflow: Submit a Skill

```bash
# 1. Create a new skill
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "CSV Analyzer",
    "description": "Analyze CSV files with statistics and insights",
    "skill_md_content": "# CSV Analyzer\n\nAnalyzes CSV files...",
    "category": "Data",
    "tags": ["csv", "data", "analysis"],
    "trigger_keywords": ["analyze csv", "csv statistics", "csv insights"],
    "platform_claude": true,
    "platform_gpt": true,
    "language": "en"
  }'

# 2. Get the skill by slug
curl http://localhost:3000/api/skills/csv-analyzer

# 3. Star the skill
curl -X POST http://localhost:3000/api/skills/csv-analyzer/star \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get related skills
curl http://localhost:3000/api/skills/csv-analyzer/related

# 5. Check compatibility
curl -X POST http://localhost:3000/api/skills/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "skill_md_content": "# CSV Analyzer\n\nWorks with Claude...",
    "platforms": ["claude", "gpt"]
  }'
```

### Search with Filters

```bash
# Find verified DevOps skills for Claude
curl "http://localhost:3000/api/skills?category=DevOps&platform=claude&verified=true"

# Find Arabic content skills
curl "http://localhost:3000/api/skills?language=ar"

# Search by keyword
curl "http://localhost:3000/api/skills?search=security"

# Get page 2 with 10 items
curl "http://localhost:3000/api/skills?page=2&limit=10"
```

### Keyword Matching

```bash
# Find skills for "create a word document"
curl "http://localhost:3000/api/keywords/match?q=create%20a%20word%20document"

# Find skills for "deploy to production"
curl "http://localhost:3000/api/keywords/match?q=deploy%20to%20production&threshold=0.4"
```

---

## Response Format

### List Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Single Item Response

```json
{
  "data": {
    "id": "uuid",
    "name": "Skill Name",
    ...
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [...]
  }
}
```

---

## Categories

Supported skill categories:

- **DevOps** - CI/CD, infrastructure, containers
- **EdTech** - Educational content, quizzes, simulations
- **Security** - Auditing, compliance, IAM
- **Finance** - Financial analysis, reporting
- **Productivity** - Documents, emails, scheduling
- **IAM** - Identity and access management
- **AI/ML** - Prompt engineering, model optimization
- **Data** - SQL, ETL, cleaning, analysis
- **Other** - Miscellaneous skills

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Support

- **Issues**: [GitHub Issues](https://github.com/salmandev/skillforge-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/salmandev/skillforge-api/discussions)

---

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for the AI Agent Community**
