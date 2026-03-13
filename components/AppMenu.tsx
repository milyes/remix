
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppID } from '../types';

interface AppMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAppSelect: (id: AppID) => void;
  icons: Record<AppID, string>;
}

const allApps = [
  { id: 'terminal' as AppID, label: 'Terminal', description: 'Terminal IA Gemini' },
  { id: 'terminal-alt' as AppID, label: 'Terminal 2', description: 'Terminal Secondaire' },
  { id: 'ai-chat' as AppID, label: 'Chat IA', description: 'Assistant Neuronal' },
  { id: 'files' as AppID, label: 'Fichiers', description: 'Gestionnaire Nautilus' },
  { id: 'browser' as AppID, label: 'Navigateur', description: 'Firefox Ubuntu' },
  { id: 'neo-browser' as AppID, label: 'NÉO Explorateur', description: 'Intelligence Web' },
  { id: 'ubuntu-demo' as AppID, label: 'App Démo', description: 'Composants Ubuntu' },
  { id: 'vlc' as AppID, label: 'Lecteur VLC', description: 'Multimédia' },
  { id: 'orbital' as AppID, label: 'Orbital PS4', description: 'Émulateur PS4' },
  { id: 'settings' as AppID, label: 'Paramètres', description: 'Configuration' },
  { id: 'about' as AppID, label: 'À propos', description: 'Infos système' },
];

const AppMenu: React.FC<AppMenuProps> = ({ isOpen, onClose, onAppSelect, icons }) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredApps = useMemo(() => {
    return allApps.filter(app => 
      app.label.toLowerCase().includes(search.toLowerCase()) || 
      app.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-2xl flex flex-col items-center animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Search Bar */}
      <div className="mt-20 mb-12 w-full max-w-xl px-4 animate-in slide-in-from-top-8 duration-500">
        <div className="relative group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#E95420] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            ref={inputRef}
            type="text"
            placeholder="Rechercher..."
            className="w-full bg-white/10 border border-white/5 rounded-full py-3 pl-12 pr-6 text-white text-lg outline-none focus:bg-white/15 focus:border-[#E95420]/50 focus:ring-4 focus:ring-[#E95420]/10 transition-all placeholder:text-white/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
        </div>
      </div>

      {/* Apps Grid */}
      <div className="flex-1 w-full max-w-5xl px-8 pb-20 overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-500">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                onAppSelect(app.id);
                onClose();
              }}
              className="flex flex-col items-center group space-y-3 p-4 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
            >
              <div className="relative">
                <img 
                  src={icons[app.id]} 
                  alt={app.label} 
                  className="w-16 h-16 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white font-medium text-sm group-hover:text-[#E95420] transition-colors">{app.label}</span>
                <span className="text-white/30 text-[10px] uppercase tracking-wider font-bold mt-0.5">{app.description}</span>
              </div>
            </button>
          ))}
        </div>
        
        {filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 text-white/30">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-lg italic">Aucune application correspondante</p>
          </div>
        )}
      </div>

      {/* Footer Indicator */}
      <div className="pb-8 animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};

export default AppMenu;
