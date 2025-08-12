import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>One-Click Resume Tailor</title>
        <meta name="description" content="AI-powered resume tailoring for job applications" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                       'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8fafc;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .btn {
          display: inline-block;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          background-color: #3b82f6;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .btn:hover {
          background-color: #2563eb;
        }

        .btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #6b7280;
        }

        .btn-secondary:hover {
          background-color: #4b5563;
        }

        .btn-danger {
          background-color: #dc2626;
        }

        .btn-danger:hover {
          background-color: #b91c1c;
        }

        .input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .textarea {
          min-height: 120px;
          resize: vertical;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .error {
          color: #dc2626;
          font-size: 14px;
          margin-top: 8px;
        }

        .success {
          color: #059669;
          font-size: 14px;
          margin-top: 8px;
        }

        .loading {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .editor-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 24px;
        }

        .editor-panel {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .editor-header {
          background: #f9fafb;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 500;
        }

        .editor-content {
          padding: 16px;
          min-height: 400px;
          max-height: 600px;
          overflow-y: auto;
        }

        .preview-content {
          border: 1px solid #e5e7eb;
          padding: 16px;
          background: white;
          border-radius: 8px;
          min-height: 300px;
        }

        @media (max-width: 768px) {
          .editor-container {
            grid-template-columns: 1fr;
          }
          
          .container {
            padding: 0 16px;
          }
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;