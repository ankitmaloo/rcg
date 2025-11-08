import React, { useState } from 'react';
import type { CampaignAssets, LandingPageContent } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import BeakerIcon from './icons/BeakerIcon';

interface CampaignPreviewProps {
  assets: CampaignAssets;
  onDeploy: () => void;
  onRestart: () => void;
  onGenerateImage: (prompt: string) => Promise<void>;
  onGenerateVariant: () => void;
}

type Tab = 'Ad Copy' | 'Asset Prompts' | 'SEO & Tracking';

const LandingPagePreview: React.FC<{ assets: CampaignAssets }> = ({ assets }) => {
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A');
  
  const landingPage = activeVariant === 'B' && assets.landingPageB ? assets.landingPageB : assets.landingPage;
  const { brand } = assets;
  
  const fontClass = {
    'Sora': 'font-sans',
    'Inter': 'font-inter',
    'Poppins': 'font-poppins',
    'Roboto': 'font-roboto',
    'Lato': 'font-lato',
  }[assets.font || 'Sora'];

  const iconMap: { [key: string]: React.ReactElement } = {
    rocket: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-7.38 5.84m2.56-8.41A6 6 0 0114.37 15.59m-2.56-5.84a6 6 0 015.84 2.56m-8.41-2.56a6 6 0 017.38-5.84m-5.84 8.41a6 6 0 01-2.56 5.84m0 0a6 6 0 01-5.84-2.56m8.41 5.84a6 6 0 01-5.84 2.56m2.56-8.41a6 6 0 01-2.56-5.84m-5.84 5.84a6 6 0 012.56-2.56" /></svg>,
    "shield-check": <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
    star: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
    default: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  };

  return (
    <div className={`bg-slate-850 border border-slate-700/50 rounded-xl overflow-hidden w-full h-full flex flex-col shadow-2xl ${fontClass}`}>
      <div className="p-3 bg-slate-900 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        </div>
        {assets.landingPageB && (
            <div className="flex bg-slate-700 rounded-md p-0.5">
                <button onClick={() => setActiveVariant('A')} className={`px-3 py-1 text-xs rounded ${activeVariant === 'A' ? 'bg-indigo-500 text-white' : 'text-slate-300'}`}>Variant A</button>
                <button onClick={() => setActiveVariant('B')} className={`px-3 py-1 text-xs rounded ${activeVariant === 'B' ? 'bg-indigo-500 text-white' : 'text-slate-300'}`}>Variant B</button>
            </div>
        )}
         <div className="w-16 h-8 flex items-center justify-end">
            {assets.logo && <img src={assets.logo} alt="Brand Logo" className="h-8 w-auto"/>}
        </div>
      </div>
      <div className="overflow-y-auto flex-grow" style={{ backgroundColor: brand.primaryColor, color: brand.textColor }}>
        <div className="h-96 bg-slate-900/20 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: `url(${assets.heroImageUrl})`}}>
            {!assets.heroImageUrl && <span className="text-white/50">Hero Image</span>}
        </div>
        <div className="p-8 md:p-12">
            <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{landingPage.headline}</h1>
            <p className="text-xl md:text-2xl opacity-80 mb-8">{landingPage.subheadline}</p>
            <button className="px-10 py-4 text-lg font-bold rounded-lg shadow-xl transition-transform hover:scale-105" style={{ backgroundColor: brand.secondaryColor, color: brand.textColor === '#FFFFFF' ? brand.primaryColor : '#000000' }}>
                {landingPage.ctaButton}
            </button>
            </div>
            
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mt-20 text-center">
            {landingPage.sections.slice(0,3).map((section, index) => (
                <div key={index} className="p-6 bg-black/10 rounded-xl backdrop-blur-md border border-white/10">
                <div className="flex justify-center items-center mb-4" style={{color: brand.secondaryColor}}>
                    {iconMap[section.icon] || iconMap['default']}
                </div>
                <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                <p className="opacity-80 leading-relaxed">{section.content}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const AssetTabs: React.FC<{ assets: CampaignAssets, onGenerateImage: (prompt: string) => Promise<void> }> = ({ assets, onGenerateImage }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Asset Prompts');
  const tabs: Tab[] = ['Asset Prompts', 'Ad Copy', 'SEO & Tracking'];
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});

  const handleGenerateClick = async (prompt: string, index: number) => {
    setGeneratingImages(prev => ({ ...prev, [index]: true }));
    await onGenerateImage(prompt);
    setGeneratingImages(prev => ({ ...prev, [index]: false }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Asset Prompts':
        return (
          <div className="space-y-6">
            {assets.assetPrompts.map((p, i) => (
              <div key={i}>
                <h4 className="font-bold text-lg text-white">{p.platform}</h4>
                <p className="text-gray-400 font-mono text-sm bg-slate-900 p-3 rounded-md border border-slate-700">{p.prompt}</p>
                {p.platform.includes('Landing Page Hero') && (
                  <button onClick={() => handleGenerateClick(p.prompt, i)} disabled={generatingImages[i]} className="mt-3 text-sm inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-600 transition-all duration-300 transform hover:scale-105">
                    {generatingImages[i] ? 'Generating...' : <><SparklesIcon className="w-4 h-4 mr-2"/> Generate Image</> }
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      case 'Ad Copy':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-white">Facebook</h4>
              <p className="text-slate-400 whitespace-pre-wrap p-3 bg-slate-800 rounded-md border border-slate-700">{assets.adCopy.facebook}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Instagram</h4>
              <p className="text-slate-400 whitespace-pre-wrap p-3 bg-slate-800 rounded-md border border-slate-700">{assets.adCopy.instagram}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">LinkedIn</h4>
              <p className="text-slate-400 whitespace-pre-wrap p-3 bg-slate-800 rounded-md border border-slate-700">{assets.adCopy.linkedin}</p>
            </div>
          </div>
        );
      case 'SEO & Tracking':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-white">SEO Title</h4>
              <p className="text-slate-400">{assets.seo.title}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Meta Description</h4>
              <p className="text-slate-400">{assets.seo.description}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Keywords</h4>
              <p className="text-slate-400">{assets.seo.keywords}</p>
            </div>
            <div className="border-t border-slate-700 pt-6">
              <h4 className="font-bold text-lg text-white">Google Tag Manager ID</h4>
              <p className="text-slate-400 font-mono">{assets.tracking.googleTagManagerId}</p>
            </div>
             <div>
              <h4 className="font-bold text-lg text-white">Facebook Pixel ID</h4>
              <p className="text-slate-400 font-mono">{assets.tracking.facebookPixelId}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-850 border border-slate-700/50 rounded-xl w-full h-full flex flex-col shadow-2xl">
      <div className="flex border-b border-slate-700/50 p-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-indigo-500 text-white'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-6 overflow-y-auto flex-grow">
        {renderTabContent()}
      </div>
    </div>
  );
};


const CampaignPreview: React.FC<CampaignPreviewProps> = ({ assets, onDeploy, onRestart, onGenerateImage, onGenerateVariant }) => {
  return (
    <div className="w-full h-screen max-w-screen-2xl mx-auto p-4 md:p-6 flex flex-col animate-fade-in">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-white text-center sm:text-left">Campaign Canvas: <span className="bg-gradient-to-r from-violet-400 to-indigo-500 text-transparent bg-clip-text">{assets.brand.name}</span></h2>
            <div className="flex flex-wrap justify-center gap-3">
                 {!assets.landingPageB && (
                    <button onClick={onGenerateVariant} className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors duration-200">
                      <BeakerIcon className="w-5 h-5 mr-2"/>
                      Create A/B Test
                    </button>
                  )}
                 <button onClick={onRestart} className="px-5 py-2.5 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-200">
                    Start Over
                </button>
                <button onClick={onDeploy} className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors duration-200 shadow-lg">
                    <SparklesIcon className="w-5 h-5 mr-2"/>
                    Approve & Deploy
                </button>
            </div>
        </header>
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
            <div className="lg:col-span-2 h-full min-h-0">
                 <LandingPagePreview assets={assets} />
            </div>
            <div className="lg:col-span-1 h-full min-h-0">
                 <AssetTabs assets={assets} onGenerateImage={onGenerateImage} />
            </div>
        </div>
    </div>
  );
};

export default CampaignPreview;