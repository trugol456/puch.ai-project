import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Version } from '@/lib/supabase';

interface SharePageProps {
  version: Version | null;
  error?: string;
}

export default function SharePage({ version, error }: SharePageProps) {
  useEffect(() => {
    if (version) {
      // Track view
      fetch('/api/metrics/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId: version.id,
          sessionId: generateSessionId(),
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    }
  }, [version]);

  if (error) {
    return (
      <>
        <Head>
          <title>Resume Not Found - One-Click Resume Tailor</title>
        </Head>
        <div className="container" style={{ paddingTop: '40px' }}>
          <div className="card">
            <h1>Resume Not Found</h1>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!version) {
    return (
      <>
        <Head>
          <title>Loading... - One-Click Resume Tailor</title>
        </Head>
        <div className="container" style={{ paddingTop: '40px' }}>
          <div className="card">
            <div className="loading">
              <div className="spinner"></div>
              Loading resume...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{version.title} - One-Click Resume Tailor</title>
        <meta name="description" content={`View ${version.title} created with One-Click Resume Tailor`} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
            {version.title}
          </h1>
          <p style={{ color: '#6b7280' }}>
            Created {new Date(version.created_at).toLocaleDateString()} • 
            {version.views} view{version.views !== 1 ? 's' : ''}
          </p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Powered by One-Click Resume Tailor
          </p>
        </header>

        <div className="editor-container">
          <div className="editor-panel">
            <div className="editor-header">Resume</div>
            <div className="editor-content">
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ 
                  __html: version.resume_html_redacted || version.resume_html 
                }}
              />
            </div>
          </div>
          
          <div className="editor-panel">
            <div className="editor-header">Cover Letter</div>
            <div className="editor-content">
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ 
                  __html: version.cover_html_redacted || version.cover_html 
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a 
            href="/" 
            className="btn"
            style={{ textDecoration: 'none' }}
          >
            Create Your Own Resume
          </a>
        </div>
      </div>
    </>
  );
}

function generateSessionId(): string {
  // Generate a simple session ID for tracking
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.params!;

  if (typeof token !== 'string') {
    return {
      props: {
        version: null,
        error: 'Invalid token',
      },
    };
  }

  try {
    // Fetch version by public token
    const { data: version, error } = await supabaseAdmin
      .from('versions')
      .select('*')
      .eq('public_token', token)
      .eq('is_public', true)
      .single();

    if (error || !version) {
      return {
        props: {
          version: null,
          error: 'Resume not found or not public',
        },
      };
    }

    return {
      props: {
        version,
      },
    };
  } catch (error) {
    console.error('Error fetching version:', error);
    return {
      props: {
        version: null,
        error: 'Failed to load resume',
      },
    };
  }
};