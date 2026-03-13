import React, { useState } from 'react';
import { AppID } from '../../types';

interface SettingsProps {
  currentWallpaper: string;
  onWallpaperChange: (url: string) => void;
  appIcons: Record<AppID, string>;
  onIconChange: (appId: AppID, newIconUrl: string) => void;
}

const wallpapers = [
    { name: 'Ubuntu Noble', url: 'https://picsum.photos/seed/ubuntu/1920/1080' },
    { name: 'Abstrait Sombre', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Nature', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Minimaliste', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80' },
];

const appInfo: { id: AppID; name: string }[] = [
    { id: 'terminal', name: 'Terminal' },
    { id: 'terminal-alt', name: 'Terminal 2' },
    { id: 'ai-chat', name: 'Chat IA' },
    { id: 'files', name: 'Fichiers' },
    { id: 'browser', name: 'Navigateur' },
    { id: 'neo-browser', name: 'NÉO Explorateur' },
    { id: 'ubuntu-demo', name: 'App Démo' },
    { id: 'vlc', name: 'Lecteur VLC' },
    { id: 'orbital', name: 'Orbital PS4' },
    { id: 'settings', name: 'Paramètres' },
    { id: 'about', name: 'À propos' },
];

const iconPresets: Record<AppID, string[]> = {
  terminal: ['https://img.icons8.com/fluency/48/console.png', 'https://img.icons8.com/color/48/console.png', 'https://img.icons8.com/plasticine/100/console.png'],
  'terminal-alt': ['https://img.icons8.com/fluency/48/console.png', 'https://img.icons8.com/color/48/console.png', 'https://img.icons8.com/plasticine/100/console.png'],
  'ai-chat': ['https://img.icons8.com/ios/50/artificial-intelligence.png', 'https://img.icons8.com/nolan/64/bot.png', 'https://img.icons8.com/pulsar-line/48/bot.png'],
  files: ['https://img.icons8.com/fluent/48/000000/folder-invoices.png', 'https://img.icons8.com/dusk/64/open-box.png', 'https://img.icons8.com/nolan/64/folder-invoices.png'],
  browser: ['https://img.icons8.com/color/48/chrome.png', 'https://img.icons8.com/fluency/48/safari.png', 'https://img.icons8.com/color/48/brave-web-browser.png'],
  'neo-browser': ['https://img.icons8.com/nolan/64/globe.png', 'https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-browser-network-and-cloud-computing-flatart-icons-outline-flatarticons.png', 'https://img.icons8.com/arcade/64/globe.png'],
  'ubuntu-demo': ['https://img.icons8.com/fluency/48/source-code.png', 'https://img.icons8.com/color/48/code.png', 'https://img.icons8.com/nolan/64/react-native.png'],
  vlc: ['https://img.icons8.com/nolan/64/vlc.png', 'https://img.icons8.com/plasticine/100/vlc.png', 'https://img.icons8.com/dusk/64/vlc.png'],
  orbital: ['https://img.icons8.com/color/48/playstation-buttons.png', 'https://img.icons8.com/nolan/64/controller.png', 'https://img.icons8.com/arcade/64/controller.png'],
  settings: ['https://img.icons8.com/nolan/64/settings.png', 'https://img.icons8.com/arcade/64/settings.png', 'https://img.icons8.com/plasticine/100/settings.png'],
  about: ['https://img.icons8.com/nolan/64/info.png', 'https://img.icons8.com/arcade/64/info.png', 'https://img.icons8.com/plasticine/100/info.png'],
};

const IconCustomizerModal: React.FC<{
  app: { id: AppID; name: string };
  currentIcon: string;
  onSave: (url: string) => void;
  onClose: () => void;
}> = ({ app, currentIcon, onSave, onClose }) => {
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);
  const [customUrl, setCustomUrl] = useState('');

  const handleSave = () => {
    onSave(customUrl || selectedIcon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg text-gray-800" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4">Personnaliser l'icône pour "{app.name}"</h3>
        
        <h4 className="text-sm font-bold text-gray-500 mb-2">Icônes prédéfinies</h4>
        <div className="flex gap-4 p-2 bg-gray-100 rounded-md">
          {/* FIX: Replaced undefined 'appIcons' with the 'currentIcon' prop and used a Set to prevent duplicates. */}
          {[...new Set([currentIcon, ...iconPresets[app.id]])].map(iconUrl => (
            <img 
              key={iconUrl}
              src={iconUrl} 
              alt="preset" 
              className={`w-12 h-12 p-1 rounded-md cursor-pointer border-2 transition-all ${selectedIcon === iconUrl ? 'border-[#E95420]' : 'border-transparent hover:border-gray-300'}`}
              onClick={() => { setSelectedIcon(iconUrl); setCustomUrl(''); }}
            />
          ))}
        </div>

        <h4 className="text-sm font-bold text-gray-500 mt-4 mb-2">URL personnalisée</h4>
        <input 
          type="text"
          placeholder="https://example.com/icon.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#E95420]"
          value={customUrl}
          onChange={(e) => {
            setCustomUrl(e.target.value);
            if(e.target.value) setSelectedIcon(e.target.value);
          }}
        />
        
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-[#E95420] hover:bg-[#d94410] rounded-md transition-colors">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({ currentWallpaper, onWallpaperChange, appIcons, onIconChange }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [modalApp, setModalApp] = useState<{ id: AppID; name: string } | null>(null);

  const handleSaveIcon = (url: string) => {
    if (modalApp) {
      onIconChange(modalApp.id, url);
    }
    setModalApp(null);
  };

  return (
    <div className="h-full bg-white text-gray-800 flex flex-col md:flex-row">
      {modalApp && (
        <IconCustomizerModal 
          app={modalApp} 
          currentIcon={appIcons[modalApp.id]}
          onSave={handleSaveIcon}
          onClose={() => setModalApp(null)}
        />
      )}
      <div className="w-full md:w-56 bg-[#F7F7F7] border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold mb-6 text-gray-700 px-2">Paramètres</h2>
        <ul className="space-y-1">
          <li onClick={() => setActiveTab('appearance')} className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-colors ${activeTab === 'appearance' ? 'bg-[#E95420] text-white' : 'hover:bg-gray-200'}`}>Apparence</li>
          <li onClick={() => setActiveTab('icons')} className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-colors ${activeTab === 'icons' ? 'bg-[#E95420] text-white' : 'hover:bg-gray-200'}`}>Icônes des applications</li>
          <li onClick={() => setActiveTab('ai')} className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-colors ${activeTab === 'ai' ? 'bg-[#E95420] text-white' : 'hover:bg-gray-200'}`}>Intelligence Artificielle</li>
          <li className="hover:bg-gray-200 px-3 py-2 rounded-md cursor-pointer transition-colors opacity-50">Utilisateurs</li>
          <li className="hover:bg-gray-200 px-3 py-2 rounded-md cursor-pointer transition-colors opacity-50">Réseau</li>
        </ul>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-white">
        {activeTab === 'appearance' && (
          <>
            <h3 className="text-lg font-bold mb-6">Arrière-plan du bureau</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallpapers.map((wp) => (
                <div 
                  key={wp.url}
                  onClick={() => onWallpaperChange(wp.url)}
                  className={`group relative aspect-video rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${
                    currentWallpaper === wp.url ? 'border-[#E95420]' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">{wp.name}</span>
                  </div>
                  {currentWallpaper === wp.url && (
                    <div className="absolute top-2 right-2 bg-[#E95420] text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-700 mb-2">Thème du système</h4>
              <div className="flex items-center space-x-4">
                <button className="flex-1 p-4 rounded-lg bg-gray-800 text-white flex items-center justify-center space-x-2 border-2 border-[#E95420]">
                    <span>🌙</span>
                    <span>Mode Sombre (Actif)</span>
                </button>
                <button className="flex-1 p-4 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center space-x-2 border-2 border-transparent opacity-50 cursor-not-allowed">
                    <span>☀️</span>
                    <span>Mode Clair</span>
                </button>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'icons' && (
          <>
            <h3 className="text-lg font-bold mb-6">Personnalisation des icônes</h3>
            <p className="text-sm text-gray-500 mb-6 -mt-4">Cliquez sur une icône pour la modifier.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
              {appInfo.map(app => (
                <div key={app.id} onClick={() => setModalApp(app)} className="flex flex-col items-center group cursor-pointer">
                  <div className="relative">
                    <img src={appIcons[app.id]} alt={app.name} className="w-16 h-16 p-1 bg-gray-100 rounded-xl border border-transparent group-hover:border-gray-300 transition-all"/>
                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow group-hover:bg-[#E95420] group-hover:text-white transition-colors">
                      <svg className="w-3 h-3 text-gray-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                    </div>
                  </div>
                  <span className="text-xs text-center font-medium mt-2 group-hover:text-[#E95420]">{app.name}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Configuration Gemini AI</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Le noyau de ce système est propulsé par Gemini 3 Flash. Pour activer les fonctionnalités avancées, vous devez configurer votre clé API.
                  </p>
                </div>
              </div>
            </div>

            <section className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-700 mb-2">Étape 1 : Obtenir une clé API</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Rendez-vous sur le site officiel de Google AI Studio pour générer votre clé API gratuite ou payante.
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#E95420] hover:bg-[#d94410] transition-colors"
                >
                  Générer une clé sur AI Studio
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-bold text-gray-700 mb-2">Étape 2 : Activer la clé dans Ubuntu Intelligence</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Utilisez le sélecteur sécurisé ci-dessous pour injecter votre clé dans l'environnement. Cette clé sera stockée de manière sécurisée dans votre session de navigateur.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Sélecteur de Clé API</p>
                      <p className="text-xs text-gray-500">Protocole sécurisé AI Studio</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.aistudio) {
                        await window.aistudio.openSelectKey();
                      } else {
                        alert("Le sélecteur de clé n'est pas disponible dans cet environnement.");
                      }
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-black transition-colors"
                  >
                    Sélectionner ma clé
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-bold text-gray-700 mb-2">Documentation & Facturation</h4>
                <p className="text-xs text-gray-500 italic">
                  Note : Pour utiliser les modèles avancés (Gemini 3 Pro), assurez-vous que votre projet Google Cloud dispose d'un compte de facturation actif. 
                  Consultez la <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[#E95420] underline">documentation sur la facturation</a> pour plus de détails.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;