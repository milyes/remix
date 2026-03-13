
import React, { useState, useCallback, useEffect } from 'react';
import { AppID, WindowState } from './types';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Window from './components/Window';
import GlobalSearch from './components/GlobalSearch';
import AppMenu from './components/AppMenu';
import Terminal from './components/apps/Terminal';
import FileExplorer from './components/apps/FileExplorer';
import About from './components/apps/About';
import Browser from './components/apps/Browser';
import Settings from './components/apps/Settings';
import NeoBrowser from './components/apps/NeoBrowser';
import UbuntuDemo from './components/apps/UbuntuDemo';
import VLC from './components/apps/VLC';
import Orbital from './components/apps/Orbital';
import AIChat from './components/apps/AIChat';

const App: React.FC = () => {
  const [wallpaper, setWallpaper] = useState('https://picsum.photos/seed/ubuntu/1920/1080');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'terminal', title: 'Terminal - Noyau Gemini', isOpen: true, isMaximized: false, zIndex: 10 },
    { id: 'terminal-alt', title: 'Terminal Secondaire', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'ai-chat', title: 'Chat IA - Assistant Neuronal', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'files', title: 'Explorateur de fichiers', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'browser', title: 'Navigateur Web', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'neo-browser', title: 'NÉO WEB-EXPLORER', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'ubuntu-demo', title: 'Démo API Ubuntu', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'vlc', title: 'Lecteur Média VLC', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'orbital', title: 'Émulateur Orbital PS4', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'settings', title: 'Paramètres', isOpen: false, isMaximized: false, zIndex: 1 },
    { id: 'about', title: "À propos d'Ubuntu Intelligence", isOpen: false, isMaximized: false, zIndex: 1 },
  ]);
  const [highestZ, setHighestZ] = useState(10);
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);

  const [appIcons, setAppIcons] = useState<Record<AppID, string>>({
    'terminal': 'https://img.icons8.com/color/48/000000/terminal.png',
    'terminal-alt': 'https://img.icons8.com/color/48/000000/terminal.png',
    'ai-chat': 'https://img.icons8.com/fluency/48/robot-2.png',
    'files': 'https://img.icons8.com/color/48/000000/folder-invoices.png',
    'browser': 'https://img.icons8.com/color/48/000000/firefox.png',
    'neo-browser': 'https://img.icons8.com/fluency/48/internet.png',
    'ubuntu-demo': 'https://img.icons8.com/fluency/48/code.png',
    'vlc': 'https://img.icons8.com/color/48/000000/vlc.png',
    'orbital': 'https://img.icons8.com/fluency/48/controller.png',
    'settings': 'https://img.icons8.com/color/48/000000/settings.png',
    'about': 'https://img.icons8.com/color/48/000000/info--v1.png',
  });

  const handleIconChange = (appId: AppID, newIconUrl: string) => {
    setAppIcons(prev => ({ ...prev, [appId]: newIconUrl }));
    addNotification(`L'icône de ${appId} a été mise à jour.`);
  };

  const addNotification = useCallback((text: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const toggleApp = useCallback((id: AppID) => {
    setWindows(prev => {
      const exists = prev.find(w => w.id === id);
      const newHighestZ = highestZ + 1;
      setHighestZ(newHighestZ);

      if (exists) {
        return prev.map(w => w.id === id ? { ...w, isOpen: true, zIndex: newHighestZ } : w);
      } else {
        const defaultTitle = id.charAt(0).toUpperCase() + id.slice(1);
        return [...prev, { id, title: defaultTitle, isOpen: true, isMaximized: false, zIndex: newHighestZ }];
      }
    });
  }, [highestZ]);

  const closeWindow = (id: AppID) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const maximizeWindow = (id: AppID) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const focusWindow = (id: AppID) => {
    if (windows.find(w => w.id === id)?.zIndex === highestZ) return;
    const newHighestZ = highestZ + 1;
    setHighestZ(newHighestZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newHighestZ } : w));
  };

  const getActiveApp = (): AppID | undefined => {
    const openWindows = windows.filter(w => w.isOpen).sort((a, b) => b.zIndex - a.zIndex);
    return openWindows.length > 0 ? openWindows[0].id : undefined;
  };

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        if (isAppMenuOpen) setIsAppMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [isSearchOpen, isAppMenuOpen]);

  useEffect(() => {
    addNotification("Intelligence Système initialisée. Le Chat IA est disponible.");
  }, [addNotification]);

  return (
    <div 
        className="h-screen w-screen flex flex-col overflow-hidden transition-all duration-1000 ease-in-out"
        style={{ 
            backgroundImage: `url('${wallpaper}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
      <TopBar onSearchClick={() => setIsSearchOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          onAppClick={toggleApp} 
          onMenuClick={() => setIsAppMenuOpen(!isAppMenuOpen)} 
          activeApp={getActiveApp()} 
          icons={appIcons} 
        />
        
        <main className="flex-1 relative overflow-hidden">
          {windows.map(window => (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              isOpen={window.isOpen}
              isMaximized={window.isMaximized}
              zIndex={window.zIndex}
              onClose={() => closeWindow(window.id)}
              onMaximize={() => maximizeWindow(window.id)}
              onFocus={() => focusWindow(window.id)}
              icon={appIcons[window.id]}
            >
              {window.id === 'terminal' && <Terminal onAppOpen={toggleApp} addNotification={addNotification} />}
              {window.id === 'terminal-alt' && <Terminal onAppOpen={toggleApp} addNotification={addNotification} />}
              {window.id === 'ai-chat' && <AIChat />}
              {window.id === 'files' && <FileExplorer />}
              {window.id === 'about' && <About />}
              {window.id === 'browser' && <Browser />}
              {window.id === 'neo-browser' && <NeoBrowser />}
              {window.id === 'ubuntu-demo' && <UbuntuDemo />}
              {window.id === 'vlc' && <VLC />}
              {window.id === 'orbital' && <Orbital />}
              {window.id === 'settings' && (
                <Settings 
                    currentWallpaper={wallpaper} 
                    onWallpaperChange={(url) => {
                        setWallpaper(url);
                        addNotification("Arrière-plan du bureau mis à jour.");
                    }} 
                    appIcons={appIcons}
                    onIconChange={handleIconChange}
                />
              )}
            </Window>
          ))}
          
          <GlobalSearch 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
            onSelect={toggleApp} 
          />

          <AppMenu 
            isOpen={isAppMenuOpen}
            onClose={() => setIsAppMenuOpen(false)}
            onAppSelect={toggleApp}
            icons={appIcons}
          />

          {/* Notifications Area */}
          <div className="absolute top-4 right-4 z-[100] flex flex-col space-y-2 pointer-events-none">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/10 shadow-xl animate-in fade-in slide-in-from-right-full duration-300 pointer-events-auto"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#E95420] rounded-full flex items-center justify-center text-[10px] font-bold">!</div>
                  <span className="text-sm font-medium">{n.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 z-0" onContextMenu={(e) => e.preventDefault()}>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
