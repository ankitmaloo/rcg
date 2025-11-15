import React, { useEffect, useState, useCallback } from 'react';
import { listLandingPages, deleteLandingPage } from '../services/geminiService';

interface LandingPage {
  id: string;
  slug: string;
  brand_name: string;
  created_at: string;
  views_count: number;
  has_ab_variant: boolean;
}

interface LibraryViewProps {
  onClose: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onClose }) => {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const result = await listLandingPages();
      setPages(result.pages);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch landing pages:', err);
      setError('Failed to load landing pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = useCallback(async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) {
      return;
    }

    try {
      setDeletingId(pageId);
      await deleteLandingPage(pageId);
      // Refresh the list
      await fetchPages();
    } catch (err) {
      console.error('Failed to delete landing page:', err);
      alert('Failed to delete landing page');
    } finally {
      setDeletingId(null);
    }
  }, [fetchPages]);

  const handleCopyUrl = useCallback((slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Landing Page Library</h1>
              <p className="text-slate-400 mt-1">Manage your saved landing pages</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-12 w-12 text-violet-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-400 text-sm">Loading your pages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchPages}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-300 mb-2">No landing pages yet</h2>
              <p className="text-slate-500">Create and save your first landing page to see it here!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-100 truncate">
                          {page.brand_name}
                        </h3>
                        {page.has_ab_variant && (
                          <span className="px-2 py-1 bg-violet-600/20 text-violet-300 text-xs rounded-full border border-violet-500/30">
                            A/B Test
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                        <span>{formatDate(page.created_at)}</span>
                        <span>•</span>
                        <span>{page.views_count} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-950/80 text-violet-300 px-3 py-1.5 rounded border border-slate-800 font-mono truncate max-w-md">
                          {window.location.origin}/p/{page.slug}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/p/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-violet-600/10 text-violet-400 rounded-lg border border-violet-500/30 hover:bg-violet-600/20 transition-colors"
                        title="View page"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleCopyUrl(page.slug)}
                        className="p-2 bg-slate-800/50 text-slate-400 rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="Copy URL"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        disabled={deletingId === page.id}
                        className="p-2 bg-red-600/10 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete page"
                      >
                        {deletingId === page.id ? (
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
