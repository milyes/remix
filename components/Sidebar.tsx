
import React from 'react';
import { AppID } from '../types';

interface SidebarProps {
  onAppClick: (id: AppID) => void;
  onMenuClick: () => void;
  activeApp?: AppID;
  icons: Record<AppID, string>;
}

const Sidebar: React.FC<SidebarProps> = ({ onAppClick, onMenuClick, activeApp, icons }) => {
  const apps = [
    { id: 'terminal' as AppID, label: 'Terminal' },
    { id: 'terminal-alt' as AppID, label: 'Terminal 2' },
    { id: 'ai-chat' as AppID, label: 'Chat IA' },
    { id: 'files' as AppID, label: 'Fichiers' },
    { id: 'browser' as AppID, label: 'Navigateur' },
    { id: 'neo-browser' as AppID, label: 'NÉO Explorateur' },
    { id: 'ubuntu-demo' as AppID, label: 'App Démo' },
    { id: 'vlc' as AppID, label: 'Lecteur VLC' },
    { id: 'orbital' as AppID, label: 'Orbital PS4' },
    { id: 'settings' as AppID, label: 'Paramètres' },
    { id: 'about' as AppID, label: 'À propos' },
  ];

  return (
    <div className="w-[68px] h-full flex flex-col items-center py-2 bg-black/30 backdrop-blur-lg border-r border-white/5 z-40">
      <div className="flex flex-col space-y-1">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            title={app.label}
            className={`group relative p-2 transition-all rounded-lg flex items-center justify-center hover:bg-white/10 ${
              activeApp === app.id ? 'bg-white/15' : ''
            }`}
          >
            <img src={icons[app.id]} alt={app.label} className="w-10 h-10 group-active:scale-90 transition-transform" />
            {activeApp === app.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#E95420] rounded-r shadow-[0_0_8px_rgba(233,84,32,0.6)]" />
            )}
            <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {app.label}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-auto mb-2">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-lg transition-all group"
          title="Afficher les applications"
        >
          <img src="https://img.icons8.com/color/48/000000/ubuntu.png" alt="Toutes les apps" className="w-10 h-10 group-active:scale-95 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
