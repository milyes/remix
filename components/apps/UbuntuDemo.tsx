
import React, { useState } from 'react';

const UbuntuDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const updateCounter = (val: number) => {
    setCount(prev => prev + val);
  };

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`h-full w-full flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-[#2c001e] text-[#fdfdfd]' : 'bg-[#f0f0f0] text-[#333333]'}`}>
      <div className={`p-8 rounded-xl shadow-lg w-[350px] text-center transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-[#3e3e3e] shadow-black/50' : 'bg-white shadow-black/10'}`}>
        <h1 className="text-[#E95420] text-2xl font-bold mb-2">Démo Ubuntu</h1>
        <p className="mb-6 leading-relaxed opacity-90">Ceci est un bloc React/TSX autonome et fonctionnel.</p>
        
        <div 
            className="text-5xl font-bold my-4 transition-colors duration-200"
            style={{ color: count < 0 ? '#e74c3c' : (darkMode ? '#fdfdfd' : '#333333') }}
        >
            {count}
        </div>
        
        <div className="flex gap-3 justify-center mt-4">
            <button 
                onClick={() => updateCounter(-1)}
                className="bg-[#772953] text-white border-none py-2 px-5 rounded-full cursor-pointer font-bold text-base hover:opacity-80 transition-opacity"
            >
                - Moins
            </button>
            <button 
                onClick={() => updateCounter(1)}
                className="bg-[#E95420] text-white border-none py-2 px-5 rounded-full cursor-pointer font-bold text-base hover:opacity-80 transition-opacity"
            >
                + Plus
            </button>
        </div>

        <button 
            onClick={toggleTheme}
            className={`mt-6 bg-transparent border-2 py-1 px-4 text-sm font-medium transition-colors ${darkMode ? 'border-white text-white hover:bg-white/10' : 'border-[#333] text-[#333] hover:bg-black/5'}`}
        >
            Basculer Thème
        </button>
      </div>
    </div>
  );
};

export default UbuntuDemo;
