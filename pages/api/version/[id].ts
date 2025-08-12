import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { createStorageAdapter } from '@/lib/storage-adapters';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid version ID' });
  }

  if (req.method === 'DELETE') {
    try {
      // Get version details first
      const { data: version, error: fetchError } = await supabaseAdmin
        .from('versions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      // Delete associated views first (foreign key constraint)
      const { error: viewsError } = await supabaseAdmin
        .from('views')
        .delete()
        .eq('version_id', id);

      if (viewsError) {
        console.error('Error deleting views:', viewsError);
        // Continue with deletion - this is not critical
      }

      // Delete the version record
      const { error: deleteError } = await supabaseAdmin
        .from('versions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Database error:', deleteError);
        throw new Error('Failed to delete version');
      }

      // TODO: Delete associated exported PDFs from storage
      // This would require tracking which PDFs belong to which versions
      
      console.log(`Version ${id} deleted successfully`);

      res.status(200).json({
        success: true,
        message: 'Version deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete version error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to delete version' 
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Get version details
      const { data: version, error: fetchError } = await supabaseAdmin
        .from('versions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      res.status(200).json(version);
    } catch (error: any) {
      console.error('Get version error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get version' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}