import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/upload';

// Mock dependencies
jest.mock('../../lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.mock('../../lib/storage-adapters', () => ({
  createStorageAdapter: jest.fn(() => ({
    uploadFile: jest.fn().mockResolvedValue('test-file-path'),
  })),
}));

jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    text: 'Sample PDF content extracted from test file',
  }),
}));

jest.mock('mammoth', () => ({
  extractRawText: jest.fn().mockResolvedValue({
    value: 'Sample DOCX content extracted from test file',
  }),
}));

jest.mock('multer', () => {
  const multerMock = jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => {
      // Simulate file upload
      req.file = {
        originalname: 'test-resume.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('fake pdf content'),
      };
      next();
    }),
  }));
  
  multerMock.memoryStorage = jest.fn();
  return multerMock;
});

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle PDF file upload successfully', async () => {
    const { supabaseAdmin } = require('../../lib/supabase');
    
    // Mock successful database insert
    supabaseAdmin.from().insert().select().single.mockResolvedValue({
      data: {
        id: 'test-file-id',
        filename: 'test-resume.pdf',
        file_size: 1024,
        text_content: 'Sample PDF content',
      },
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('fileId');
    expect(data).toHaveProperty('textPreview');
    expect(data.filename).toBe('test-resume.pdf');
  });

  it('should reject invalid file types', async () => {
    const multer = require('multer');
    
    // Mock multer to simulate invalid file type error
    multer.mockImplementation(() => ({
      single: jest.fn(() => (req: any, res: any, next: any) => {
        next(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
      }),
    }));

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('Invalid file type');
  });

  it('should handle database errors gracefully', async () => {
    const { supabaseAdmin } = require('../../lib/supabase');
    
    // Mock database error
    supabaseAdmin.from().insert().select().single.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Failed to save file metadata');
  });

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle missing file', async () => {
    const multer = require('multer');
    
    // Mock multer to simulate no file uploaded
    multer.mockImplementation(() => ({
      single: jest.fn(() => (req: any, res: any, next: any) => {
        // Don't set req.file
        next();
      }),
    }));

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('No file uploaded');
  });
});