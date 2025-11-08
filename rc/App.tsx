import React, { useState, useCallback } from 'react';
import type { CampaignAssets, BrandKit } from './types';
import { AppState } from './types';
import { generateCampaignAssets, generateImageAsset, generateLandingPageVariant } from './services/geminiService';
import CampaignInput from './components/CampaignInput';
import CampaignPreview from './components/CampaignPreview';
import DeploymentView from './components/DeploymentView';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [campaignAssets, setCampaignAssets] = useState<CampaignAssets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();


  const handleGenerate = useCallback(async (prompt: string, brandKit: BrandKit) => {
    setLoadingMessage("Generating Your Campaign");
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const assets = await generateCampaignAssets(prompt, brandKit);
      setCampaignAssets({ ...assets, font: brandKit.font, logo: brandKit.logo });
      setAppState(AppState.PREVIEW);
    } catch (err) {
      console.error(err);
      setError('Failed to generate campaign assets. Please try again.');
      setAppState(AppState.INPUT);
    } finally {
      setLoadingMessage(undefined);
    }
  }, []);

  const handleGenerateImage = useCallback(async (prompt: string) => {
    if (!campaignAssets) return;
    try {
      const imageData = await generateImageAsset(prompt);
      setCampaignAssets(prev => prev ? ({ ...prev, heroImageUrl: `data:image/png;base64,${imageData}` }) : null);
    } catch (e) {
      console.error(e);
      setError("Failed to generate hero image.");
    }
  }, [campaignAssets]);

  const handleGenerateVariant = useCallback(async () => {
    if (!campaignAssets) return;
    setLoadingMessage("Creating A/B Test Variant...");
    setAppState(AppState.LOADING);
    try {
        const variant = await generateLandingPageVariant(campaignAssets);
        setCampaignAssets(prev => prev ? ({ ...prev, landingPageB: variant }) : null);
    } catch (e) {
        console.error(e);
        setError("Failed to generate A/B test variant.");
    } finally {
        setAppState(AppState.PREVIEW);
        setLoadingMessage(undefined);
    }
  }, [campaignAssets]);


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
        return <Loader text={loadingMessage}/>;
      case AppState.PREVIEW:
        return campaignAssets && <CampaignPreview assets={campaignAssets} onDeploy={handleDeploy} onRestart={handleRestart} onGenerateImage={handleGenerateImage} onGenerateVariant={handleGenerateVariant} />;
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