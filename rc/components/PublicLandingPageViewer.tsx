import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PublicLandingPageViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandingPage = async () => {
      if (!slug) {
        setError('Invalid landing page URL');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/p/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Landing page not found');
          } else {
            setError('Failed to load landing page');
          }
          setLoading(false);
          return;
        }

        const htmlContent = await response.text();
        setHtml(htmlContent);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching landing page:', err);
        setError('Failed to load landing page');
        setLoading(false);
      }
    };

    fetchLandingPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 text-sm">Loading landing page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="max-w-md text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Oops!</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-500 transition-all duration-200"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Render the HTML directly in an iframe for safety and proper isolation
  return (
    <div className="w-full h-screen">
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        title="Landing Page"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};

export default PublicLandingPageViewer;
