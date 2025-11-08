import React, { useState } from 'react';
import type { CampaignAssets } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import BeakerIcon from './icons/BeakerIcon';

interface CampaignPreviewProps {
  assets: CampaignAssets;
  onDeploy: () => void;
  onRestart: () => void;
}

type Tab = 'Instagram Ad' | 'Copy Variants' | 'Video';

const LandingPagePreview: React.FC<{ assets: CampaignAssets }> = ({ assets }) => {
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
          srcDoc={assets.landingPageHtml}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

const AssetTabs: React.FC<{ assets: CampaignAssets }> = ({ assets }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Instagram Ad');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Instagram Ad':
        return (
          <div className="p-4">
            {assets.instagramAdImage ? (
              <img
                src={`data:image/png;base64,${assets.instagramAdImage}`}
                alt="Instagram Ad"
                className="w-full h-auto rounded"
              />
            ) : (
              <div className="text-slate-400 text-center py-8">No image available</div>
            )}
          </div>
        );
      case 'Copy Variants':
        return (
          <div className="p-4">
            <pre className="text-slate-300 whitespace-pre-wrap text-sm">{assets.copyVariants}</pre>
          </div>
        );
      case 'Video':
        return (
          <div className="p-4">
            <div className="text-slate-300">{assets.videoStatus}</div>
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

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ assets, onDeploy, onRestart }) => {
  return (
    <div className="w-full h-screen max-w-screen-2xl mx-auto p-4 md:p-6 flex flex-col animate-fade-in">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-white text-center sm:text-left">Campaign Canvas</h2>
            <div className="flex flex-wrap justify-center gap-3">
                 <button className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors duration-200">
                   <BeakerIcon className="w-5 h-5 mr-2"/>
                   Create A/B Test
                 </button>
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
                 <AssetTabs assets={assets} />
            </div>
        </div>
    </div>
  );
};

export default CampaignPreview;
