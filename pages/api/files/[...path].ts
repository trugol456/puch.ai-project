import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only serve files in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'File serving disabled in production' });
  }

  try {
    const { path: pathParts } = req.query;
    
    if (!Array.isArray(pathParts) || pathParts.length < 2) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    const [bucket, ...fileParts] = pathParts;
    const filePath = fileParts.join('/');
    
    // Security: prevent directory traversal
    if (filePath.includes('..') || filePath.includes('~')) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    const fullPath = path.join('./uploads', bucket, filePath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath);
    
    // Set appropriate content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.html':
        contentType = 'text/html';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Cache for 1 hour in development
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.send(fileBuffer);
  } catch (error: any) {
    console.error('File serving error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to serve file' 
    });
  }
}