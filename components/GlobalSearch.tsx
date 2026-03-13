
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppID, SearchResult } from '../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (appId: AppID) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchData: SearchResult[] = useMemo(() => [
    { id: 'app-terminal', type: 'app', label: 'Terminal', appId: 'terminal', icon: 'https://img.icons8.com/color/48/000000/terminal.png', description: 'Shell Principal IA Gemini' },
    { id: 'app-terminal-alt', type: 'app', label: 'Terminal 2', appId: 'terminal-alt', icon: 'https://img.icons8.com/color/48/000000/terminal.png', description: 'Instance de Terminal Secondaire' },
    { id: 'app-aichat', type: 'app', label: 'Chat IA', appId: 'ai-chat', icon: 'https://img.icons8.com/fluency/48/robot-2.png', description: 'Assistant IA dédié' },
    { id: 'app-files', type: 'app', label: 'Fichiers', appId: 'files', icon: 'https://img.icons8.com/color/48/000000/folder-invoices.png', description: 'Gestionnaire de fichiers Nautilus' },
    { id: 'app-browser', type: 'app', label: 'Navigateur Web', appId: 'browser', icon: 'https://img.icons8.com/color/48/000000/firefox.png', description: 'Navigateur Web Firefox' },
    { id: 'app-neo', type: 'app', label: 'NÉO Explorateur', appId: 'neo-browser', icon: 'https://img.icons8.com/fluency/48/internet.png', description: 'Explorateur Cyber-Intelligence' },
    { id: 'app-demo', type: 'app', label: 'App Démo', appId: 'ubuntu-demo', icon: 'https://img.icons8.com/fluency/48/code.png', description: 'Vitrine de composants React' },
    { id: 'app-vlc', type: 'app', label: 'Lecteur VLC', appId: 'vlc', icon: 'https://img.icons8.com/color/48/000000/vlc.png', description: 'Lecteur et streamer multimédia' },
    { id: 'app-orbital', type: 'app', label: 'Orbital PS4', appId: 'orbital', icon: 'https://img.icons8.com/fluency/48/controller.png', description: 'Émulateur matériel PS4' },
    { id: 'app-settings', type: 'app', label: 'Paramètres', appId: 'settings', icon: 'https://img.icons8.com/color/48/000000/settings.png', description: 'Configuration du système' },
    { id: 'app-about', type: 'app', label: 'À propos', appId: 'about', icon: 'https://img.icons8.com/color/48/000000/info--v1.png', description: 'Informations système' },
    { id: 'file-log', type: 'file', label: 'system_log.txt', appId: 'files', description: 'Fichier log dans /home/ubuntu/Documents' },
    { id: 'file-config', type: 'file', label: 'neural_net_config.json', appId: 'files', description: 'Config dans /home/ubuntu/AI_Assets' },
    { id: 'set-wall', type: 'setting', label: 'Changer le fond d\'écran', appId: 'settings', description: "Paramètres d'apparence" },
    { id: 'set-theme', type: 'setting', label: 'Mode Sombre', appId: 'settings', description: 'Thèmes système' },
  ], []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchData.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  }, [query, searchData]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      if (filteredResults[selectedIndex]) {
        onSelect(filteredResults[selectedIndex].appId);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-[#2D2D2D]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200"
      >
        <div className="flex items-center p-4 border-b border-white/5 bg-white/5">
          <svg className="w-6 h-6 text-[#E95420] mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-white/30 font-medium"
            placeholder="Rechercher des applications, fichiers ou paramètres..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center space-x-2 text-[10px] text-white/40 font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded">
            <span>ESC</span>
          </div>
        </div>

        <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
          {query.trim() === '' ? (
            <div className="p-10 text-center text-white/40">
              <div className="text-4xl mb-4 opacity-20">🔎</div>
              <p className="text-sm italic">Commencez à taper pour rechercher dans l'écosystème Intelligence.</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-10 text-center text-white/40">
              <p className="text-sm">Aucun résultat trouvé pour "{query}"</p>
            </div>
          ) : (
            <div className="px-2">
              {filteredResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelect(result.appId);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center p-4 rounded-xl transition-all duration-150 text-left group mb-1 ${
                    index === selectedIndex ? 'bg-[#E95420] text-white' : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-4 bg-black/20 ${index === selectedIndex ? 'bg-white/20' : ''}`}>
                    {result.type === 'app' ? (
                      <img src={result.icon} className="w-8 h-8" alt="" />
                    ) : (
                      <span className="text-2xl w-8 h-8 flex items-center justify-center">
                        {result.type === 'file' ? '📄' : '⚙️'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{result.label}</div>
                    <div className={`text-xs ${index === selectedIndex ? 'text-white/80' : 'text-white/40'}`}>
                      {result.description}
                    </div>
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-black/20 ${
                    index === selectedIndex ? 'text-white' : 'text-white/30'
                  }`}>
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 bg-black/20 border-t border-white/5 flex items-center justify-between text-[11px] text-white/30">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><span className="bg-white/10 px-1 rounded mr-1">↑↓</span> Naviguer</span>
            <span className="flex items-center"><span className="bg-white/10 px-1 rounded mr-1">Enter</span> Ouvrir</span>
          </div>
          <span>Interface de Recherche Ubuntu 24.04</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
