import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get counts for all resource types
    const [skillsCount, agentsCount, workflowsCount, mcpServersCount, keywordsCount] = await Promise.all([
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('agents').select('*', { count: 'exact', head: true }),
      supabase.from('workflows').select('*', { count: 'exact', head: true }),
      supabase.from('mcp_servers').select('*', { count: 'exact', head: true }),
      supabase.from('prompt_keywords').select('*', { count: 'exact', head: true }),
    ]);

    // Get verified count
    const verifiedResult = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);

    // Get language distribution
    const languagesResult = await supabase
      .from('skills')
      .select('language')
      .neq('language', null);

    const languageCounts: Record<string, number> = { en: 0, ar: 0, both: 0 };
    (languagesResult.data || []).forEach((skill: { language: string }) => {
      const lang = skill.language as string;
      if (lang === 'en') languageCounts.en++;
      else if (lang === 'ar') languageCounts.ar++;
      else if (lang === 'both') languageCounts.both++;
    });

    // Get platform distribution
    const platformResult = await supabase
      .from('skills')
      .select('platform_claude, platform_gpt, platform_gemini, platform_qwen, platform_cursor, platform_codex');

    const platformCounts: Record<string, number> = {
      claude: 0,
      gpt: 0,
      gemini: 0,
      qwen: 0,
      cursor: 0,
      codex: 0,
    };

    (platformResult.data || []).forEach((skill: Record<string, boolean>) => {
      if (skill.platform_claude) platformCounts.claude++;
      if (skill.platform_gpt) platformCounts.gpt++;
      if (skill.platform_gemini) platformCounts.gemini++;
      if (skill.platform_qwen) platformCounts.qwen++;
      if (skill.platform_cursor) platformCounts.cursor++;
      if (skill.platform_codex) platformCounts.codex++;
    });

    // Get category distribution
    const categoryResult = await supabase.from('skills').select('category');
    const categoryCounts: Record<string, number> = {};
    (categoryResult.data || []).forEach((skill: { category: string }) => {
      if (skill.category) {
        categoryCounts[skill.category] = (categoryCounts[skill.category] || 0) + 1;
      }
    });

    // Get recent skills
    const recentSkills = await supabase
      .from('skills')
      .select('id, name, slug, category, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const stats = {
      total_skills: skillsCount.count || 0,
      total_agents: agentsCount.count || 0,
      total_workflows: workflowsCount.count || 0,
      total_mcp_servers: mcpServersCount.count || 0,
      total_keywords: keywordsCount.count || 0,
      verified_count: verifiedResult.count || 0,
      languages: languageCounts,
      platforms: platformCounts,
      categories: categoryCounts,
      recent_skills: recentSkills.data || [],
      last_updated: new Date().toISOString(),
    };

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch statistics' } });
  }
};

export const getCategoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    const skillsResult = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);

    const verifiedResult = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .eq('verified', true);

    const avgSecurityResult = await supabase
      .from('skills')
      .select('security_score')
      .eq('category', category)
      .gte('security_score', 0);

    const avgScore = avgSecurityResult.data && avgSecurityResult.data.length > 0
      ? Math.round(avgSecurityResult.data.reduce((sum, s) => sum + (s.security_score || 0), 0) / avgSecurityResult.data.length)
      : 0;

    res.json({
      data: {
        category,
        total_skills: skillsResult.count || 0,
        verified_skills: verifiedResult.count || 0,
        average_security_score: avgScore,
      },
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch category statistics' } });
  }
};
