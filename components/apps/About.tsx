
import React, { useState } from 'react';

const About: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const systemInfo = `
Système: Ubuntu Intelligence
Description: Une expérience de bureau nouvelle génération fusionnant le système d'exploitation open-source le plus populaire au monde avec la technologie de pointe de l'IA Gemini.
Noyau IA: Gemini 3 Flash
© 2024 Projet Ubuntu Intelligence. Tous droits réservés.
    `.trim();
    
    try {
      await navigator.clipboard.writeText(systemInfo);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy system info:", err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="h-full bg-white text-gray-800 p-8 flex flex-col items-center justify-center space-y-6 text-center">
      <img src="https://img.icons8.com/color/144/000000/ubuntu.png" alt="Ubuntu" className="w-24 h-24 mb-4" />
      <h1 className="text-3xl font-bold text-[#E95420]">Ubuntu Intelligence</h1>
      <p className="max-w-md text-gray-600 leading-relaxed">
        Une expérience de bureau nouvelle génération fusionnant le système d'exploitation open-source le plus populaire au monde avec la technologie de pointe de l'IA Gemini.
      </p>

      <button 
        onClick={handleCopy}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
          isCopied 
            ? 'bg-green-500 text-white' 
            : 'bg-[#E95420] text-white hover:bg-[#d94410]'
        }`}
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
        <span>{isCopied ? 'Copié !' : 'Copier infos système'}</span>
      </button>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        <div className="bg-[#F7F7F7] p-4 rounded-xl border border-gray-100">
          <div className="text-2xl mb-1">⚡</div>
          <div className="font-bold text-sm">Ultra Rapide</div>
          <div className="text-xs text-gray-500">Propulsé par Gemini 3 Flash</div>
        </div>
        <div className="bg-[#F7F7F7] p-4 rounded-xl border border-gray-100">
          <div className="text-2xl mb-1">🐧</div>
          <div className="font-bold text-sm">Esprit Open Source</div>
          <div className="text-xs text-gray-500">Langage de design Ubuntu</div>
        </div>
      </div>

      <div className="pt-8 text-xs text-gray-400">
        © 2024 Projet Ubuntu Intelligence. Tous droits réservés.
      </div>
    </div>
  );
};

export default About;
