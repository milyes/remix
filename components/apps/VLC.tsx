
import React, { useState } from 'react';

const VLC: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);

  return (
    <div className="h-full w-full flex flex-col bg-[#1A1A1A] text-white font-sans">
      {/* Video / Audio Display Area */}
      <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
        {/* Placeholder for video/audio visualization */}
        <div className="absolute inset-0 bg-gradient-to-br from-black to-[#2c001e] opacity-80"></div>
        <img 
            src="https://img.icons8.com/color/96/000000/vlc.png" 
            alt="VLC Cone" 
            className="w-24 h-24 opacity-60 animate-pulse"
        />
        <div className="absolute bottom-4 text-xs text-gray-400">
            Placeholder : Aucun média chargé.
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-[#2D2D2D] flex items-center justify-between px-6 py-2 border-t border-white/10 shrink-0">
        {/* Play/Pause Button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 rounded-full bg-[#E95420] hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#E95420]/50"
          title={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Playback Progress (placeholder) */}
        <div className="flex-1 mx-6 flex items-center space-x-3">
          <span className="text-xs text-gray-300">00:00</span>
          <div className="flex-1 h-1.5 bg-gray-600 rounded-full relative">
            <div className="h-full bg-[#E95420] rounded-full w-1/4"></div> {/* Simulate 25% progress */}
            <div className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#E95420] rounded-full shadow-lg"></div> {/* Playhead */}
          </div>
          <span className="text-xs text-gray-300">04:30</span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 w-32">
          <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-600 [&::-webkit-slider-thumb]:bg-[#E95420] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none"
            title={`Volume : ${volume}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default VLC;
