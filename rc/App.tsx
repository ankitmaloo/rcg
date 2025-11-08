// App.tsx
import React, { useState, useCallback } from 'react';
import type { CampaignAssets, BrandKit } from './types';
import { AppState } from './types';
import { generateCampaignAssets } from './services/geminiService';
import CampaignInput from './components/CampaignInput';
import CampaignPreview from './components/CampaignPreview';
import DeploymentView from './components/DeploymentView';
import Loader from './components/Loader';

// Type for tracking partial results during streaming
export type PartialAssets = {
  landingPageHtml?: { html: string };
  instagramAdImage?: string;
  copyVariants?: string[];
  videoStatus?: string;
};

const createInitialPartialAssets = (): PartialAssets => ({
  landingPageHtml: { html: '' },
  instagramAdImage: '',
  copyVariants: [],
  videoStatus: '',
});

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [campaignAssets, setCampaignAssets] = useState<CampaignAssets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
  const [partialAssets, setPartialAssets] = useState<PartialAssets | null>(null);

  const handleGenerate = useCallback(async (prompt: string, brandKit: BrandKit) => {
    setLoadingMessage("Generating Your Campaign");
    setAppState(AppState.LOADING);
    setError(null);

    setPartialAssets(createInitialPartialAssets());

    try {
      const assets = await generateCampaignAssets(prompt, brandKit, (partial) => {
        setPartialAssets(prev => {
          const baseState = prev ?? createInitialPartialAssets();

          // For HTML, use the latest accumulated value from the stream.
          const updatedLandingPage = partial.landingPageHtml
            ? (() => {
                const previousHtml = baseState.landingPageHtml?.html ?? '';
                const incomingHtml = partial.landingPageHtml?.html ?? '';

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
    <div className="min-h-screen w-full font-sans flex flex-col items-center justify-center p-4 lg:p-8">
      {renderContent()}
    </div>
  );
};

export default App;
