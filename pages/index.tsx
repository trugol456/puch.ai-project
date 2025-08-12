import { useState, useRef } from 'react';
import Head from 'next/head';

interface UploadedFile {
  fileId: string;
  filename: string;
  size: number;
  textPreview: string;
}

interface JobData {
  jobId: string;
  title?: string;
  company?: string;
  url?: string;
  contentPreview: string;
}

interface GeneratedContent {
  tailoredResumeHtml: string;
  coverLetterHtml: string;
  summary: string;
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [useJobText, setUseJobText] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading('upload');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedFile(data);
      setSuccess('Resume uploaded successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleJobSubmit = async () => {
    if (!useJobText && !jobUrl.trim()) {
      setError('Please enter a job URL');
      return;
    }

    if (useJobText && !jobText.trim()) {
      setError('Please enter job description text');
      return;
    }

    setLoading('job');
    setError(null);

    try {
      const response = await fetch('/api/fetch-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: useJobText ? undefined : jobUrl,
          jobText: useJobText ? jobText : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch job');
      }

      setJobData(data);
      setSuccess('Job posting processed successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      setError('Please upload a resume first');
      return;
    }

    if (!jobData) {
      setError('Please add a job posting first');
      return;
    }

    setLoading('generate');
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadedFile.fileId,
          jobId: jobData.jobId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedContent(data);
      setSuccess('Content generated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleSaveVersion = async () => {
    if (!generatedContent) return;

    setLoading('save');
    setError(null);

    try {
      const title = `Resume for ${jobData?.title || 'Job Application'}`;
      
      const response = await fetch('/api/save-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          resumeHtml: generatedContent.tailoredResumeHtml,
          coverHtml: generatedContent.coverLetterHtml,
          fileId: uploadedFile?.fileId,
          jobId: jobData?.jobId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save version');
      }

      setSuccess(`Version saved! Share link: ${window.location.origin}/s/${data.publicToken}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleExportPDF = async () => {
    if (!generatedContent) return;

    setLoading('export');
    setError(null);

    try {
      const combinedHtml = `
        ${generatedContent.tailoredResumeHtml}
        <div class="page-break"></div>
        ${generatedContent.coverLetterHtml}
      `;

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: combinedHtml,
          title: `Resume - ${jobData?.title || 'Application'}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Export failed');
      }

      // Download the PDF
      window.open(data.url, '_blank');
      setSuccess('PDF exported successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Head>
        <title>One-Click Resume Tailor</title>
      </Head>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
            One-Click Resume Tailor
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            AI-powered resume customization for your dream job
          </p>
        </header>

        {error && (
          <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div className="error">{error}</div>
          </div>
        )}

        {success && (
          <div className="card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div className="success">{success}</div>
          </div>
        )}

        {/* Step 1: Upload Resume */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Step 1: Upload Your Resume</h2>
          <div className="form-group">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              className="input"
            />
          </div>
          {loading === 'upload' && (
            <div className="loading">
              <div className="spinner"></div>
              Uploading and processing resume...
            </div>
          )}
          {uploadedFile && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <strong>{uploadedFile.filename}</strong> ({Math.round(uploadedFile.size / 1024)} KB)
              <br />
              <em>{uploadedFile.textPreview}</em>
            </div>
          )}
        </div>

        {/* Step 2: Add Job */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Step 2: Add Job Posting</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="label">
              <input
                type="radio"
                checked={!useJobText}
                onChange={() => setUseJobText(false)}
                style={{ marginRight: '8px' }}
              />
              Fetch from URL
            </label>
            <label className="label">
              <input
                type="radio"
                checked={useJobText}
                onChange={() => setUseJobText(true)}
                style={{ marginRight: '8px' }}
              />
              Paste job description
            </label>
          </div>

          {!useJobText ? (
            <div className="form-group">
              <label className="label">Job URL</label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="input"
                placeholder="https://company.com/jobs/software-engineer"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="label">Job Description</label>
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="input textarea"
                placeholder="Paste the full job description here..."
              />
            </div>
          )}

          <button
            onClick={handleJobSubmit}
            disabled={loading === 'job'}
            className="btn"
          >
            {loading === 'job' ? (
              <div className="loading">
                <div className="spinner"></div>
                Processing job...
              </div>
            ) : (
              'Process Job Posting'
            )}
          </button>

          {jobData && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <strong>{jobData.title || 'Job Posting'}</strong>
              {jobData.company && <span> at {jobData.company}</span>}
              <br />
              <em>{jobData.contentPreview}</em>
            </div>
          )}
        </div>

        {/* Step 3: Generate */}
        {uploadedFile && jobData && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Step 3: Generate Tailored Content</h2>
            <button
              onClick={handleGenerate}
              disabled={loading === 'generate'}
              className="btn"
            >
              {loading === 'generate' ? (
                <div className="loading">
                  <div className="spinner"></div>
                  Generating with AI...
                </div>
              ) : (
                'Generate Tailored Resume & Cover Letter'
              )}
            </button>
          </div>
        )}

        {/* Step 4: Preview and Edit */}
        {generatedContent && (
          <>
            <div className="card">
              <h2 style={{ marginBottom: '16px' }}>Generated Content</h2>
              <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                {generatedContent.summary}
              </p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                  onClick={handleSaveVersion}
                  disabled={loading === 'save'}
                  className="btn"
                >
                  {loading === 'save' ? (
                    <div className="loading">
                      <div className="spinner"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save & Share'
                  )}
                </button>
                
                <button
                  onClick={handleExportPDF}
                  disabled={loading === 'export'}
                  className="btn btn-secondary"
                >
                  {loading === 'export' ? (
                    <div className="loading">
                      <div className="spinner"></div>
                      Exporting...
                    </div>
                  ) : (
                    'Export PDF'
                  )}
                </button>
              </div>
            </div>

            <div className="editor-container">
              <div className="editor-panel">
                <div className="editor-header">Tailored Resume</div>
                <div className="editor-content">
                  <div 
                    className="preview-content"
                    dangerouslySetInnerHTML={{ __html: generatedContent.tailoredResumeHtml }}
                  />
                </div>
              </div>
              
              <div className="editor-panel">
                <div className="editor-header">Cover Letter</div>
                <div className="editor-content">
                  <div 
                    className="preview-content"
                    dangerouslySetInnerHTML={{ __html: generatedContent.coverLetterHtml }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}