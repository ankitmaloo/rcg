import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface LoaderProps {
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
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


  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="relative w-24 h-24 flex items-center justify-center">
            <span className="absolute inset-0 border-2 border-slate-700 rounded-full"></span>
            <span className="absolute inset-2 border-2 border-slate-700 rounded-full animate-spin-slow"></span>
            <span className="absolute inset-4 border-2 border-violet-500 rounded-full animate-spin-reverse-slow"></span>
            <SparklesIcon className="w-8 h-8 text-violet-400 animate-pulse"/>
        </div>
      <h2 className="text-2xl font-semibold text-white mt-8">{text || "Generating Your Campaign"}</h2>
      <p className="text-slate-400 mt-2">{!text && message}</p>
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