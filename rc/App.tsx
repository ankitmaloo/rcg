// App.tsx
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import type { CampaignAssets, BrandKit, AssetSelection } from './types';
import { AppState } from './types';
import { generateCampaignAssets } from './services/geminiService';
import CampaignInput from './components/CampaignInput';
import CampaignPreview from './components/CampaignPreview';
import DeploymentView from './components/DeploymentView';
import Loader from './components/Loader';
import LandingPageFullView from './components/LandingPageFullView';
import PublicLandingPageViewer from './components/PublicLandingPageViewer';
import LibraryView from './components/LibraryView';

// Type for tracking partial results during streaming
export type PartialAssets = {
  landingPageHtml?: { html: string };
  instagramAdImage?: string;
  copyVariants?: string[];
  videoUrl?: string;
};

const createInitialPartialAssets = (): PartialAssets => ({
  landingPageHtml: { html: '' },
  instagramAdImage: '',
  copyVariants: [],
  videoUrl: '',
});

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [campaignAssets, setCampaignAssets] = useState<CampaignAssets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
  const [partialAssets, setPartialAssets] = useState<PartialAssets | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleGenerate = useCallback(async (prompt: string, brandKit: BrandKit, assetSelection: AssetSelection) => {
    setLoadingMessage("Generating Your Campaign");
    setAppState(AppState.LOADING);
    setError(null);

    setPartialAssets(createInitialPartialAssets());

    try {
      const assets = await generateCampaignAssets(prompt, brandKit, assetSelection, (partial) => {
        setPartialAssets(prev => {
          const baseState = prev ?? createInitialPartialAssets();

          // For HTML, use the latest accumulated value from the stream.
          const updatedLandingPage = partial.landingPageHtml
            ? (() => {
                const previousHtml = typeof baseState.landingPageHtml === 'object' && baseState.landingPageHtml?.html ? baseState.landingPageHtml.html : '';
                const incomingHtml = typeof partial.landingPageHtml === 'object' && partial.landingPageHtml?.html ? partial.landingPageHtml.html : '';

                // Gemini streams the full buffer each time; guard against duplication when the backend changes.
                if (incomingHtml.startsWith(previousHtml)) {
                  return { html: incomingHtml };
                }

                return { html: previousHtml + incomingHtml };
              })()
            : baseState.landingPageHtml;

          return {
            ...baseState,
            ...partial,
            landingPageHtml: updatedLandingPage
          };
        });
      });
      
      setCampaignAssets(assets);
      setPartialAssets(null); // Clear partial state
      setAppState(AppState.PREVIEW);
    } catch (err) {
      console.error(err);
      setError('Failed to generate campaign assets. Please try again.');
      setAppState(AppState.INPUT);
    } finally {
      setLoadingMessage(undefined);
    }
  }, []);

  const handleDeploy = useCallback(() => {
    setAppState(AppState.DEPLOYED);
  }, []);

  const handleRestart = useCallback(() => {
    setAppState(AppState.INPUT);
    setCampaignAssets(null);
    setError(null);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.INPUT:
        return <CampaignInput onGenerate={handleGenerate} error={error} />;
      case AppState.LOADING:
        return <Loader text={loadingMessage} partialAssets={partialAssets}/>;
      case AppState.PREVIEW:
        return campaignAssets && <CampaignPreview assets={campaignAssets} onDeploy={handleDeploy} onRestart={handleRestart} />;
      case AppState.DEPLOYED:
        return campaignAssets && <DeploymentView assets={campaignAssets} onRestart={handleRestart}/>;
      default:
        return <CampaignInput onGenerate={handleGenerate} error={error} />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/p/:slug" element={<PublicLandingPageViewer />} />
        <Route path="/landing-page-full" element={<LandingPageFullView />} />
        <Route path="/" element={
          <>
            <div className="min-h-screen w-full font-sans flex flex-col items-center justify-center p-4 lg:p-8">
              {/* Library button - floating top right */}
              <button
                onClick={() => setShowLibrary(true)}
                className="fixed top-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-slate-200 rounded-xl border border-slate-700 hover:border-violet-500/50 hover:bg-slate-800 transition-all duration-200 shadow-lg backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm font-medium">Library</span>
              </button>

              {renderContent()}
            </div>

            {/* Library modal */}
            {showLibrary && <LibraryView onClose={() => setShowLibrary(false)} />}
          </>
        } />
      </Routes>
    </Router>
  );
};

export default App;
