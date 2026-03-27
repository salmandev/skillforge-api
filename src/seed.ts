import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { scanSkillContent } from './lib/securityScanner';
import { slugify } from './lib/slugify';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Seed data: 25 real skills
const skillsData = [
  {
    name: 'Document Generator',
    description: 'Create professional Word documents (.docx) with formatted text, tables, images, and headers. Perfect for reports, contracts, and business documents.',
    category: 'Productivity',
    trigger_keywords: ['create word doc', 'write document', 'make report', 'generate docx', 'create document'],
    platform_claude: true,
    platform_gpt: false,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# Document Generator Skill

## Purpose
Generate professional Microsoft Word documents (.docx) with rich formatting.

## Capabilities
- Create formatted documents with headers, footers, and page numbers
- Insert tables with custom styling
- Add images and charts
- Apply themes and templates
- Generate tables of contents

## Usage
Ask me to create any type of document and I'll generate a properly formatted .docx file.

## Installation
\`\`\`bash
npx agency-agents-cli install docx
\`\`\`

## Security Notes
- No external API calls
- Local file generation only
- No data persistence`,
    tags: ['documents', 'office', 'productivity', 'word', 'docx'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/docx-skill',
    install_cmd: 'npx agency-agents-cli install docx',
    language: 'en' as const,
  },
  {
    name: 'PDF Processor',
    description: 'Create, merge, split, and extract content from PDF files. Full PDF manipulation capabilities for document workflows.',
    category: 'Productivity',
    trigger_keywords: ['create pdf', 'merge pdf', 'extract from pdf', 'split pdf', 'pdf manipulation'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# PDF Processor Skill

## Purpose
Complete PDF manipulation toolkit for document management.

## Capabilities
- Create PDFs from HTML or text
- Merge multiple PDFs into one
- Split PDFs by page ranges
- Extract text and images
- Add watermarks and annotations
- Compress PDFs for sharing

## Usage
Request any PDF operation and I'll handle it efficiently.

## Installation
\`\`\`bash
npx agency-agents-cli install pdf
\`\`\`

## Security Notes
- Processes files locally
- No cloud uploads
- Temporary files auto-deleted`,
    tags: ['pdf', 'documents', 'productivity', 'merge', 'extract'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/pdf-skill',
    install_cmd: 'npx agency-agents-cli install pdf',
    language: 'en' as const,
  },
  {
    name: 'Presentation Builder',
    description: 'Create stunning PowerPoint presentations (.pptx) with slides, animations, charts, and professional layouts.',
    category: 'Productivity',
    trigger_keywords: ['make presentation', 'create slides', 'build deck', 'powerpoint', 'pptx'],
    platform_claude: true,
    platform_gpt: false,
    platform_gemini: true,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# Presentation Builder Skill

## Purpose
Generate professional PowerPoint presentations with visual appeal.

## Capabilities
- Create slide decks from outlines
- Apply professional themes
- Insert charts and graphs
- Add animations and transitions
- Include speaker notes
- Export to PDF format

## Usage
Describe your presentation needs and I'll create a polished deck.

## Installation
\`\`\`bash
npx agency-agents-cli install pptx
\`\`\`

## Security Notes
- Local generation only
- No external dependencies
- Template-based rendering`,
    tags: ['presentations', 'powerpoint', 'slides', 'pptx', 'visual'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/pptx-skill',
    install_cmd: 'npx agency-agents-cli install pptx',
    language: 'en' as const,
  },
  {
    name: 'Spreadsheet Master',
    description: 'Create and manipulate Excel spreadsheets (.xlsx) with formulas, charts, pivot tables, and data validation.',
    category: 'Productivity',
    trigger_keywords: ['create spreadsheet', 'build excel', 'make table', 'xlsx', 'excel formulas'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# Spreadsheet Master Skill

## Purpose
Generate and manipulate Excel spreadsheets with advanced features.

## Capabilities
- Create workbooks with multiple sheets
- Write complex formulas and functions
- Generate pivot tables
- Create charts and graphs
- Apply conditional formatting
- Data validation rules

## Usage
Describe your data needs and I'll build a functional spreadsheet.

## Installation
\`\`\`bash
npx agency-agents-cli install xlsx
\`\`\`

## Security Notes
- Formula validation enabled
- No macro generation
- Safe cell references only`,
    tags: ['excel', 'spreadsheet', 'data', 'xlsx', 'formulas'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/xlsx-skill',
    install_cmd: 'npx agency-agents-cli install xlsx',
    language: 'en' as const,
  },
  {
    name: 'Git Commit Assistant',
    description: 'Generate meaningful commit messages, stage changes intelligently, and manage Git workflows with best practices.',
    category: 'DevOps',
    trigger_keywords: ['commit code', 'write commit message', 'stage changes', 'git workflow', 'version control'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Git Commit Assistant Skill

## Purpose
Streamline Git workflows with intelligent commit management.

## Capabilities
- Analyze diffs and generate commit messages
- Follow conventional commits specification
- Smart file staging by feature
- Branch management suggestions
- PR description generation
- Changelog updates

## Usage
Ask me to prepare commits or review your Git history.

## Installation
\`\`\`bash
npx agency-agents-cli install git-commit
\`\`\`

## Security Notes
- Read-only Git operations
- No remote pushes
- Local repository only`,
    tags: ['git', 'commits', 'devops', 'version-control', 'workflow'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/git-commit-skill',
    install_cmd: 'npx agency-agents-cli install git-commit',
    language: 'en' as const,
  },
  {
    name: 'Docker Compose Generator',
    description: 'Create production-ready Docker Compose configurations for multi-container applications with networking and volumes.',
    category: 'DevOps',
    trigger_keywords: ['containerize app', 'write docker compose', 'deploy with docker', 'docker setup', 'container orchestration'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Docker Compose Generator Skill

## Purpose
Generate production-ready container orchestration configurations.

## Capabilities
- Multi-service compose files
- Network configuration
- Volume management
- Environment variable handling
- Health checks and restart policies
- Resource limits and scaling

## Usage
Describe your application stack and I'll create the compose file.

## Installation
\`\`\`bash
npx agency-agents-cli install docker-compose
\`\`\`

## Security Notes
- No privileged containers by default
- Resource limits enforced
- Security best practices applied`,
    tags: ['docker', 'containers', 'devops', 'deployment', 'orchestration'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/docker-compose-skill',
    install_cmd: 'npx agency-agents-cli install docker-compose',
    language: 'en' as const,
  },
  {
    name: 'GitHub Actions Workflow',
    description: 'Create CI/CD pipelines with GitHub Actions including testing, building, and deployment workflows.',
    category: 'DevOps',
    trigger_keywords: ['create pipeline', 'ci cd setup', 'automate deployment', 'github actions', 'ci workflow'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# GitHub Actions Workflow Skill

## Purpose
Build automated CI/CD pipelines with GitHub Actions.

## Capabilities
- Test automation workflows
- Build and artifact generation
- Deployment to cloud providers
- Matrix testing strategies
- Caching optimization
- Scheduled workflows

## Usage
Describe your CI/CD needs and I'll create the workflow YAML.

## Installation
\`\`\`bash
npx agency-agents-cli install github-actions
\`\`\`

## Security Notes
- No secrets in workflow files
- OIDC authentication recommended
- Minimal permissions principle`,
    tags: ['github', 'ci-cd', 'devops', 'automation', 'deployment'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/github-actions-skill',
    install_cmd: 'npx agency-agents-cli install github-actions',
    language: 'en' as const,
  },
  {
    name: 'Terraform Infrastructure',
    description: 'Generate Infrastructure as Code with Terraform for cloud resources across AWS, Azure, and GCP.',
    category: 'DevOps',
    trigger_keywords: ['provision infrastructure', 'write terraform', 'iac setup', 'cloud resources', 'infrastructure code'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Terraform Infrastructure Skill

## Purpose
Generate Infrastructure as Code for multi-cloud deployments.

## Capabilities
- AWS, Azure, GCP providers
- VPC and networking setup
- Compute resources (EC2, VMs, GCE)
- Database provisioning
- IAM and security groups
- State management

## Usage
Describe your infrastructure needs and I'll write the Terraform code.

## Installation
\`\`\`bash
npx agency-agents-cli install terraform
\`\`\`

## Security Notes
- No hardcoded credentials
- State encryption recommended
- Least privilege IAM policies`,
    tags: ['terraform', 'iac', 'devops', 'cloud', 'infrastructure'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/terraform-skill',
    install_cmd: 'npx agency-agents-cli install terraform',
    language: 'en' as const,
  },
  {
    name: 'Security Audit Tool',
    description: 'Perform automated security audits on codebases, identifying vulnerabilities, misconfigurations, and best practice violations.',
    category: 'Security',
    trigger_keywords: ['audit code security', 'find vulnerabilities', 'pentest review', 'security scan', 'code review security'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Security Audit Tool Skill

## Purpose
Automated security analysis for codebases and configurations.

## Capabilities
- Static code analysis
- Dependency vulnerability scanning
- Configuration security checks
- OWASP Top 10 detection
- Secret detection
- Compliance reporting

## Usage
Request a security audit and I'll analyze your codebase.

## Installation
\`\`\`bash
npx agency-agents-cli install security-audit
\`\`\`

## Security Notes
- Read-only analysis
- No code execution
- Report encryption available`,
    tags: ['security', 'audit', 'vulnerabilities', 'compliance', 'scanning'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/security-audit-skill',
    install_cmd: 'npx agency-agents-cli install security-audit',
    language: 'en' as const,
  },
  {
    name: 'NCA ECC Compliance',
    description: 'Ensure compliance with Saudi NCA Essential Cybersecurity Controls framework for enterprise systems.',
    category: 'Security',
    trigger_keywords: ['nca compliance', 'saudi security', 'ecc framework', 'cybersecurity controls', 'regulatory compliance'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# NCA ECC Compliance Skill

## Purpose
Ensure compliance with Saudi NCA Essential Cybersecurity Controls.

## Capabilities
- ECC requirement mapping
- Gap analysis
- Control implementation guidance
- Documentation templates
- Audit preparation
- Remediation planning

## Usage
Ask for NCA ECC compliance assessment or guidance.

## Installation
\`\`\`bash
npx agency-agents-cli install nca-ecc
\`\`\`

## Security Notes
- Framework guidance only
- No system modifications
- Compliance verification required`,
    tags: ['compliance', 'nca', 'saudi', 'security', 'regulations'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/nca-ecc-skill',
    install_cmd: 'npx agency-agents-cli install nca-ecc',
    language: 'en' as const,
  },
  {
    name: 'SQL Query Builder',
    description: 'Generate complex SQL queries with joins, aggregations, CTEs, and window functions for any database.',
    category: 'Data',
    trigger_keywords: ['write sql', 'query database', 'build query', 'sql join', 'database query'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# SQL Query Builder Skill

## Purpose
Generate optimized SQL queries for any relational database.

## Capabilities
- Complex JOIN operations
- Aggregations and GROUP BY
- Window functions
- CTEs and subqueries
- Query optimization hints
- Dialect-specific syntax (PostgreSQL, MySQL, SQL Server)

## Usage
Describe your data needs and I'll write the SQL query.

## Installation
\`\`\`bash
npx agency-agents-cli install sql-query
\`\`\`

## Security Notes
- Parameterized queries only
- No DROP/DELETE/TRUNCATE
- Read-only by default`,
    tags: ['sql', 'database', 'queries', 'data', 'analytics'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/sql-query-skill',
    install_cmd: 'npx agency-agents-cli install sql-query',
    language: 'en' as const,
  },
  {
    name: 'Data Cleaning Pipeline',
    description: 'Clean and normalize datasets with handling for missing values, duplicates, outliers, and format inconsistencies.',
    category: 'Data',
    trigger_keywords: ['clean dataset', 'fix csv', 'normalize data', 'data preprocessing', 'data transformation'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Data Cleaning Pipeline Skill

## Purpose
Automated data cleaning and preprocessing for analytics.

## Capabilities
- Missing value handling
- Duplicate detection and removal
- Outlier identification
- Format normalization
- Encoding standardization
- Data validation rules

## Usage
Provide your dataset and cleaning requirements.

## Installation
\`\`\`bash
npx agency-agents-cli install data-cleaning
\`\`\`

## Security Notes
- No data persistence
- In-memory processing
- Original data preserved`,
    tags: ['data', 'cleaning', 'preprocessing', 'csv', 'etl'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/data-cleaning-skill',
    install_cmd: 'npx agency-agents-cli install data-cleaning',
    language: 'en' as const,
  },
  {
    name: 'API Design Studio',
    description: 'Design RESTful APIs with OpenAPI/Swagger specifications, including endpoints, schemas, and documentation.',
    category: 'DevOps',
    trigger_keywords: ['design rest api', 'openapi spec', 'swagger docs', 'api specification', 'endpoint design'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# API Design Studio Skill

## Purpose
Create professional REST API specifications with full documentation.

## Capabilities
- OpenAPI 3.0 specification generation
- Endpoint design and documentation
- Schema definitions
- Authentication schemes
- Example requests/responses
- API versioning strategies

## Usage
Describe your API requirements and I'll create the specification.

## Installation
\`\`\`bash
npx agency-agents-cli install api-design
\`\`\`

## Security Notes
- No actual API deployment
- Specification only
- Security best practices included`,
    tags: ['api', 'rest', 'openapi', 'swagger', 'documentation'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/api-design-skill',
    install_cmd: 'npx agency-agents-cli install api-design',
    language: 'en' as const,
  },
  {
    name: 'Test Generator',
    description: 'Automatically generate unit tests, integration tests, and test coverage reports for any codebase.',
    category: 'DevOps',
    trigger_keywords: ['write tests', 'generate unit tests', 'test coverage', 'testing', 'test automation'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Test Generator Skill

## Purpose
Automated test generation for comprehensive code coverage.

## Capabilities
- Unit test generation (Jest, pytest, JUnit)
- Integration test scaffolding
- Mock and fixture creation
- Edge case identification
- Coverage analysis
- Test data generation

## Usage
Provide code and I'll generate comprehensive tests.

## Installation
\`\`\`bash
npx agency-agents-cli install test-generation
\`\`\`

## Security Notes
- No code execution
- Test isolation enforced
- No external service calls`,
    tags: ['testing', 'unit-tests', 'automation', 'coverage', 'qa'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/test-generation-skill',
    install_cmd: 'npx agency-agents-cli install test-generation',
    language: 'en' as const,
  },
  {
    name: 'Code Review Assistant',
    description: 'Perform intelligent code reviews with feedback on quality, performance, security, and best practices.',
    category: 'DevOps',
    trigger_keywords: ['review code', 'check pull request', 'code quality', 'code feedback', 'pr review'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Code Review Assistant Skill

## Purpose
Intelligent code review with actionable feedback.

## Capabilities
- Code quality analysis
- Performance optimization suggestions
- Security vulnerability detection
- Best practice recommendations
- Style guide compliance
- Documentation gaps identification

## Usage
Submit code for review and receive detailed feedback.

## Installation
\`\`\`bash
npx agency-agents-cli install code-review
\`\`\`

## Security Notes
- Read-only analysis
- No code modifications
- Confidential handling`,
    tags: ['code-review', 'quality', 'feedback', 'best-practices', 'analysis'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/code-review-skill',
    install_cmd: 'npx agency-agents-cli install code-review',
    language: 'en' as const,
  },
  {
    name: 'React Component Builder',
    description: 'Generate production-ready React components with TypeScript, hooks, styling, and accessibility support.',
    category: 'AI/ML',
    trigger_keywords: ['build react component', 'create ui component', 'frontend widget', 'react typescript', 'ui development'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# React Component Builder Skill

## Purpose
Generate production-ready React components with modern best practices.

## Capabilities
- TypeScript with proper typing
- React hooks (useState, useEffect, custom)
- Responsive styling (CSS, Tailwind, styled-components)
- Accessibility (ARIA) compliance
- Unit test scaffolding
- Storybook stories

## Usage
Describe your component and I'll generate the code.

## Installation
\`\`\`bash
npx agency-agents-cli install react-component
\`\`\`

## Security Notes
- No external dependencies added
- XSS prevention included
- Safe prop handling`,
    tags: ['react', 'typescript', 'frontend', 'components', 'ui'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/react-component-skill',
    install_cmd: 'npx agency-agents-cli install react-component',
    language: 'en' as const,
  },
  {
    name: 'Supabase RLS Generator',
    description: 'Create Row Level Security policies for Supabase databases with fine-grained access control.',
    category: 'DevOps',
    trigger_keywords: ['row level security', 'supabase policy', 'database rls', 'access control', 'supabase security'],
    platform_claude: true,
    platform_gpt: false,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: true,
    platform_codex: false,
    skill_md_content: `# Supabase RLS Generator Skill

## Purpose
Generate secure Row Level Security policies for Supabase.

## Capabilities
- Policy generation for CRUD operations
- Role-based access patterns
- User ownership checks
- Team/collection access
- Complex policy combinations
- Policy testing queries

## Usage
Describe your access requirements and I'll write the RLS policies.

## Installation
\`\`\`bash
npx agency-agents-cli install supabase-rls
\`\`\`

## Security Notes
- Least privilege by default
- Policy testing included
- Audit trail recommendations`,
    tags: ['supabase', 'rls', 'security', 'database', 'postgresql'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/supabase-rls-skill',
    install_cmd: 'npx agency-agents-cli install supabase-rls',
    language: 'en' as const,
  },
  {
    name: 'Resume Builder',
    description: 'Create professional resumes and CVs with ATS-friendly formatting, tailored for specific job descriptions.',
    category: 'Productivity',
    trigger_keywords: ['write resume', 'build cv', 'create portfolio', 'job application', 'career document'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Resume Builder Skill

## Purpose
Generate ATS-optimized resumes and professional CVs.

## Capabilities
- Multiple template styles
- ATS-friendly formatting
- Job description tailoring
- Skills extraction
- Achievement quantification
- Cover letter generation

## Usage
Provide your experience and target role for a custom resume.

## Installation
\`\`\`bash
npx agency-agents-cli install resume-builder
\`\`\`

## Security Notes
- Local processing only
- No data retention
- PDF export available`,
    tags: ['resume', 'cv', 'career', 'jobs', 'documents'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/resume-builder-skill',
    install_cmd: 'npx agency-agents-cli install resume-builder',
    language: 'en' as const,
  },
  {
    name: 'Arabic Content Creator',
    description: 'Generate high-quality Arabic content with proper RTL formatting, grammar, and cultural context awareness.',
    category: 'Productivity',
    trigger_keywords: ['write arabic', 'rtl content', 'arabic translation', 'arabic text', 'محتوى عربي'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# Arabic Content Creator Skill

## Purpose
Generate professional Arabic content with cultural awareness.

## Capabilities
- Modern Standard Arabic (MSA)
- RTL formatting support
- Cultural context adaptation
- Grammar and spell checking
- Translation assistance
- Regional dialect awareness

## Usage
Request any Arabic content creation or translation.

## Installation
\`\`\`bash
npx agency-agents-cli install arabic-content
\`\`\`

## Security Notes
- Content validation enabled
- No external APIs
- Unicode safe`,
    tags: ['arabic', 'translation', 'rtl', 'content', 'localization'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/arabic-content-skill',
    install_cmd: 'npx agency-agents-cli install arabic-content',
    language: 'ar' as const,
  },
  {
    name: 'Email Drafter',
    description: 'Compose professional emails with appropriate tone, structure, and follow-up suggestions for any business context.',
    category: 'Productivity',
    trigger_keywords: ['write email', 'draft message', 'compose email', 'business correspondence', 'email template'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Email Drafter Skill

## Purpose
Compose professional, effective business emails.

## Capabilities
- Tone adjustment (formal, casual, persuasive)
- Subject line optimization
- Call-to-action inclusion
- Follow-up suggestions
- Email threading
- Template library

## Usage
Describe your email purpose and audience.

## Installation
\`\`\`bash
npx agency-agents-cli install email-drafter
\`\`\`

## Security Notes
- No email sending
- No contact access
- Draft generation only`,
    tags: ['email', 'communication', 'business', 'writing', 'templates'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/email-drafter-skill',
    install_cmd: 'npx agency-agents-cli install email-drafter',
    language: 'en' as const,
  },
  {
    name: 'IAM Policy Designer',
    description: 'Create secure IAM policies for AWS, Azure, and GCP with least privilege access and compliance alignment.',
    category: 'Security',
    trigger_keywords: ['identity access management', 'write iam policy', 'rbac setup', 'access policy', 'permissions'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# IAM Policy Designer Skill

## Purpose
Generate secure, least-privilege IAM policies.

## Capabilities
- AWS IAM policy generation
- Azure RBAC configuration
- GCP IAM bindings
- Service account setup
- Permission boundaries
- Policy validation

## Usage
Describe access requirements for policy generation.

## Installation
\`\`\`bash
npx agency-agents-cli install iam-policy
\`\`\`

## Security Notes
- Least privilege enforced
- No admin policies
- Audit recommendations included`,
    tags: ['iam', 'security', 'aws', 'azure', 'permissions'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/iam-policy-skill',
    install_cmd: 'npx agency-agents-cli install iam-policy',
    language: 'en' as const,
  },
  {
    name: 'Log Analyzer',
    description: 'Parse, analyze, and extract insights from application and server logs with pattern detection and alerting.',
    category: 'DevOps',
    trigger_keywords: ['analyze logs', 'parse log file', 'find errors in logs', 'log investigation', 'debug logs'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Log Analyzer Skill

## Purpose
Intelligent log analysis and anomaly detection.

## Capabilities
- Multi-format log parsing
- Error pattern detection
- Timeline reconstruction
- Anomaly identification
- Alert rule generation
- Dashboard suggestions

## Usage
Provide logs for analysis and insight extraction.

## Installation
\`\`\`bash
npx agency-agents-cli install log-analyzer
\`\`\`

## Security Notes
- No log storage
- In-memory processing
- Sensitive data redaction`,
    tags: ['logs', 'analysis', 'debugging', 'monitoring', 'devops'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/log-analyzer-skill',
    install_cmd: 'npx agency-agents-cli install log-analyzer',
    language: 'en' as const,
  },
  {
    name: 'Prompt Optimizer',
    description: 'Optimize and refine LLM prompts for better responses with techniques like chain-of-thought and few-shot learning.',
    category: 'AI/ML',
    trigger_keywords: ['improve prompt', 'optimize prompt', 'better system prompt', 'prompt engineering', 'llm tuning'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: true,
    platform_qwen: true,
    platform_cursor: true,
    platform_codex: true,
    skill_md_content: `# Prompt Optimizer Skill

## Purpose
Enhance LLM prompts for optimal output quality.

## Capabilities
- Prompt structure analysis
- Chain-of-thought injection
- Few-shot example generation
- Token optimization
- Instruction clarity improvement
- Output format specification

## Usage
Submit your prompt for optimization recommendations.

## Installation
\`\`\`bash
npx agency-agents-cli install prompt-optimizer
\`\`\`

## Security Notes
- No model access required
- Pattern-based optimization
- Platform-agnostic`,
    tags: ['prompt', 'optimization', 'llm', 'ai', 'engineering'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/prompt-optimizer-skill',
    install_cmd: 'npx agency-agents-cli install prompt-optimizer',
    language: 'en' as const,
  },
  {
    name: 'MDCAT Quiz Generator',
    description: 'Generate medical entrance exam questions (MDCAT) with explanations, covering biology, chemistry, and physics.',
    category: 'EdTech',
    trigger_keywords: ['medical quiz', 'mdcat question', 'exam question generator', 'medical entrance', 'practice test'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# MDCAT Quiz Generator Skill

## Purpose
Generate medical entrance exam practice questions.

## Capabilities
- Biology, Chemistry, Physics questions
- Multiple choice format
- Detailed explanations
- Difficulty adjustment
- Topic-specific quizzes
- Performance tracking format

## Usage
Request practice questions for MDCAT preparation.

## Installation
\`\`\`bash
npx agency-agents-cli install mdcat-quiz
\`\`\`

## Security Notes
- Educational content only
- Verified information
- Regular updates`,
    tags: ['education', 'medical', 'quiz', 'mdcat', 'exam'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/mdcat-quiz-skill',
    install_cmd: 'npx agency-agents-cli install mdcat-quiz',
    language: 'en' as const,
  },
  {
    name: 'Physics Simulator',
    description: 'Create interactive physics simulations for mechanics, electromagnetism, and thermodynamics with visual outputs.',
    category: 'EdTech',
    trigger_keywords: ['physics problem', 'simulate physics', 'physics visualization', 'mechanics simulation', 'physics education'],
    platform_claude: true,
    platform_gpt: true,
    platform_gemini: false,
    platform_qwen: false,
    platform_cursor: false,
    platform_codex: false,
    skill_md_content: `# Physics Simulator Skill

## Purpose
Generate interactive physics simulations for education.

## Capabilities
- Classical mechanics simulations
- Electromagnetism visualizations
- Thermodynamics models
- Wave phenomena
- Interactive parameters
- Graph and chart generation

## Usage
Describe the physics concept for simulation.

## Installation
\`\`\`bash
npx agency-agents-cli install physics-simulator
\`\`\`

## Security Notes
- Educational use only
- Approximation disclaimers
- No real-world applications`,
    tags: ['physics', 'simulation', 'education', 'science', 'visualization'],
    author: 'SkillForge Team',
    github_url: 'https://github.com/skillforge/physics-simulator-skill',
    install_cmd: 'npx agency-agents-cli install physics-simulator',
    language: 'en' as const,
  },
];

async function seedSkills() {
  console.log('🌱 Starting seed process...\n');

  // Clear existing data (optional - comment out to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await supabase.from('prompt_keywords').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('stars').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('mcp_servers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('workflows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('agents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('📝 Inserting 25 skills...\n');

  for (const skill of skillsData) {
    // Generate slug
    const slug = slugify(skill.name);

    // Perform security scan
    const scanResult = scanSkillContent(skill.skill_md_content || '');

    // Create skill record
    const skillData = {
      name: skill.name,
      slug,
      description: skill.description,
      category: skill.category,
      trigger_keywords: skill.trigger_keywords,
      platform_claude: skill.platform_claude,
      platform_gpt: skill.platform_gpt,
      platform_gemini: skill.platform_gemini,
      platform_qwen: skill.platform_qwen,
      platform_cursor: skill.platform_cursor,
      platform_codex: skill.platform_codex,
      skill_md_content: skill.skill_md_content,
      tags: skill.tags,
      author_name: skill.author,
      github_url: skill.github_url,
      install_cmd: skill.install_cmd,
      language: skill.language,
      security_score: scanResult.score,
      security_flags: scanResult.flags,
      verified: true,
      star_count: Math.floor(Math.random() * 100),
      download_count: 0,
      version: '1.0.0',
    };

    const { data, error } = await supabase.from('skills').insert([skillData]).select().single();

    if (error) {
      console.error(`❌ Error inserting "${skill.name}":`, error.message);
      continue;
    }

    console.log(`✅ Inserted: ${skill.name} (Security Score: ${scanResult.score})`);

    // Create prompt keywords for this skill
    const keywordInserts = skill.trigger_keywords.map(async (keyword: string) => {
      const { error } = await supabase.from('prompt_keywords').insert([{
        keyword,
        normalized_keyword: keyword.toLowerCase().trim(),
        skill_id: data.id,
        intent_category: 'execute',
        confidence_score: 0.9,
      }]);

      if (error) {
        console.error(`  ⚠️  Could not insert keyword "${keyword}":`, error.message);
      }
    });

    await Promise.all(keywordInserts);
    console.log(`  🏷️  Added ${skill.trigger_keywords.length} prompt keywords\n`);
  }

  // Seed agents
  console.log('🤖 Seeding agents...\n');

  const agentsData = [
    {
      name: 'Research Assistant',
      description: 'Intelligent research assistant for academic and technical research tasks.',
      soul_md_content: `# Research Assistant Persona

You are a meticulous research assistant with expertise in academic research, literature review, and data analysis.

## Traits
- Thorough and detail-oriented
- Critical thinking focused
- Source verification priority
- Clear citation practices

## Capabilities
- Literature search and review
- Data analysis and visualization
- Research methodology guidance
- Academic writing assistance`,
      persona_type: 'assistant' as const,
      compatible_frameworks: ['langchain', 'autogen'],
      tags: ['research', 'academic', 'analysis', 'writing'],
      arabic_support: true,
      author_name: 'SkillForge Team',
    },
    {
      name: 'Code Architect',
      description: 'Senior software architect for system design and code review.',
      soul_md_content: `# Code Architect Persona

You are a seasoned software architect with 15+ years of experience in system design.

## Traits
- Pattern-focused thinking
- Scalability priority
- Security-first mindset
- Clean code advocate

## Capabilities
- System architecture design
- Code review and refactoring
- Technology selection
- Performance optimization`,
      persona_type: 'specialist' as const,
      compatible_frameworks: ['crewai', 'agency-agents'],
      tags: ['architecture', 'code', 'design', 'review'],
      arabic_support: false,
      author_name: 'SkillForge Team',
    },
    {
      name: 'DevOps Engineer',
      description: 'Automation-focused DevOps engineer for CI/CD and infrastructure.',
      soul_md_content: `# DevOps Engineer Persona

You are a DevOps engineer passionate about automation and reliability.

## Traits
- Automation-first mindset
- Reliability focused
- Security conscious
- Documentation advocate

## Capabilities
- CI/CD pipeline design
- Infrastructure as code
- Monitoring and alerting
- Incident response`,
      persona_type: 'specialist' as const,
      compatible_frameworks: ['langchain', 'crewai'],
      tags: ['devops', 'automation', 'ci-cd', 'infrastructure'],
      arabic_support: false,
      author_name: 'SkillForge Team',
    },
  ];

  for (const agent of agentsData) {
    const slug = slugify(agent.name);

    const agentData = {
      name: agent.name,
      slug,
      description: agent.description,
      soul_md_content: agent.soul_md_content,
      persona_type: agent.persona_type,
      compatible_frameworks: agent.compatible_frameworks,
      tags: agent.tags,
      arabic_support: agent.arabic_support,
      author_name: agent.author_name,
      verified: true,
      star_count: Math.floor(Math.random() * 50),
    };

    const { error } = await supabase.from('agents').insert([agentData]);

    if (error) {
      console.error(`❌ Error inserting agent "${agent.name}":`, error.message);
    } else {
      console.log(`✅ Inserted agent: ${agent.name}`);
    }
  }

  // Seed workflows
  console.log('\n🔄 Seeding workflows...\n');

  // Get some skill IDs for workflow steps
  const { data: skills } = await supabase.from('skills').select('id').limit(3);
  const skillIds = skills?.map(s => s.id) || [];

  if (skillIds.length >= 2) {
    const workflowsData = [
      {
        name: 'Document Processing Pipeline',
        description: 'End-to-end document creation workflow from data to formatted output.',
        steps: [
          { order: 1, skill_id: skillIds[0], description: 'Clean and normalize input data' },
          { order: 2, skill_id: skillIds[1] || skillIds[0], description: 'Generate formatted document' },
        ],
        use_case: 'Automated report generation',
        trigger_phrase: 'generate a report from data',
        tags: ['documents', 'automation', 'reports'],
        author_name: 'SkillForge Team',
        verified: true,
      },
      {
        name: 'Code Review Workflow',
        description: 'Comprehensive code review with security audit and test generation.',
        steps: [
          { order: 1, skill_id: skillIds[0], description: 'Review code quality' },
          { order: 2, skill_id: skillIds[1] || skillIds[0], description: 'Run security audit' },
        ],
        use_case: 'Pull request review automation',
        trigger_phrase: 'review this pull request',
        tags: ['code-review', 'security', 'testing'],
        author_name: 'SkillForge Team',
        verified: true,
      },
    ];

    for (const workflow of workflowsData) {
      const slug = slugify(workflow.name);

      const workflowData = {
        name: workflow.name,
        slug,
        description: workflow.description,
        use_case: workflow.use_case,
        trigger_phrase: workflow.trigger_phrase,
        steps: workflow.steps,
        tags: workflow.tags,
        author_name: workflow.author_name,
        verified: workflow.verified,
        star_count: Math.floor(Math.random() * 30),
      };

      const { error } = await supabase.from('workflows').insert([workflowData]);

      if (error) {
        console.error(`❌ Error inserting workflow "${workflow.name}":`, error.message);
      } else {
        console.log(`✅ Inserted workflow: ${workflow.name}`);
      }
    }
  }

  // Seed MCP servers
  console.log('\n🔌 Seeding MCP servers...\n');

  const mcpServersData = [
    {
      name: 'Filesystem Server',
      description: 'Local filesystem access for reading and writing files.',
      server_url: 'file://localhost',
      capabilities: ['read', 'write', 'list', 'search'],
      auth_type: 'none' as const,
      tags: ['filesystem', 'local', 'files'],
      author_name: 'SkillForge Team',
      verified: true,
    },
    {
      name: 'Database Server',
      description: 'PostgreSQL database connectivity for queries and data operations.',
      server_url: 'postgresql://localhost:5432',
      capabilities: ['query', 'insert', 'update', 'delete'],
      auth_type: 'apikey' as const,
      tags: ['database', 'postgresql', 'sql'],
      author_name: 'SkillForge Team',
      verified: true,
    },
    {
      name: 'GitHub Server',
      description: 'GitHub API integration for repository management.',
      server_url: 'https://api.github.com',
      capabilities: ['repos', 'issues', 'pull-requests', 'actions'],
      auth_type: 'oauth' as const,
      tags: ['github', 'git', 'repositories'],
      author_name: 'SkillForge Team',
      verified: true,
    },
  ];

  for (const server of mcpServersData) {
    const slug = slugify(server.name);

    const serverData = {
      name: server.name,
      slug,
      description: server.description,
      server_url: server.server_url,
      capabilities: server.capabilities,
      auth_type: server.auth_type,
      tags: server.tags,
      author_name: server.author_name,
      verified: server.verified,
      star_count: Math.floor(Math.random() * 20),
    };

    const { error } = await supabase.from('mcp_servers').insert([serverData]);

    if (error) {
      console.error(`❌ Error inserting MCP server "${server.name}":`, error.message);
    } else {
      console.log(`✅ Inserted MCP server: ${server.name}`);
    }
  }

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   - 25 skills with prompt keywords');
  console.log('   - 3 agents');
  console.log('   - 2 workflows');
  console.log('   - 3 MCP servers');
  console.log('\n🚀 Run the API server with: npm run dev\n');
}

seedSkills().catch(console.error);
