import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { generateUniqueSlug } from '../lib/slugify.js';
import { calculatePagination, parsePaginationParams } from '../lib/pagination.js';
import { CreateAgentInput } from '../types/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, persona_type, framework, arabic_support } = req.query;
    const { page: pageNum, limit: limitNum } = parsePaginationParams(req.query);

    let query = supabase.from('agents').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (persona_type) {
      query = query.eq('persona_type', persona_type as string);
    }

    if (framework) {
      query = query.contains('compatible_frameworks', [framework]);
    }

    if (arabic_support !== undefined) {
      query = query.eq('arabic_support', arabic_support === 'true');
    }

    query = query.order('created_at', { ascending: false });

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
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch agents' } });
  }
};

export const getAgentBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
        return;
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch agent' } });
  }
};

export const createAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const agentData: CreateAgentInput = req.body;
    const authReq = req as AuthRequest;

    const slug = await generateUniqueSlug(agentData.name, async (s) => {
      const { data } = await supabase.from('agents').select('id').eq('slug', s).single();
      return !!data;
    });

    const newAgent = {
      name: agentData.name,
      slug,
      description: agentData.description,
      soul_md_content: agentData.soul_md_content,
      persona_type: agentData.persona_type,
      compatible_frameworks: agentData.compatible_frameworks || [],
      tags: agentData.tags || [],
      arabic_support: agentData.arabic_support ?? false,
      author_id: authReq.user?.id || agentData.author_id || null,
      author_name: authReq.user?.email || agentData.author_name || null,
      verified: agentData.verified ?? false,
      star_count: 0,
    };

    const { data, error } = await supabase
      .from('agents')
      .insert([newAgent])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: { code: 'CREATE_ERROR', message: 'Failed to create agent' } });
  }
};

export const updateAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    delete updateData.slug;
    delete updateData.created_at;
    delete updateData.id;

    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
        return;
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: { code: 'UPDATE_ERROR', message: 'Failed to update agent' } });
  }
};

export const starAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const authReq = req as AuthRequest;

    // Get agent
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !agent) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
      return;
    }

    // Check if user already starred
    const userId = authReq.user?.id;
    if (userId) {
      const { data: existingStar } = await supabase
        .from('stars')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_type', 'agent')
        .eq('resource_id', agent.id)
        .single();

      if (existingStar) {
        // Remove star
        await supabase.from('stars').delete().eq('id', existingStar.id);
        await supabase.rpc('decrement_star_count', { p_resource_type: 'agent', p_resource_id: agent.id });
      } else {
        // Add star
        await supabase.from('stars').insert([{
          user_id: userId,
          resource_type: 'agent',
          resource_id: agent.id,
        }]);
        await supabase.rpc('increment_star_count', { p_resource_type: 'agent', p_resource_id: agent.id });
      }
    }

    // Return updated agent
    const { data: updatedAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('slug', slug)
      .single();

    res.json({ data: updatedAgent });
  } catch (error) {
    console.error('Error starring agent:', error);
    res.status(500).json({ error: { code: 'STAR_ERROR', message: 'Failed to star agent' } });
  }
};
