
import React, { useState, useRef, useEffect } from 'react';

const NeoBrowser: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [src, setSrc] = useState('https://example.com');
  const [status, setStatus] = useState('Prêt – Entrez une URL et appuyez sur GO');
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadUrl = () => {
    let targetUrl = url.trim();
    if (!targetUrl) return;

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
      setUrl(targetUrl);
    }

    setStatus(`Chargement : ${targetUrl} ...`);
    setErrorVisible(false);
    setSrc(targetUrl);

    setTimeout(() => {
        setStatus(`Connecté → ${targetUrl}`);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') loadUrl();
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setSrc(prev => '');
      setTimeout(() => setSrc(url), 10);
    }
  };

  const handleHome = () => {
    setUrl('https://example.com');
    setSrc('https://example.com');
    setStatus('Connecté → https://example.com');
    setErrorVisible(false);
  };

  const handleCopyUrl = async () => {
    if (!url) return;
    try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error("Failed to copy URL:", err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    loadUrl();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-[#e0e0e0] font-mono overflow-hidden relative" style={{
        backgroundImage: 'linear-gradient(rgba(0,143,17,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,143,17,0.08) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
    }}>
      <style>{`
        .neo-glow-text { text-shadow: 0 0 12px rgba(0,255,65,0.6); }
        .neo-button:hover { box-shadow: 0 0 12px rgba(0,255,65,0.6); }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] border-b-2 border-[#333] shadow-lg z-10 shrink-0">
        <div className="text-[#00ff41] font-bold text-lg neo-glow-text whitespace-nowrap hidden md:block">
          [ NÉO IA22 ] WEB-EXPLORER CORE V1
        </div>
        <div className="flex-1 flex items-center bg-black border border-[#008f11] text-[#00ff41] rounded transition-all focus-within:border-[#00ff41] focus-within:shadow-[0_0_12px_rgba(0,255,65,0.6)]">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="flex-1 p-2 bg-transparent outline-none font-mono text-[#00ff41]"
            />
            <button
              onClick={handleCopyUrl}
              title={isCopied ? "Copié!" : "Copier URL"}
              className="p-2 text-[#008f11] hover:text-[#00ff41] transition-colors"
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
        <button onClick={loadUrl} className="bg-[#008f11] hover:bg-[#00ff41] hover:text-black text-white px-4 py-2 rounded font-bold transition-all neo-button">GO</button>
        <button onClick={handleRefresh} className="bg-[#444] hover:bg-[#666] text-white px-3 py-2 rounded font-bold transition-all">↻</button>
        <button onClick={handleHome} className="bg-[#008f11] hover:bg-[#00ff41] hover:text-black text-white px-3 py-2 rounded font-bold transition-all neo-button">HOME</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <iframe 
          ref={iframeRef}
          src={src}
          className="w-full h-full border-none bg-black"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          title="Neo Browser Frame"
        />
        
        {/* Status Bar */}
        <div className="absolute bottom-3 left-5 bg-black/70 px-4 py-2 rounded border border-[#333] text-[#00ff41] text-sm pointer-events-none max-w-[80%] truncate">
          {status}
        </div>

        {/* Error Overlay */}
        {errorVisible && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-[#ff2a6d] text-center p-10 z-20">
                <h1 className="text-2xl font-bold mb-5 neo-glow-text">ACCÈS BLOQUÉ / ERREUR</h1>
                <p className="mb-6 text-[#ccc] leading-relaxed max-w-lg" dangerouslySetInnerHTML={{ __html: errorMsg }}></p>
                <button 
                    onClick={() => setErrorVisible(false)}
                    className="bg-[#008f11] hover:bg-[#00ff41] hover:text-black text-white px-6 py-2 rounded font-bold transition-all neo-button"
                >
                    Retour
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default NeoBrowser;
