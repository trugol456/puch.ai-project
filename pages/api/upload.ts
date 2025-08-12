import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { promisify } from 'util';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';
import { createStorageAdapter } from '@/lib/storage-adapters';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  },
});

const uploadMiddleware = promisify(upload.single('file'));

async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  try {
    switch (mimetype) {
      case 'application/pdf':
        const pdfData = await pdf(buffer);
        return pdfData.text;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        const docxResult = await mammoth.extractRawText({ buffer });
        return docxResult.value;
        
      case 'text/plain':
        return buffer.toString('utf-8');
        
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle file upload
    await uploadMiddleware(req as any, res as any);
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text content
    const textContent = await extractTextFromFile(file.buffer, file.mimetype);
    const textPreview = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');

    // Generate unique file ID and storage path
    const fileId = uuidv4();
    const fileExtension = file.originalname.split('.').pop() || 'bin';
    const storagePath = `${fileId}.${fileExtension}`;

    // Upload to storage
    const storageAdapter = createStorageAdapter();
    const uploadedPath = await storageAdapter.uploadFile(
      'resumes',
      storagePath,
      file.buffer,
      file.mimetype
    );

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        id: fileId,
        filename: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        storage_path: uploadedPath,
        text_content: textContent,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save file metadata');
    }

    console.log(`File uploaded successfully: ${file.originalname} (${textPreview})`);

    res.status(200).json({
      fileId,
      textPreview,
      filename: file.originalname,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload file' 
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for multer
  },
};