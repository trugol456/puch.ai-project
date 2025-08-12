import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../../pages/index';

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should render the main page elements', () => {
    render(<Home />);

    expect(screen.getByText('One-Click Resume Tailor')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Upload Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Add Job Posting')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /process job posting/i })).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        fileId: 'test-file-id',
        textPreview: 'Sample resume text...',
        filename: 'test-resume.pdf',
        size: 1024,
      }),
    });

    render(<Home />);

    const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    const file = new File(['sample content'], 'test-resume.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        method: 'POST',
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('Resume uploaded successfully!')).toBeInTheDocument();
      expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
    });
  });

  it('should handle job URL submission', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        jobId: 'test-job-id',
        title: 'Software Engineer',
        company: 'TechCorp',
        contentPreview: 'Job description preview...',
      }),
    });

    render(<Home />);

    const urlInput = screen.getByPlaceholderText(/https:\/\/company.com/i);
    const submitButton = screen.getByRole('button', { name: /process job posting/i });

    fireEvent.change(urlInput, { target: { value: 'https://example.com/job' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/fetch-job', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: 'https://example.com/job',
          jobText: undefined,
        }),
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('Job posting processed successfully!')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('should handle job text submission', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        jobId: 'test-job-id',
        title: 'Job Posting',
        contentPreview: 'Pasted job text preview...',
      }),
    });

    render(<Home />);

    // Switch to job text mode
    const textRadio = screen.getByLabelText(/paste job description/i);
    fireEvent.click(textRadio);

    const textArea = screen.getByPlaceholderText(/paste the full job description/i);
    const submitButton = screen.getByRole('button', { name: /process job posting/i });

    fireEvent.change(textArea, { target: { value: 'Sample job description text' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/fetch-job', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          jobUrl: undefined,
          jobText: 'Sample job description text',
        }),
      }));
    });
  });

  it('should show generate button after upload and job', async () => {
    // Mock successful upload and job responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          fileId: 'test-file-id',
          textPreview: 'Resume text...',
          filename: 'resume.pdf',
          size: 1024,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          jobId: 'test-job-id',
          title: 'Software Engineer',
          contentPreview: 'Job text...',
        }),
      });

    render(<Home />);

    // Upload file
    const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Resume uploaded successfully!')).toBeInTheDocument();
    });

    // Add job
    const urlInput = screen.getByPlaceholderText(/https:\/\/company.com/i);
    const submitButton = screen.getByRole('button', { name: /process job posting/i });
    fireEvent.change(urlInput, { target: { value: 'https://example.com/job' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Job posting processed successfully!')).toBeInTheDocument();
    });

    // Generate button should appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate tailored resume/i })).toBeInTheDocument();
    });
  });

  it('should handle generation and show preview', async () => {
    // Set up initial state with uploaded file and job
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          fileId: 'test-file-id',
          textPreview: 'Resume text...',
          filename: 'resume.pdf',
          size: 1024,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          jobId: 'test-job-id',
          title: 'Software Engineer',
          contentPreview: 'Job text...',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          tailoredResumeHtml: '<div>Tailored resume content</div>',
          coverLetterHtml: '<div>Cover letter content</div>',
          summary: 'Generated tailored resume for Software Engineer',
        }),
      });

    render(<Home />);

    // Upload file and add job (simplified)
    const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Resume uploaded successfully!')).toBeInTheDocument();
    });

    const urlInput = screen.getByPlaceholderText(/https:\/\/company.com/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/job' } });
    fireEvent.click(screen.getByRole('button', { name: /process job posting/i }));

    await waitFor(() => {
      expect(screen.getByText('Job posting processed successfully!')).toBeInTheDocument();
    });

    // Generate content
    const generateButton = screen.getByRole('button', { name: /generate tailored resume/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          fileId: 'test-file-id',
          jobId: 'test-job-id',
        }),
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('Content generated successfully!')).toBeInTheDocument();
      expect(screen.getByText('Generated tailored resume for Software Engineer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save & share/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: 'File upload failed',
      }),
    });

    render(<Home />);

    const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('File upload failed')).toBeInTheDocument();
    });
  });

  it('should validate job URL input', async () => {
    render(<Home />);

    const submitButton = screen.getByRole('button', { name: /process job posting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a job URL')).toBeInTheDocument();
    });
  });

  it('should validate job text input when in text mode', async () => {
    render(<Home />);

    // Switch to text mode
    const textRadio = screen.getByLabelText(/paste job description/i);
    fireEvent.click(textRadio);

    const submitButton = screen.getByRole('button', { name: /process job posting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter job description text')).toBeInTheDocument();
    });
  });
});