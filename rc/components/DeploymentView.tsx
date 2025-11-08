import React, { useState, useCallback } from 'react';
import type { CampaignAssets, LandingPageContent } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import CodeIcon from './icons/CodeIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface DeploymentViewProps {
  assets: CampaignAssets;
  onRestart: () => void;
}

const generateLandingPageHtml = (landingPage: LandingPageContent, brand: CampaignAssets['brand'], id: string, extraStyles: string = '') => {
  const iconMap: { [key: string]: string } = {
    rocket: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-7.38 5.84m2.56-8.41A6 6 0 0114.37 15.59m-2.56-5.84a6 6 0 015.84 2.56m-8.41-2.56a6 6 0 017.38-5.84m-5.84 8.41a6 6 0 01-2.56 5.84m0 0a6 6 0 01-5.84-2.56m8.41 5.84a6 6 0 01-5.84 2.56m2.56-8.41a6 6 0 01-2.56-5.84m-5.84 5.84a6 6 0 012.56-2.56" /></svg>`,
    "shield-check": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>`,
    default: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  };

  const sectionsHtml = landingPage.sections.slice(0,3).map(section => `
    <div class="p-6 bg-white/10 rounded-lg backdrop-blur-sm">
      <div class="flex justify-center items-center mb-4" style="color: ${brand.secondaryColor};">
        ${iconMap[section.icon] || iconMap['default']}
      </div>
      <h3 class="text-2xl font-bold mb-2">${section.title}</h3>
      <p class="opacity-80">${section.content}</p>
    </div>
  `).join('');

  return `<div id="${id}" style="${extraStyles}">
        <div class="max-w-4xl mx-auto text-center py-16 md:py-24">
            <h1 class="text-4xl md:text-6xl font-extrabold mb-4">${landingPage.headline}</h1>
            <p class="text-xl md:text-2xl opacity-80 mb-8">${landingPage.subheadline}</p>
            <a href="#" class="inline-block px-10 py-4 text-lg font-bold rounded-lg shadow-xl" style="background-color: ${brand.secondaryColor}; color: ${brand.textColor === '#FFFFFF' ? brand.primaryColor : '#000000'};">
                ${landingPage.ctaButton}
            </a>
        </div>
        
        <div class="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 pb-16 text-center">
            ${sectionsHtml}
        </div>
    </div>`;
}

const generateFullHtml = (assets: CampaignAssets): string => {
  const { brand, landingPage, landingPageB, seo, tracking, heroImageUrl, font, logo } = assets;

  if (!landingPage) {
    return '<!-- Landing page content is missing -->';
  }

  const fontName = font || 'Sora';
  const fontClass = {
    'Sora': 'font-sans', 'Inter': 'font-inter', 'Poppins': 'font-poppins', 'Roboto': 'font-roboto', 'Lato': 'font-lato',
  }[fontName];
  
  const landingPageAHtml = generateLandingPageHtml(landingPage, brand, 'variant-a');
  const landingPageBHtml = landingPageB ? generateLandingPageHtml(landingPageB, brand, 'variant-b', 'display: none;') : '';
  
  const abTestScript = landingPageB ? `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const isVariantB = Math.random() < 0.5;
        const variantA = document.getElementById('variant-a');
        const variantB = document.getElementById('variant-b');
        if (isVariantB) {
          variantA.style.display = 'none';
          variantB.style.display = 'block';
        }
      });
    </script>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta name="keywords" content="${seo.keywords}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Inter:wght@400;700;800&family=Lato:wght@400;700;900&family=Poppins:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = { theme: { extend: { fontFamily: { sans: ['Sora', 'sans-serif'], 'inter': ['Inter', 'sans-serif'], 'poppins': ['Poppins', 'sans-serif'], 'roboto': ['Roboto', 'sans-serif'], 'lato': ['Lato', 'sans-serif'] } } } }
    </script>
    <style> body { font-family: '${fontName}', sans-serif; } </style>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${tracking.googleTagManagerId}');</script>
    <!-- End Google Tag Manager -->
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${tracking.facebookPixelId}');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${tracking.facebookPixelId}&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
    ${abTestScript}
</head>
<body class="${fontClass}" style="background-color: ${brand.primaryColor}; color: ${brand.textColor};">
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${tracking.googleTagManagerId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

    <header class="p-6">
      <nav class="max-w-5xl mx-auto">
        ${logo ? `<img src="${logo}" alt="${brand.name} Logo" class="h-10 w-auto"/>` : `<span>${brand.name}</span>`}
      </nav>
    </header>
    
    <main>
      <div class="h-96 min-h-[30vh] bg-gray-900/20 bg-cover bg-center" style="background-image: url(${heroImageUrl || ''})"></div>
      <div class="p-6 md:p-10">
        ${landingPageAHtml}
        ${landingPageBHtml}
      </div>
    </main>
</body>
</html>`;
};

const DeploymentView: React.FC<DeploymentViewProps> = ({ assets, onRestart }) => {
  const [copied, setCopied] = useState(false);
  const [copiedVariant, setCopiedVariant] = useState(false);

  const baseHtml = assets.landingPageHtml
    ?? (assets.landingPage ? generateFullHtml(assets) : '<!-- Landing page HTML unavailable -->');
  const variantHtml = assets.landingPageBHtml
    ?? (assets.landingPageB ? generateLandingPageHtml(assets.landingPageB, assets.brand, 'variant-b') : undefined);
  const subdomain = `${assets.brand.name.toLowerCase().replace(/\s+/g, '-')}.campaign.site`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(baseHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [baseHtml]);

  const handleVariantCopy = useCallback(() => {
    if (!variantHtml) return;
    navigator.clipboard.writeText(variantHtml);
    setCopiedVariant(true);
    setTimeout(() => setCopiedVariant(false), 2000);
  }, [variantHtml]);

  return (
    <div className="w-full max-w-4xl text-center animate-fade-in">
       <div className="flex flex-col items-center justify-center mb-6">
        <CheckCircleIcon className="w-20 h-20 text-green-400 mb-4"/>
        <h2 className="text-4xl font-bold text-slate-100 mb-2">Campaign Deployed!</h2>
        <p className="text-lg text-slate-400 mb-6">Your campaign page is now live (simulated).</p>
      </div>
      <a href="#" onClick={(e) => e.preventDefault()} className="text-xl font-mono bg-slate-800 text-indigo-400 px-4 py-2 rounded-lg border border-slate-700 hover:border-indigo-500 transition-colors">
        https://{subdomain}
      </a>
      
      <div className="text-left bg-slate-850 border border-slate-700/50 rounded-xl mt-8 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-slate-900 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
                <CodeIcon className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">index.html</span>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-700 rounded-md hover:bg-slate-600 transition-colors duration-200">
                <ClipboardIcon className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto max-h-96 bg-slate-850/50">
            <code className="language-html">{baseHtml}</code>
          </pre>
      </div>

      {variantHtml && (
        <div className="text-left bg-slate-850 border border-slate-700/50 rounded-xl mt-6 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-slate-900 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
                <CodeIcon className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">variant-b.html</span>
            </div>
            <button onClick={handleVariantCopy} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-700 rounded-md hover:bg-slate-600 transition-colors duration-200">
                <ClipboardIcon className="w-4 h-4" />
                {copiedVariant ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto max-h-96 bg-slate-850/50">
            <code className="language-html">{variantHtml}</code>
          </pre>
        </div>
      )}

      <button onClick={onRestart} className="mt-8 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg transform hover:scale-105">
          Create Another Campaign
      </button>
    </div>
  );
};

export default DeploymentView;
