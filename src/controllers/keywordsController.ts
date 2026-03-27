import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { CreatePromptKeywordInput, KeywordMatchResult } from '../types/index';

export const matchKeywords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, threshold = 0.3, limit = 5 } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(400).json({ error: { code: 'INVALID_QUERY', message: 'Query parameter "q" is required' } });
      return;
    }

    const searchQuery = q.toLowerCase().trim();
    const similarityThreshold = typeof threshold === 'string' ? parseFloat(threshold) : 0.3;
    const resultLimit = typeof limit === 'string' ? parseInt(limit, 10) : 5;
    const safeLimit = Math.min(Math.max(1, resultLimit), 20);

    // Use pg_trgm similarity via RPC function
    const { data: matches, error } = await supabase.rpc('match_keywords', {
      search_query: searchQuery,
      similarity_threshold: similarityThreshold,
      result_limit: safeLimit,
    });

    if (error) {
      console.error('RPC error:', error);
      // Fallback to simple LIKE match if RPC doesn't exist
      const { data: fallbackData } = await supabase
        .from('prompt_keywords')
        .select(`
          *,
          skills (
            id,
            name,
            slug,
            description,
            category,
            tags,
            platform_claude,
            platform_gpt,
            platform_gemini,
            platform_qwen,
            platform_cursor,
            platform_codex,
            verified
          ),
          agents (
            id,
            name,
            slug,
            description,
            persona_type,
            verified
          )
        `)
        .ilike('normalized_keyword', `%${searchQuery}%`)
        .order('confidence_score', { ascending: false })
        .limit(safeLimit);

      res.json({ data: fallbackData || [] });
      return;
    }

    res.json({ data: matches || [] });
  } catch (error) {
    console.error('Error matching keywords:', error);
    res.status(500).json({ error: { code: 'MATCH_ERROR', message: 'Failed to match keywords' } });
  }
};

export const createPromptKeyword = async (req: Request, res: Response): Promise<void> => {
  try {
    const keywordData: CreatePromptKeywordInput = req.body;

    const normalizedKeyword = keywordData.keyword.toLowerCase().trim();

    const newKeyword = {
      keyword: keywordData.keyword,
      normalized_keyword: normalizedKeyword,
      skill_id: keywordData.skill_id || null,
      agent_id: keywordData.agent_id || null,
      intent_category: keywordData.intent_category || null,
      confidence_score: keywordData.confidence_score ?? 1.0,
    };

    const { data, error } = await supabase
      .from('prompt_keywords')
      .insert([newKeyword])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating prompt keyword:', error);
    res.status(500).json({ error: { code: 'CREATE_ERROR', message: 'Failed to create prompt keyword' } });
  }
};

export const getPromptKeywords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skill_id, agent_id, intent_category } = req.query;

    let query = supabase.from('prompt_keywords').select(`
      *,
      skills (
        id,
        name,
        slug,
        category
      ),
      agents (
        id,
        name,
        slug,
        persona_type
      )
    `);

    if (skill_id) {
      query = query.eq('skill_id', skill_id as string);
    }

    if (agent_id) {
      query = query.eq('agent_id', agent_id as string);
    }

    if (intent_category) {
      query = query.eq('intent_category', intent_category as string);
    }

    query = query.order('confidence_score', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching prompt keywords:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch prompt keywords' } });
  }
};
