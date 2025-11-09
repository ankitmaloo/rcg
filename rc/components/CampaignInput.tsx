import React, { useState, useRef } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import type { BrandKit, AssetSelection } from '../types';

interface CampaignInputProps {
  onGenerate: (prompt: string, brandKit: BrandKit, assetSelection: AssetSelection) => void;
  error: string | null;
}

const CampaignInput: React.FC<CampaignInputProps> = ({ onGenerate, error }) => {
  const [prompt, setPrompt] = useState('');
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit>({font: 'Sora'});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [assetSelection, setAssetSelection] = useState<AssetSelection>({
    landingPage: true,
    ad: true,
    copies: true,
    video: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, brandKit, assetSelection);
    }
  };
  
  const handleSampleClick = () => {
    const samplePrompt = "A new line of eco-friendly, direct-to-consumer coffee pods made from compostable materials. Target audience is environmentally conscious millennials who value convenience and quality. The brand should feel modern, clean, and trustworthy.";
    setPrompt(samplePrompt);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBrandKit(prev => ({ ...prev, logo: base64String }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center animate-fade-in">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/40 text-violet-300 text-xs md:text-sm mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        AI Landing Page + Brand Kit in under 30 seconds
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-50 mb-4 tracking-tight leading-tight">
        Turn any idea into a
        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 text-transparent bg-clip-text">
          {" "}
          launch-ready campaign
        </span>
      </h1>

      <p className="text-base md:text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
        Paste your product idea and brand details. Get a conversion-optimized landing page, hero visuals,
        and A/B test variants instantly—ready to ship or share with your team.
      </p>

      <div className="relative mb-6">
        <div className="pointer-events-none absolute -top-10 right-10 hidden md:flex items-center gap-2 text-xs text-slate-500">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 border border-slate-900" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-500 border border-slate-900" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 border border-slate-900" />
          </div>
          <span>Teams are prototyping with RCG now</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-3 md:p-4 backdrop-blur-sm focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/40 transition-all shadow-[0_18px_60px_rgba(15,23,42,0.8)]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <SparklesIcon className="w-4 h-4 text-violet-400" />
              <span>Describe your product, audience, and positioning.</span>
            </div>
            <button
              type="button"
              onClick={handleSampleClick}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-[10px] md:text-xs text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/80"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Use expert sample brief
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A new eco-friendly coffee pod brand for busy creatives. Modern, minimal, premium feel. Target CAC-sensitive DTC marketers. Focus on sustainability, ritual, and flavor."
            className="w-full h-40 md:h-44 p-3 md:p-4 bg-transparent text-slate-100 placeholder-slate-600 text-sm md:text-base leading-relaxed focus:outline-none resize-none"
          />
        </div>

        <div className="text-left bg-slate-900/60 border border-slate-800 rounded-2xl transition-all shadow-[0_12px_35px_rgba(15,23,42,0.9)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowBrandKit(!showBrandKit)}
            className="w-full px-4 py-3.5 md:px-5 md:py-4 font-semibold text-left text-slate-200 flex justify-between items-center gap-3"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-slate-50 text-xs">
                BK
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base">Brand Kit (Optional, but powerful)</span>
                <span className="text-[10px] md:text-xs text-slate-500">
                  Drop your logo, choose brand colors, and we’ll adapt every asset to match.
                </span>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 md:w-5 md:h-5 text-slate-400 transition-transform ${showBrandKit ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showBrandKit && (
            <div className="p-4 md:p-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-slate-950/40">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Brand Name</label>
                <input
                  type="text"
                  value={brandKit.name || ''}
                  onChange={e => setBrandKit(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter your brand name"
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-violet-500 focus:border-violet-500 text-slate-100 placeholder-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Logo</label>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm text-center bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 px-4 py-2 rounded-md">
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden"/>
                {logoPreview && <div className="flex justify-center mt-2"><img src={logoPreview} alt="Logo Preview" className="h-16 w-auto bg-white p-1 rounded" /></div>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Font Family</label>
                <select value={brandKit.font} onChange={e => setBrandKit(prev => ({...prev, font: e.target.value as BrandKit['font']}))} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-violet-500 focus:border-violet-500">
                  <option>Sora</option>
                  <option>Inter</option>
                  <option>Poppins</option>
                  <option>Roboto</option>
                  <option>Lato</option>
                </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-300">Primary Color</label>
                 <div className="relative">
                    <input type="text" value={brandKit.primaryColor || '#4338CA'} onChange={e => setBrandKit(prev => ({...prev, primaryColor: e.target.value}))} className="w-full pl-12 p-2 bg-slate-700 border border-slate-600 rounded-md"/>
                    <input type="color" value={brandKit.primaryColor || '#4338CA'} onChange={e => setBrandKit(prev => ({...prev, primaryColor: e.target.value}))} className="w-8 h-8 absolute left-2 top-1/2 -translate-y-1/2"/>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-300">Secondary Color</label>
                 <div className="relative">
                    <input type="text" value={brandKit.secondaryColor || '#FBBF24'} onChange={e => setBrandKit(prev => ({...prev, secondaryColor: e.target.value}))} className="w-full pl-12 p-2 bg-slate-700 border border-slate-600 rounded-md"/>
                    <input type="color" value={brandKit.secondaryColor || '#FBBF24'} onChange={e => setBrandKit(prev => ({...prev, secondaryColor: e.target.value}))} className="w-8 h-8 absolute left-2 top-1/2 -translate-y-1/2"/>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 transition-all shadow-[0_12px_35px_rgba(15,23,42,0.9)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-slate-50 text-xs">
              ✓
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-slate-200">Select Assets to Generate</span>
              <span className="text-[10px] md:text-xs text-slate-500">Choose which campaign assets you want to create</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assetSelection.landingPage}
                onChange={(e) => setAssetSelection(prev => ({ ...prev, landingPage: e.target.checked }))}
                className="w-4 h-4 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
              />
              <span className="text-sm text-slate-300">Landing Page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assetSelection.ad}
                onChange={(e) => setAssetSelection(prev => ({ ...prev, ad: e.target.checked }))}
                className="w-4 h-4 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
              />
              <span className="text-sm text-slate-300">Ad Image</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assetSelection.copies}
                onChange={(e) => setAssetSelection(prev => ({ ...prev, copies: e.target.checked }))}
                className="w-4 h-4 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
              />
              <span className="text-sm text-slate-300">Copy Variants</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assetSelection.video}
                onChange={(e) => setAssetSelection(prev => ({ ...prev, video: e.target.checked }))}
                className="w-4 h-4 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
              />
              <span className="text-sm text-slate-300">Video</span>
            </label>
          </div>
        </div>

        <div className="pt-3 md:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm md:text-base font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-slate-800 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-violet-900/50 transform hover:-translate-y-0.5 hover:scale-[1.01]
"
          >
            <SparklesIcon className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
            Generate full campaign
          </button>
          <button
            type="button"
            onClick={handleSampleClick}
            className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-slate-800/90 text-slate-200 text-sm md:text-base font-medium rounded-xl hover:bg-slate-700 transition-colors duration-200 border border-slate-700/90"
          >
            Use sample brief
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 md:mt-4 text-sm md:text-base text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 md:mt-8 grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-3 md:gap-4 text-[8px] md:text-[10px] text-slate-500 uppercase tracking-[0.16em]">
        <div className="px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          Landing page copy
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          Hero visuals
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          A/B test variants
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          Brand-aligned palette
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          Deploy-ready markup
        </div>
      </div>
    </div>
  );
};

export default CampaignInput;
