import React, { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface LoaderProps {
    text?: string;
    partialAssets?: {
        landingPageHtml?: { html: string };
        instagramAdImage?: string;
        copyVariants?: string[];
        videoStatus?: string;
    };
}

type Tab = 'Instagram Ad' | 'Copy Variants' | 'Video';

const PartialLandingPagePreview: React.FC<{ htmlObj: { html: string } }> = ({ htmlObj }) => {
  if (!htmlObj?.html) return null;

  return (
    <div className="bg-slate-850 border border-slate-700/50 rounded-xl overflow-hidden w-full h-full flex flex-col shadow-2xl">
      <div className="p-3 bg-slate-900 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        </div>
        <div className="w-16 h-8 flex items-center justify-end">
        </div>
      </div>
      <div className="flex-grow bg-slate-900/40">
        <iframe
          title="Landing Page Preview"
          srcDoc={htmlObj.html}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
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
            {partialAssets?.videoStatus ? (
              <div className="text-slate-300">{partialAssets.videoStatus}</div>
            ) : (
              <div className="text-slate-400 text-center py-8">Preparing video...</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-850 border border-slate-700/50 rounded-xl overflow-hidden w-full h-full flex flex-col shadow-2xl">
      <div className="p-3 bg-slate-900 border-b border-slate-700/50">
        <div className="flex space-x-1">
          {(['Instagram Ad', 'Copy Variants', 'Video'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderTabContent()}
      </div>
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

    // Show partial results when we have any assets (even empty strings indicate streaming started)
    const hasPartialResults = partialAssets && (
        partialAssets.landingPageHtml !== undefined ||
        partialAssets.instagramAdImage !== undefined ||
        partialAssets.copyVariants !== undefined ||
        partialAssets.videoStatus !== undefined
    );

  return (
    <div className="w-full h-screen max-w-screen-2xl mx-auto p-4 md:p-6 flex flex-col animate-fade-in">
        {hasPartialResults ? (
            <>
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-white text-center sm:text-left">Generating Campaign</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative w-6 h-6 flex items-center justify-center">
                            <span className="absolute inset-0 border-2 border-slate-700 rounded-full"></span>
                            <span className="absolute inset-1 border-2 border-violet-500 rounded-full animate-spin-reverse-slow"></span>
                            <SparklesIcon className="w-3 h-3 text-violet-400 animate-pulse"/>
                        </div>
                        <p className="text-slate-400">{text || message}</p>
                    </div>
                </header>
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    <div className="lg:col-span-2 h-full min-h-0">
                        {partialAssets.landingPageHtml ? (
                            <PartialLandingPagePreview htmlObj={partialAssets.landingPageHtml} />
                        ) : (
                            <div className="bg-slate-850 border border-slate-700/50 rounded-xl flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="relative w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <span className="absolute inset-0 border-2 border-slate-700 rounded-full"></span>
                                        <span className="absolute inset-2 border-2 border-slate-700 rounded-full animate-spin-slow"></span>
                                        <span className="absolute inset-4 border-2 border-violet-500 rounded-full animate-spin-reverse-slow"></span>
                                        <SparklesIcon className="w-6 h-6 text-violet-400 animate-pulse"/>
                                    </div>
                                    <p className="text-slate-400">Building landing page...</p>
                                </div>
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
                    <span className="absolute inset-0 border-2 border-slate-700 rounded-full"></span>
                    <span className="absolute inset-2 border-2 border-slate-700 rounded-full animate-spin-slow"></span>
                    <span className="absolute inset-4 border-2 border-violet-500 rounded-full animate-spin-reverse-slow"></span>
                    <SparklesIcon className="w-8 h-8 text-violet-400 animate-pulse"/>
                </div>
                <h2 className="text-2xl font-semibold text-white mt-8">{text || "Generating Your Campaign"}</h2>
                <p className="text-slate-400 mt-2">{!text && message}</p>
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
