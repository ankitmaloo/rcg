// loader.tsx
import React, { useState, useEffect } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface LoaderProps {
    text?: string;
    partialAssets?: {
        landingPageHtml?: { html: string };
        instagramAdImage?: string;
        copyVariants?: string[];
        videoUrl?: string;
    };
}

type Tab = 'Instagram Ad' | 'Copy Variants' | 'Video';

// FIX: Accept string directly instead of object to avoid reference issues
const PartialLandingPagePreview: React.FC<{ htmlString: string }> = ({ htmlString }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [showRendered, setShowRendered] = useState(false);
  const streamingLineCount = React.useMemo(
    () => htmlString.split(/\r?\n/).filter(Boolean).length,
    [htmlString]
  );

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlString || '');
        iframeDoc.close();
      }
    }
  }, [htmlString]);

  useEffect(() => {
    if (!htmlString) {
      setShowRendered(false);
      return;
    }

    const isComplete = /<\/(body|html)>/i.test(htmlString);
    if (!isComplete) {
      setShowRendered(false);
      return;
    }

    const timer = window.setTimeout(() => setShowRendered(true), 420);
    return () => window.clearTimeout(timer);
  }, [htmlString]);

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden w-full h-full flex flex-col shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
      <div className="px-4 py-3 bg-slate-900/80 backdrop-blur flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-500/90 rounded-full shadow-[0_0_12px_rgba(248,113,113,0.7)]" />
          <span className="w-2.5 h-2.5 bg-amber-400/90 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
          <span className="w-2.5 h-2.5 bg-emerald-400/90 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
        </div>
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-400">
          <span className="inline-flex items-center gap-1 text-violet-300/90">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-violet-500/40 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
            </span>
            Live compile
          </span>
          <span className="h-3 w-px bg-slate-700/80" />
          <span>{streamingLineCount} lines</span>
        </div>
      </div>

      <div className="flex-grow bg-slate-950/90 overflow-hidden relative">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            showRendered ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="absolute top-3 right-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-violet-300/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-violet-400/40 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            Streaming landing layout
          </div>
          <pre className="p-4 text-emerald-300/90 text-[10px] font-mono whitespace-pre-wrap h-full overflow-auto leading-relaxed bg-gradient-to-b from-slate-950/0 via-slate-950/40 to-slate-950/95">
            {htmlString || '<!-- Initializing high-conversion landing experience... -->'}
          </pre>
          <div className="flex justify-center pb-4">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <span className="absolute inset-0 border border-slate-800 rounded-full" />
              <span className="absolute inset-1 border-2 border-transparent border-t-violet-500/90 rounded-full animate-spin" />
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            showRendered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <iframe
            ref={iframeRef}
            title="Landing Page Preview"
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin"
          />
          <div className="pointer-events-none absolute bottom-3 right-4 px-2.5 py-1.5 rounded-full bg-slate-900/80 border border-violet-600/40 text-[8px] font-medium tracking-[0.18em] text-violet-300/90 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Rendered Preview
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -top-24 -right-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl" />
    </div>
  );
};

const PartialAssetTabs: React.FC<{ partialAssets: LoaderProps['partialAssets'] }> = ({ partialAssets }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Instagram Ad');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Instagram Ad':
        return (
          <div className="p-4">
            {partialAssets?.instagramAdImage ? (
              <img
                src={`data:image/png;base64,${partialAssets.instagramAdImage}`}
                alt="Instagram Ad"
                className="w-full h-auto rounded"
              />
            ) : (
              <div className="text-slate-400 text-center py-8">Generating image...</div>
            )}
          </div>
        );
      case 'Copy Variants':
        return (
          <div className="p-4">
            {partialAssets?.copyVariants && partialAssets.copyVariants.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {partialAssets.copyVariants.map((copy, i) => (
                  <li key={i} className="text-slate-300 text-sm">{copy}</li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-400 text-center py-8">Generating copy variants...</div>
            )}
          </div>
        );
      case 'Video':
        return (
          <div className="p-4">
            {partialAssets?.videoUrl ? (
              <video
                src={partialAssets.videoUrl}
                controls
                className="w-full h-auto rounded"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-slate-400 text-center py-8">
                <div className="relative w-8 h-8 flex items-center justify-center mx-auto mb-2">
                  <span className="absolute inset-0 border border-slate-600 rounded-full" />
                  <span className="absolute inset-1 border-2 border-violet-500/90 rounded-full animate-spin" />
                </div>
                Generating cinematic video...
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-950 to-slate-900/95 border border-slate-800/80 rounded-2xl overflow-hidden w-full h-full flex flex-col shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
      <div className="px-3.5 py-2.5 bg-slate-950/95 backdrop-blur border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 mr-1" />
          Creative stream
        </div>
        <div className="flex space-x-1.5">
          {(['Instagram Ad', 'Copy Variants', 'Video'] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-medium transition-all ${
                  isActive
                    ? 'bg-violet-500 text-white shadow-[0_0_18px_rgba(129,140,248,0.8)]'
                    : 'bg-slate-900/70 text-slate-400 hover:text-violet-300 hover:bg-slate-800/90 border border-transparent hover:border-violet-500/40'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto bg-slate-950/80">
        {renderTabContent()}
      </div>
      <div className="pointer-events-none absolute -bottom-24 right-0 w-40 h-40 bg-violet-600/10 blur-3xl" />
    </div>
  );
};

const Loader: React.FC<LoaderProps> = ({ text, partialAssets }) => {
    const messages = [
        "Brewing creativity...",
        "Assembling pixels...",
        "Crafting witty copy...",
        "Consulting with marketing gurus...",
        "Generating awesome ideas...",
        "Polishing the call-to-action...",
    ];

    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        let interval: number;
        if (!text) {
            interval = window.setInterval(() => {
                setMessage(messages[Math.floor(Math.random() * messages.length)]);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [text]);

    // FIX: Check for actual HTML content, not just object existence
    const hasPartialResults = partialAssets && (
        (partialAssets.landingPageHtml && partialAssets.landingPageHtml.html.length > 0) ||
        partialAssets.instagramAdImage !== undefined ||
        partialAssets.copyVariants !== undefined ||
        partialAssets.videoUrl !== undefined
    );

  return (
    <div className="w-full h-screen max-w-screen-2xl mx-auto p-4 md:p-6 flex flex-col animate-fade-in">
        {hasPartialResults ? (
            <>
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-violet-500/40 text-[10px] font-medium text-violet-300/90 uppercase tracking-[0.18em] mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Campaign Intelligence Engine
                      </div>
                      <h2 className="text-3xl md:text-4xl font-semibold md:font-extrabold text-white leading-tight">
                        Generating a production-grade campaign experience
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-[0_14px_45px_rgba(15,23,42,0.85)]">
                        <div className="relative w-7 h-7 flex items-center justify-center">
                            <span className="absolute inset-0 border border-slate-800 rounded-full" />
                            <span className="absolute inset-1.5 border-2 border-violet-500/90 rounded-full animate-spin-reverse-slow" />
                            <SparklesIcon className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Status</span>
                          <p className="text-xs text-slate-200 font-medium">{text || message}</p>
                        </div>
                    </div>
                </header>
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    <div className="lg:col-span-2 h-full min-h-0">
                        {partialAssets?.landingPageHtml ? (
                            <PartialLandingPagePreview
                                key={`landing-${partialAssets.landingPageHtml.html.length}`}
                                htmlString={partialAssets.landingPageHtml.html}
                            />
                        ) : (
                            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-dashed border-slate-800/80 rounded-2xl flex items-center justify-center h-full shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
                                <div className="text-center px-6">
                                    <div className="relative w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <span className="absolute inset-0 border border-slate-800 rounded-full" />
                                        <span className="absolute inset-2 border border-slate-800 rounded-full animate-spin-slow" />
                                        <span className="absolute inset-4 border-2 border-violet-500/90 rounded-full animate-spin-reverse-slow" />
                                        <SparklesIcon className="w-6 h-6 text-violet-400 animate-pulse" />
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        Architecting a premium, conversion-obsessed landing experience...
                                    </p>
                                </div>
                                <div className="pointer-events-none absolute -top-16 right-6 w-32 h-32 bg-violet-500/8 blur-3xl" />
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-1 h-full min-h-0">
                        <PartialAssetTabs partialAssets={partialAssets} />
                    </div>
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center text-center flex-grow">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <span className="absolute inset-0 border border-slate-800 rounded-full" />
                    <span className="absolute inset-2 border border-slate-800 rounded-full animate-spin-slow" />
                    <span className="absolute inset-4 border-2 border-violet-500/90 rounded-full animate-spin-reverse-slow" />
                    <SparklesIcon className="w-8 h-8 text-violet-400 animate-pulse" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold md:font-extrabold text-white mt-8">
                  {text || 'Generating your campaign ecosystem'}
                </h2>
                <p className="text-slate-400 mt-2 text-sm max-w-md">
                  {!text && (message || 'Orchestrating assets, layouts, and messaging to agency-grade standards.')}
                </p>
            </div>
        )}
      <style>{`
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 4s linear infinite;
        }
        .animate-spin-reverse-slow {
            animation: spin-reverse-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
