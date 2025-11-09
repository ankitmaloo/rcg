import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  html?: string;
}

const LandingPageFullView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const htmlContent = (location.state as LocationState)?.html || null;

  if (!htmlContent) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-center">
          <h2 className="text-xl font-semibold mb-2">No Content Found</h2>
          <p className="text-sm mb-4">The landing page content could not be loaded.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950">
      <div className="px-4 py-3 bg-slate-900/85 backdrop-blur border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="text-sm text-slate-400 uppercase tracking-[0.16em]">Full Page Preview</div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          title="Full Landing Page View"
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default LandingPageFullView;
