
export type AppID = 'terminal' | 'terminal-alt' | 'files' | 'browser' | 'settings' | 'about' | 'neo-browser' | 'ubuntu-demo' | 'vlc' | 'orbital' | 'ai-chat';

export interface WindowState {
  id: AppID;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

export type SearchResultType = 'app' | 'file' | 'setting';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  label: string;
  icon?: string;
  appId: AppID;
  description?: string;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export {};
