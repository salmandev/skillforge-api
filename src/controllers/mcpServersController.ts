import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { generateUniqueSlug } from '../lib/slugify.js';
import { calculatePagination, parsePaginationParams } from '../lib/pagination.js';
import { CreateMCPServerInput } from '../types/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMCPServers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, auth_type, capabilities } = req.query;
    const { page: pageNum, limit: limitNum } = parsePaginationParams(req.query);

    let query = supabase.from('mcp_servers').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (auth_type) {
      query = query.eq('auth_type', auth_type as string);
    }

    if (capabilities) {
      const capArray = capabilities.toString().split(',');
      query = query.contains('capabilities', capArray);
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
    console.error('Error fetching MCP servers:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch MCP servers' } });
  }
};

export const getMCPServerBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('mcp_servers')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'MCP server not found' } });
        return;
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching MCP server:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch MCP server' } });
  }
};

export const createMCPServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const serverData: CreateMCPServerInput = req.body;
    const authReq = req as AuthRequest;

    const slug = await generateUniqueSlug(serverData.name, async (s) => {
      const { data } = await supabase.from('mcp_servers').select('id').eq('slug', s).single();
      return !!data;
    });

    const newServer = {
      name: serverData.name,
      slug,
      description: serverData.description,
      server_url: serverData.server_url,
      capabilities: serverData.capabilities || [],
      auth_type: serverData.auth_type || 'none',
      compatible_skill_ids: serverData.compatible_skill_ids || [],
      tags: serverData.tags || [],
      author_name: authReq.user?.email || serverData.author_name || null,
      verified: serverData.verified ?? false,
      star_count: 0,
    };

    const { data, error } = await supabase
      .from('mcp_servers')
      .insert([newServer])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating MCP server:', error);
    res.status(500).json({ error: { code: 'CREATE_ERROR', message: 'Failed to create MCP server' } });
  }
};

export const updateMCPServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    delete updateData.slug;
    delete updateData.created_at;
    delete updateData.id;

    const { data, error } = await supabase
      .from('mcp_servers')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'MCP server not found' } });
        return;
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating MCP server:', error);
    res.status(500).json({ error: { code: 'UPDATE_ERROR', message: 'Failed to update MCP server' } });
  }
};

export const deleteMCPServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const { error } = await supabase
      .from('mcp_servers')
      .delete()
      .eq('slug', slug);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting MCP server:', error);
    res.status(500).json({ error: { code: 'DELETE_ERROR', message: 'Failed to delete MCP server' } });
  }
};

export const starMCPServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const authReq = req as AuthRequest;

    // Get MCP server
    const { data: server, error: fetchError } = await supabase
      .from('mcp_servers')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !server) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'MCP server not found' } });
      return;
    }

    // Check if user already starred
    const userId = authReq.user?.id;
    if (userId) {
      const { data: existingStar } = await supabase
        .from('stars')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_type', 'mcp_server')
        .eq('resource_id', server.id)
        .single();

      if (existingStar) {
        // Remove star
        await supabase.from('stars').delete().eq('id', existingStar.id);
        await supabase.rpc('decrement_star_count', { p_resource_type: 'mcp_server', p_resource_id: server.id });
      } else {
        // Add star
        await supabase.from('stars').insert([{
          user_id: userId,
          resource_type: 'mcp_server',
          resource_id: server.id,
        }]);
        await supabase.rpc('increment_star_count', { p_resource_type: 'mcp_server', p_resource_id: server.id });
      }
    }

    // Return updated server
    const { data: updatedServer } = await supabase
      .from('mcp_servers')
      .select('*')
      .eq('slug', slug)
      .single();

    res.json({ data: updatedServer });
  } catch (error) {
    console.error('Error starring MCP server:', error);
    res.status(500).json({ error: { code: 'STAR_ERROR', message: 'Failed to star MCP server' } });
  }
};
