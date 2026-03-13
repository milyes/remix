
import React, { useState } from 'react';

const FileExplorer: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);

  const folders = [
    { name: 'Documents', icon: '📁' },
    { name: 'Téléchargements', icon: '📥' },
    { name: 'Musique', icon: '🎵' },
    { name: 'Images', icon: '🖼️' },
    { name: 'Vidéos', icon: '🎥' },
    { name: 'AI_Assets', icon: '🤖' },
  ];

  const files = [
    { name: 'system_log.txt', size: '1.2 KB' },
    { name: 'neural_net_config.json', size: '4.5 KB' },
    { name: 'ubuntu_wall.jpg', size: '2.8 MB' },
  ];

  const handleCopyAll = async () => {
    const allItems = [
      'Dossiers:',
      ...folders.map(f => `  - ${f.name}`),
      '', // Add a newline for separation
      'Fichiers:',
      ...files.map(f => `  - ${f.name} (${f.size})`)
    ].join('\n');

    try {
      await navigator.clipboard.writeText(allItems);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy all items:", err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="h-full bg-white text-gray-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-48 bg-[#F7F7F7] border-r border-gray-200 p-4 space-y-4">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Emplacements</div>
        <ul className="space-y-2">
          {['Dossier personnel', 'Récents', 'Favoris', 'Corbeille'].map(place => (
            <li key={place} className="text-sm px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-gray-600 font-medium">
              {place}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-white relative">
        {/* Copy All Button */}
        <button
          onClick={handleCopyAll}
          className={`absolute top-4 right-4 p-2 rounded-md transition-all duration-300 flex items-center space-x-2 ${
            isCopied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title="Copier tous les noms"
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
          <span className="text-sm hidden sm:inline">{isCopied ? 'Copié !' : 'Tout copier'}</span>
        </button>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {folders.map(folder => (
            <div key={folder.name} className="flex flex-col items-center group cursor-pointer">
              <div className="text-4xl group-hover:scale-110 transition-transform mb-2">
                {folder.icon}
              </div>
              <span className="text-sm text-center font-medium group-hover:text-[#E95420]">{folder.name}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Fichiers</h3>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F2F2F2] cursor-pointer group transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📄</span>
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <span className="text-xs text-gray-400">{file.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
