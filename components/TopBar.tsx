
import React, { useState, useEffect } from 'react';

interface TopBarProps {
  onSearchClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSearchClick }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const formattedTime = time.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="h-7 w-full bg-black/40 backdrop-blur-md flex items-center justify-between px-4 text-[13px] font-medium z-50 select-none border-b border-white/5">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onSearchClick}
          className="cursor-default hover:text-white/80 font-bold text-[#E95420]"
        >
          Activités
        </button>
        <button 
          onClick={onSearchClick}
          className="flex items-center space-x-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[11px]">Rechercher</span>
        </button>
      </div>
      
      <div className="flex items-center absolute left-1/2 -translate-x-1/2 cursor-default hover:bg-white/10 px-2 rounded h-full transition-colors">
        <span>{formattedDate} {formattedTime}</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21l-12-18h24z" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.34V5.33C17 4.6 16.4 4 15.67 4z" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
