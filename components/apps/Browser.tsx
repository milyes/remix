
import React, { useState, useRef, useEffect } from 'react';

const Browser: React.FC = () => {
  const defaultUrl = 'https://www.wikipedia.org';
  const [urlInput, setUrlInput] = useState(defaultUrl);
  const [iframeUrl, setIframeUrl] = useState(defaultUrl);
  const [history, setHistory] = useState<string[]>([defaultUrl]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (url: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl) return;
    
    setIsLoading(true);
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    setIframeUrl(formattedUrl);
    setUrlInput(formattedUrl);
    setHistory(prev => {
      const newHistory = [formattedUrl, ...prev.filter(item => item !== formattedUrl)];
      return newHistory.slice(0, 20);
    });
    setIsHistoryOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigateTo(urlInput);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const clearHistory = () => {
    setHistory([iframeUrl]);
    setIsHistoryOpen(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(urlInput);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL: ', err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none relative">
      {/* Browser Toolbar */}
      <div className="h-12 bg-[#F2F2F2] border-b border-gray-300 flex items-center px-2 space-x-2 shrink-0 relative z-20">
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button 
            onClick={() => window.history.back()}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            title="Précédent"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => window.history.forward()}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            title="Suivant"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            onClick={() => {
              setIsLoading(true);
              const current = iframeUrl;
              setIframeUrl('');
              setTimeout(() => setIframeUrl(current), 10);
            }}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            title="Actualiser"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Address Bar */}
        <div className={`flex-1 flex items-center bg-white border rounded-full px-3 py-1 shadow-sm transition-all ${
          isLoading ? 'border-[#E95420]/50 ring-1 ring-[#E95420]/10' : 'border-gray-300 focus-within:ring-2 focus-within:ring-[#E95420]/30 focus-within:border-[#E95420]'
        }`}>
          <div className="mr-2 shrink-0">
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-[#E95420] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleCopyUrl}
            className={`p-1 rounded-full transition-colors duration-200 ml-2 ${
                isCopied ? 'text-green-500' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={isCopied ? "Copié !" : "Copier l'URL"}
          >
            {isCopied ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
          </button>
        </div>

        {/* History Button */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors ${isHistoryOpen ? 'bg-gray-200' : ''}`}
            title="Historique"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {isHistoryOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historique de navigation</span>
                <button 
                  onClick={clearHistory}
                  className="text-[10px] text-[#E95420] hover:underline font-medium"
                >
                  Tout effacer
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto no-scrollbar">
                {history.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400 italic">Aucun historique</div>
                ) : (
                  history.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigateTo(url)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors truncate border-b border-gray-50 last:border-0"
                      title={url}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        <span className="truncate text-gray-700">{url}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigateTo(defaultUrl)}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
          title="Accueil"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* Enhanced Progress Bar (Ubuntu Style) */}
      <div className="absolute top-12 left-0 w-full h-1 z-30 overflow-hidden bg-gray-200/30">
        <div 
          className={`h-full bg-gradient-to-r from-[#E95420] via-[#ff7e54] to-[#E95420] transition-all duration-500 ease-out ${isLoading ? 'opacity-100' : 'w-0 opacity-0'}`}
          style={{ 
            width: isLoading ? '100%' : '0%',
            animation: isLoading ? 'loading-progress-move 1.5s infinite linear' : 'none',
            backgroundSize: '200% 100%'
          }}
        ></div>
      </div>

      <style>{`
        @keyframes loading-progress-move {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Security Info Bar */}
      <div className="bg-[#FFF9C4] text-[10px] px-4 py-0.5 text-[#827717] font-medium border-b border-[#FBC02D]/20 flex justify-between shrink-0">
        <span>Certains sites peuvent bloquer l'intégration. Essayez Wikipedia ou Archive.org.</span>
        <span className="hidden sm:inline italic">Noyau Intelligence Firefox Ubuntu v1.1</span>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-100 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-10 transition-opacity duration-300">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/90 shadow-2xl border border-white/50 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 border-4 border-[#E95420] border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-4 text-[11px] font-bold text-gray-500 uppercase tracking-[3px] animate-pulse">Synchronisation...</span>
            </div>
          </div>
        )}
        <iframe 
          src={iframeUrl}
          className={`w-full h-full border-none bg-white transition-opacity duration-700 ${isLoading ? 'opacity-20 grayscale' : 'opacity-100 grayscale-0'}`}
          onLoad={handleLoad}
          title="Browser Content"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

export default Browser;
