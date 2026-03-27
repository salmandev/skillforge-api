import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { generateUniqueSlug } from '../lib/slugify.js';
import { calculatePagination, parsePaginationParams } from '../lib/pagination.js';
import { CreateWorkflowInput } from '../types/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getWorkflows = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, use_case } = req.query;
    const { page: pageNum, limit: limitNum } = parsePaginationParams(req.query);

    let query = supabase.from('workflows').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (use_case) {
      query = query.eq('use_case', use_case as string);
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
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch workflows' } });
  }
};

export const getWorkflowBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
        return;
      }
      throw error;
    }

    // Populate skill and agent details for each step
    const steps = workflow.steps as Array<{ skill_id?: string; agent_id?: string }>;
    const skillIds = steps.filter(s => s.skill_id).map(s => s.skill_id!) as string[];
    const agentIds = steps.filter(s => s.agent_id).map(s => s.agent_id!) as string[];

    const populatedSteps = await Promise.all(steps.map(async (step) => {
      const populated: Record<string, unknown> = { ...step };
      
      if (step.skill_id) {
        const { data: skill } = await supabase
          .from('skills')
          .select('id, name, slug, description, category')
          .eq('id', step.skill_id)
          .single();
        populated.skill = skill || null;
      }
      
      if (step.agent_id) {
        const { data: agent } = await supabase
          .from('agents')
          .select('id, name, slug, description, persona_type')
          .eq('id', step.agent_id)
          .single();
        populated.agent = agent || null;
      }
      
      return populated as typeof step & { skill?: unknown; agent?: unknown };
    }));

    workflow.steps = populatedSteps;

    res.json({ data: workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch workflow' } });
  }
};

export const createWorkflow = async (req: Request, res: Response): Promise<void> => {
  try {
    const workflowData: CreateWorkflowInput = req.body;
    const authReq = req as AuthRequest;

    const slug = await generateUniqueSlug(workflowData.name, async (s) => {
      const { data } = await supabase.from('workflows').select('id').eq('slug', s).single();
      return !!data;
    });

    const newWorkflow = {
      name: workflowData.name,
      slug,
      description: workflowData.description,
      use_case: workflowData.use_case,
      trigger_phrase: workflowData.trigger_phrase || null,
      steps: workflowData.steps,
      tags: workflowData.tags || [],
      author_id: authReq.user?.id || workflowData.author_id || null,
      author_name: authReq.user?.email || workflowData.author_name || null,
      verified: workflowData.verified ?? false,
      star_count: 0,
    };

    const { data, error } = await supabase
      .from('workflows')
      .insert([newWorkflow])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: { code: 'CREATE_ERROR', message: 'Failed to create workflow' } });
  }
};

export const updateWorkflow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    delete updateData.slug;
    delete updateData.created_at;
    delete updateData.id;

    const { data, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
        return;
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: { code: 'UPDATE_ERROR', message: 'Failed to update workflow' } });
  }
};

export const deleteWorkflow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('slug', slug);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: { code: 'DELETE_ERROR', message: 'Failed to delete workflow' } });
  }
};

export const starWorkflow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const authReq = req as AuthRequest;

    // Get workflow
    const { data: workflow, error: fetchError } = await supabase
      .from('workflows')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !workflow) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
      return;
    }

    // Check if user already starred
    const userId = authReq.user?.id;
    if (userId) {
      const { data: existingStar } = await supabase
        .from('stars')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_type', 'workflow')
        .eq('resource_id', workflow.id)
        .single();

      if (existingStar) {
        // Remove star
        await supabase.from('stars').delete().eq('id', existingStar.id);
        await supabase.rpc('decrement_star_count', { p_resource_type: 'workflow', p_resource_id: workflow.id });
      } else {
        // Add star
        await supabase.from('stars').insert([{
          user_id: userId,
          resource_type: 'workflow',
          resource_id: workflow.id,
        }]);
        await supabase.rpc('increment_star_count', { p_resource_type: 'workflow', p_resource_id: workflow.id });
      }
    }

    // Return updated workflow
    const { data: updatedWorkflow } = await supabase
      .from('workflows')
      .select('*')
      .eq('slug', slug)
      .single();

    res.json({ data: updatedWorkflow });
  } catch (error) {
    console.error('Error starring workflow:', error);
    res.status(500).json({ error: { code: 'STAR_ERROR', message: 'Failed to star workflow' } });
  }
};
