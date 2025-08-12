import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';

interface ViewMetricBody {
  versionId: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { versionId, sessionId, referrer, userAgent }: ViewMetricBody = req.body;

    if (!versionId) {
      return res.status(400).json({ error: 'versionId is required' });
    }

    // Check if version exists
    const { data: version, error: versionError } = await supabaseAdmin
      .from('versions')
      .select('id')
      .eq('id', versionId)
      .single();

    if (versionError || !version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Generate view ID
    const viewId = uuidv4();

    // Insert view record
    const { error: insertError } = await supabaseAdmin
      .from('views')
      .insert({
        id: viewId,
        version_id: versionId,
        session_id: sessionId,
        referrer: referrer?.substring(0, 500), // Limit referrer length
        user_agent: userAgent?.substring(0, 500), // Limit UA length
        viewed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Database error:', insertError);
      throw new Error('Failed to record view');
    }

    // Increment view counter on version
    const { error: updateError } = await supabaseAdmin
      .from('versions')
      .update({ 
        views: supabaseAdmin.sql`views + 1` 
      })
      .eq('id', versionId);

    if (updateError) {
      console.error('Update error:', updateError);
      // Log but don't fail the request
    }

    console.log(`View recorded for version ${versionId}`);

    res.status(200).json({
      success: true,
      viewId,
    });
  } catch (error: any) {
    console.error('View tracking error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to record view' 
    });
  }
}