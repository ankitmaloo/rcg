import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CampaignAssets, BrandKit } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import BeakerIcon from './icons/BeakerIcon';
import { generateLandingPageABTest } from '../services/geminiService';

interface CampaignPreviewProps {
  assets: CampaignAssets;
  onDeploy: () => void;
  onRestart: () => void;
}

type Tab = 'Instagram Ad' | 'Copy Variants' | 'Video';

const LandingPagePreview: React.FC<{ assets: CampaignAssets; onRegenerate?: () => void }> = ({ assets, onRegenerate }) => {
  const navigate = useNavigate();

  const handleFullPagePreview = () => {
    if (assets.landingPageHtml) {
      navigate('/landing-page-full', { state: { html: assets.landingPageHtml } });
    }
  };

  if (!assets.landingPageHtml) {
    return (
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden w-full h-full flex flex-col shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
        <div className="px-4 py-3 bg-slate-900/85 backdrop-blur flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500/90 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.7)]" />
            <span className="w-2.5 h-2.5 bg-amber-400/90 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
            <span className="w-2.5 h-2.5 bg-emerald-400/90 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
          </div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-400">
            <span className="inline-flex items-center gap-1 text-violet-300/90">
              <SparklesIcon className="w-3 h-3" />
              Final layout
            </span>
            <span className="h-3 w-px bg-slate-700/80" />
            <span className="text-slate-500">Live preview</span>
          </div>
        </div>
        <div className="flex-grow bg-slate-950/90 relative flex items-center justify-center">
          <div className="text-slate-500 text-center text-xs uppercase tracking-[0.16em]">
            Landing page not generated
          </div>
        </div>
        <div className="pointer-events-none absolute -top-20 -right-8 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl" />
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden w-full h-full flex flex-col shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
      <div className="px-4 py-3 bg-slate-900/85 backdrop-blur flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-500/90 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.7)]" />
          <span className="w-2.5 h-2.5 bg-amber-400/90 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
          <span className="w-2.5 h-2.5 bg-emerald-400/90 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-400">
            <span className="inline-flex items-center gap-1 text-violet-300/90">
              <SparklesIcon className="w-3 h-3" />
              Final layout
            </span>
            <span className="h-3 w-px bg-slate-700/80" />
            <span className="text-slate-500">Live preview</span>
          </div>
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-700/80">
            <button
              onClick={onRegenerate}
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-slate-800/60 transition-all duration-200"
              title="Regenerate landing page"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFullPagePreview}
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-slate-800/60 transition-all duration-200"
              title="View in full page"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-grow bg-slate-950/90 relative overflow-hidden">
        <div
          className="w-full h-full"
          title="Landing page preview"
        >
          <iframe
            title="Landing Page Preview"
            srcDoc={assets.landingPageHtml}
            className="w-full h-full pointer-events-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <div className="pointer-events-none absolute bottom-3 right-4 px-2.5 py-1.5 rounded-full bg-slate-900/85 border border-violet-600/40 text-[8px] font-medium tracking-[0.18em] text-violet-300/90 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Conversion-ready
        </div>
      </div>
      <div className="pointer-events-none absolute -top-20 -right-8 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl" />
    </div>
  );
};

const AssetTabs: React.FC<{ assets: CampaignAssets; onRegenerateLandingPage?: () => void }> = ({ assets, onRegenerateLandingPage }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Instagram Ad');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Instagram Ad':
        return (
          <div className="p-4">
            {assets.instagramAdImage ? (
              <div className="space-y-4">
                <img
                  src={`data:image/png;base64,${assets.instagramAdImage}`}
                  alt="Instagram Ad"
                  className="w-full h-auto rounded-xl border border-slate-800/80 shadow-[0_10px_40px_rgba(15,23,42,0.9)]"
                />
                <button className="w-full inline-flex items-center justify-center px-3 py-2 bg-slate-900/90 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white transition-all duration-200">
                  <SparklesIcon className="w-3 h-3 mr-1.5" />
                  Regenerate Ad
                </button>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10 text-xs uppercase tracking-[0.16em]">
                Image variant not generated
              </div>
            )}
          </div>
        );
      case 'Copy Variants':
        return (
          <div className="p-4">
            {assets.copyVariants && assets.copyVariants.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {assets.copyVariants.map((variant, index) => (
                    <div key={index} className="text-slate-200 whitespace-pre-wrap text-xs leading-relaxed bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-3 font-mono">
                      <div className="text-slate-500 text-[10px] uppercase tracking-[0.16em] mb-2">Variant {index + 1}</div>
                      {variant}
                    </div>
                  ))}
                </div>
                <button className="w-full inline-flex items-center justify-center px-3 py-2 bg-slate-900/90 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white transition-all duration-200">
                  <SparklesIcon className="w-3 h-3 mr-1.5" />
                  Regenerate Copy
                </button>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10 text-xs uppercase tracking-[0.16em]">
                Copy variants not generated
              </div>
            )}
          </div>
        );
      case 'Video':
        return (
          <div className="p-4">
            {assets.videoUrl ? (
              <div className="space-y-4">
                <video
                  src={assets.videoUrl}
                  controls
                  className="w-full h-auto rounded-xl border border-slate-800/80 shadow-[0_10px_40px_rgba(15,23,42,0.9)]"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                <button className="w-full inline-flex items-center justify-center px-3 py-2 bg-slate-900/90 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white transition-all duration-200">
                  <SparklesIcon className="w-3 h-3 mr-1.5" />
                  Regenerate Video
                </button>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10 text-xs uppercase tracking-[0.16em]">
                Video generation in progress...
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
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
            Asset Intelligence
          </span>
          <span className="text-[10px] text-slate-400">
            Instantly review ad, copy and video variants.
          </span>
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
                    ? 'bg-violet-500 text-white shadow-[0_0_18px_rgba(129,140,248,0.9)]'
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

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ assets, onDeploy, onRestart }) => {
  const [abTestVariant, setAbTestVariant] = useState<string | null>(null);
  const [isGeneratingABTest, setIsGeneratingABTest] = useState(false);
  const [showABTest, setShowABTest] = useState(false);

  const handleCreateABTest = async () => {
    if (!assets.landingPageHtml) return;

    setIsGeneratingABTest(true);
    try {
      const brandName = assets.brand?.name || 'Default Brand';
      const variantHtml = await generateLandingPageABTest(assets.landingPageHtml, brandName);
      setAbTestVariant(variantHtml);
      setShowABTest(true);
    } catch (error) {
      console.error('Failed to generate A/B test variant:', error);
    } finally {
      setIsGeneratingABTest(false);
    }
  };

  const handleRegenerateLandingPage = () => {
    // This would need to be passed down from parent or trigger a regeneration
    // For now, just reset the A/B test
    setAbTestVariant(null);
    setShowABTest(false);
  };

  return (
    <div className="w-full h-screen max-w-screen-2xl mx-auto flex flex-col animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 p-4 md:p-6 flex-shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-violet-500/40 text-[10px] font-medium text-violet-300/90 uppercase tracking-[0.18em] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Campaign Canvas
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold md:font-extrabold text-white leading-tight">
            Review, refine and launch a studio-grade campaign.
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-xl">
            Landing, paid social, copy and video stitched into one cohesive, on-brand funnel.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <button
            onClick={handleCreateABTest}
            disabled={isGeneratingABTest || !assets.landingPageHtml}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900/90 text-slate-100 text-xs font-semibold rounded-lg border border-violet-500/40 hover:bg-slate-900 hover:border-violet-400 transition-all duration-200 shadow-[0_10px_30px_rgba(15,23,42,0.9)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BeakerIcon className="w-4 h-4 mr-1.5" />
            {isGeneratingABTest ? 'Generating...' : 'Create A/B Test'}
          </button>
          <button
            onClick={onRestart}
            className="px-4 py-2.5 bg-slate-900/90 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            Start Over
          </button>
          <button
            onClick={onDeploy}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-violet-500 to-indigo-500 text-white text-xs font-semibold rounded-lg hover:from-emerald-400 hover:via-violet-400 hover:to-indigo-400 transition-all duration-300 shadow-[0_16px_40px_rgba(79,70,229,0.75)]"
          >
            <SparklesIcon className="w-4 h-4 mr-1.5" />
            Approve & Deploy
          </button>
        </div>
      </header>
      <div className={`flex-grow grid gap-6 min-h-0 px-4 md:px-6 pb-4 md:pb-6 ${showABTest ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`} style={{ gridAutoRows: '1fr' }}>
        <div className={`${showABTest ? 'lg:col-span-1' : 'lg:col-span-2'} h-full min-h-0`}>
          <LandingPagePreview assets={assets} onRegenerate={handleRegenerateLandingPage} />
        </div>
        {showABTest && abTestVariant && (
          <div className="lg:col-span-1 h-full min-h-0">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden w-full h-full flex flex-col shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              <div className="px-4 py-3 bg-slate-900/85 backdrop-blur flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500/90 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.7)]" />
                  <span className="w-2.5 h-2.5 bg-amber-400/90 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                  <span className="w-2.5 h-2.5 bg-emerald-400/90 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                </div>
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-400">
                  <span className="inline-flex items-center gap-1 text-violet-300/90">
                    <BeakerIcon className="w-3 h-3" />
                    A/B Test Variant
                  </span>
                  <span className="h-3 w-px bg-slate-700/80" />
                  <span className="text-slate-500">Live preview</span>
                </div>
              </div>
              <div className="flex-grow bg-slate-950/90 relative overflow-hidden">
                <iframe
                  title="A/B Test Variant Preview"
                  srcDoc={abTestVariant}
                  className="w-full h-full pointer-events-none"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="pointer-events-none absolute bottom-3 right-4 px-2.5 py-1.5 rounded-full bg-slate-900/85 border border-violet-600/40 text-[8px] font-medium tracking-[0.18em] text-violet-300/90 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Test variant
                </div>
              </div>
              <div className="pointer-events-none absolute -top-20 -right-8 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl" />
            </div>
          </div>
        )}
        <div className={`${showABTest ? 'lg:col-span-2' : 'lg:col-span-1'} h-full min-h-0`}>
          <AssetTabs assets={assets} onRegenerateLandingPage={handleRegenerateLandingPage} />
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;
