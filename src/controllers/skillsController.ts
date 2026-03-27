import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { scanSkillContent } from '../lib/securityScanner';
import { generateUniqueSlug } from '../lib/slugify';
import { calculatePagination, parsePaginationParams } from '../lib/pagination';
import { checkPlatformCompatibility } from '../lib/platformChecker';
import { CreateSkillInput, CompatibilityCheckResponse, PlatformCompatibilityCheck } from '../types/index';
import { AuthRequest } from '../middleware/auth';

export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, platform, category, verified, language, sort, order, page, limit } = req.query;
    const { page: pageNum, limit: limitNum } = parsePaginationParams(req.query);

    let query = supabase.from('skills').select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category as string);
    }

    if (verified !== undefined) {
      query = query.eq('verified', verified === 'true');
    }

    if (language) {
      query = query.eq('language', language as string);
    }

    if (platform) {
      const platformField = `platform_${platform as string}`;
      query = query.eq(platformField, true);
    }

    // Apply sorting
    const sortField = sort as string || 'created_at';
    const ascending = order === 'asc';
    query = query.order(sortField, { ascending });

    // Apply pagination
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data: data || [],
      pagination: calculatePagination(pageNum, limitNum, count || 0),
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch skills' } });
  }
};

export const getSkillBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Skill not found' } });
        return;
      }
      throw error;
    }

    // Increment download count
    await supabase.rpc('increment_download_count', { p_skill_id: data.id });

    res.json({ data });
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch skill' } });
  }
};

export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const skillData: CreateSkillInput = req.body;
    const authReq = req as AuthRequest;

    // Generate slug
    const slug = await generateUniqueSlug(skillData.name, async (s) => {
      const { data } = await supabase.from('skills').select('id').eq('slug', s).single();
      return !!data;
    });

    // Auto-scan content
    const scanResult = scanSkillContent(skillData.skill_md_content);

    // Build platform flags
    const platformData = {
      platform_claude: skillData.platform_claude ?? false,
      platform_gpt: skillData.platform_gpt ?? false,
      platform_gemini: skillData.platform_gemini ?? false,
      platform_qwen: skillData.platform_qwen ?? false,
      platform_cursor: skillData.platform_cursor ?? false,
      platform_codex: skillData.platform_codex ?? false,
    };

    const newSkill = {
      name: skillData.name,
      slug,
      description: skillData.description,
      skill_md_content: skillData.skill_md_content,
      category: skillData.category,
      tags: skillData.tags || [],
      trigger_keywords: skillData.trigger_keywords || [],
      install_cmd: skillData.install_cmd || null,
      github_url: skillData.github_url || null,
      author_id: authReq.user?.id || skillData.author_id || null,
      author_name: authReq.user?.email || skillData.author_name || null,
      ...platformData,
      language: skillData.language || 'en',
      security_score: scanResult.score,
      security_flags: scanResult.flags,
      verified: skillData.verified ?? false,
      star_count: 0,
      download_count: 0,
      version: '1.0.0',
    };

    const { data, error } = await supabase
      .from('skills')
      .insert([newSkill])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: { code: 'CREATE_ERROR', message: 'Failed to create skill' } });
  }
};

export const updateSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const updateData = req.body;
    const authReq = req as AuthRequest;

    // Remove immutable fields
    delete updateData.slug;
    delete updateData.created_at;
    delete updateData.id;

    // Re-scan if content changed
    if (updateData.skill_md_content) {
      const scanResult = scanSkillContent(updateData.skill_md_content);
      updateData.security_score = scanResult.score;
      updateData.security_flags = scanResult.flags;
    }

    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Skill not found' } });
        return;
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: { code: 'UPDATE_ERROR', message: 'Failed to update skill' } });
  }
};

export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('slug', slug);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: { code: 'DELETE_ERROR', message: 'Failed to delete skill' } });
  }
};

export const scanSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // Fetch skill content
    const { data: skill, error: fetchError } = await supabase
      .from('skills')
      .select('id, skill_md_content')
      .eq('slug', slug)
      .single();

    if (fetchError || !skill) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Skill not found' } });
      return;
    }

    // Perform security scan
    const scanResult = scanSkillContent(skill.skill_md_content || '');

    // Update skill with scan results
    const { data, error } = await supabase
      .from('skills')
      .update({
        security_score: scanResult.score,
        security_flags: scanResult.flags,
      })
      .eq('id', skill.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    console.error('Error scanning skill:', error);
    res.status(500).json({ error: { code: 'SCAN_ERROR', message: 'Failed to scan skill' } });
  }
};

export const starSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const authReq = req as AuthRequest;

    // Get skill
    const { data: skill, error: fetchError } = await supabase
      .from('skills')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !skill) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Skill not found' } });
      return;
    }

    // Check if user already starred
    const userId = authReq.user?.id;
    if (userId) {
      const { data: existingStar } = await supabase
        .from('stars')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_type', 'skill')
        .eq('resource_id', skill.id)
        .single();

      if (existingStar) {
        // Remove star
        await supabase.from('stars').delete().eq('id', existingStar.id);
        await supabase.rpc('decrement_star_count', { p_resource_type: 'skill', p_resource_id: skill.id });
      } else {
        // Add star
        await supabase.from('stars').insert([{
          user_id: userId,
          resource_type: 'skill',
          resource_id: skill.id,
        }]);
        await supabase.rpc('increment_star_count', { p_resource_type: 'skill', p_resource_id: skill.id });
      }
    }

    // Return updated skill
    const { data: updatedSkill } = await supabase
      .from('skills')
      .select('*')
      .eq('slug', slug)
      .single();

    res.json({ data: updatedSkill });
  } catch (error) {
    console.error('Error starring skill:', error);
    res.status(500).json({ error: { code: 'STAR_ERROR', message: 'Failed to star skill' } });
  }
};

export const getRelatedSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // Get the skill's tags
    const { data: skill, error: fetchError } = await supabase
      .from('skills')
      .select('id, tags, category')
      .eq('slug', slug)
      .single();

    if (fetchError || !skill) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Skill not found' } });
      return;
    }

    // Find related skills by tag overlap or same category
    let query = supabase
      .from('skills')
      .select('*')
      .neq('id', skill.id)
      .limit(5);

    if (skill.tags && skill.tags.length > 0) {
      const tagFilter = `{${skill.tags.join(',')}}`;
      query = query.or(`tags.@>.${tagFilter},category.eq.${skill.category}`);
    } else if (skill.category) {
      query = query.eq('category', skill.category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching related skills:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch related skills' } });
  }
};

export const checkCompatibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skill_md_content, platforms = ['claude', 'gpt', 'gemini', 'qwen', 'cursor', 'codex'] } = req.body;

    if (!skill_md_content) {
      res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'skill_md_content is required' } });
      return;
    }

    const compatibility = checkPlatformCompatibility(skill_md_content, platforms);
    
    const platformChecks = platforms.map((platform: string) => {
      const isCompatible = compatibility[platform] || false;
      const indicators: string[] = [];
      
      const normalizedContent = skill_md_content.toLowerCase();
      
      if (platform === 'claude' && /claude|anthropic/gi.test(normalizedContent)) {
        indicators.push('Mentions Claude/Anthropic');
      }
      if (platform === 'gpt' && /gpt|chatgpt|openai/gi.test(normalizedContent)) {
        indicators.push('Mentions GPT/OpenAI');
      }
      if (platform === 'gemini' && /gemini|google ai|bard/gi.test(normalizedContent)) {
        indicators.push('Mentions Gemini/Google AI');
      }
      if (platform === 'qwen' && /qwen|alibaba|tongyi/gi.test(normalizedContent)) {
        indicators.push('Mentions Qwen/Alibaba');
      }
      if (platform === 'cursor' && /cursor/gi.test(normalizedContent)) {
        indicators.push('Mentions Cursor IDE');
      }
      if (platform === 'codex' && /codex|github copilot/gi.test(normalizedContent)) {
        indicators.push('Mentions Codex/GitHub Copilot');
      }

      return {
        platform,
        compatible: isCompatible,
        indicators,
        score: isCompatible ? (indicators.length * 25) : 0,
      };
    });

    const overallScore = platformChecks.reduce((sum: number, p: PlatformCompatibilityCheck) => sum + p.score, 0) / platformChecks.length;
    
    const recommendations: string[] = [];
    if (overallScore < 50) {
      recommendations.push('Consider adding platform-specific instructions for better compatibility');
    }
    if (!platformChecks.some((p: PlatformCompatibilityCheck) => p.compatible)) {
      recommendations.push('No platform indicators detected. Add platform mentions to improve discoverability.');
    }

    const response: CompatibilityCheckResponse = {
      overall_score: Math.round(overallScore),
      platforms: platformChecks,
      recommendations,
    };

    res.json({ data: response });
  } catch (error) {
    console.error('Error checking compatibility:', error);
    res.status(500).json({ error: { code: 'COMPATIBILITY_ERROR', message: 'Failed to check platform compatibility' } });
  }
};
