
import React, { ReactNode } from 'react';
import { AppID } from '../types';

interface WindowProps {
  id: AppID;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: ReactNode;
  icon?: string;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  isOpen,
  isMaximized,
  zIndex,
  onClose,
  onMaximize,
  onFocus,
  children,
  icon
}) => {
  if (!isOpen) return null;

  const windowClasses = isMaximized
    ? "fixed inset-0 top-7 left-[68px]"
    : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[800px] h-[70vh] rounded-lg shadow-2xl overflow-hidden";

  return (
    <div 
      className={`${windowClasses} bg-[#3D3D3D] flex flex-col border border-white/10`}
      style={{ zIndex }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div className="h-10 bg-[#2D2D2D] flex items-center justify-between px-4 cursor-move select-none border-b border-white/5">
        <div className="flex items-center space-x-3 text-sm font-medium text-gray-200">
          {icon && <img src={icon} alt="" className="w-4 h-4" />}
          <span>{title}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-6 h-6 rounded-full bg-[#E95420] flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default Window;
