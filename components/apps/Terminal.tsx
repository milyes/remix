
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { TerminalLine, AppID } from '../../types';
import { geminiService } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

const commands = ['clear', 'help', 'whoami', 'info', 'pkg', 'sudo', 'snap', 'sys.time_dilate', 'ls', 'pwd', 'cd', 'mkdir', 'touch', 'cat', 'echo', 'uname', 'date', 'uptime', 'rm', 'cp', 'mv', 'ai'];

const packageMap: Record<string, AppID> = {
  'file-explorer': 'files',
  'firefox': 'browser',
  'neo-browser': 'neo-browser',
  'ubuntu-demo': 'ubuntu-demo',
  'vlc': 'vlc',
  'orbital-ps4': 'orbital',
  'settings': 'settings',
  'about-ubuntu': 'about',
  'ai-chat': 'ai-chat'
};

interface FSItem {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, FSItem>;
}

const initialFS: Record<string, FSItem> = {
  'home': {
    name: 'home',
    type: 'dir',
    children: {
      'ubuntu': {
        name: 'ubuntu',
        type: 'dir',
        children: {
          'Documents': { name: 'Documents', type: 'dir', children: {} },
          'Downloads': { name: 'Downloads', type: 'dir', children: {} },
          'Desktop': { name: 'Desktop', type: 'dir', children: {} },
          'welcome.txt': { name: 'welcome.txt', type: 'file', content: 'Bienvenue dans Ubuntu Intelligence !\nPropulsé par Gemini 3 Flash.' },
          'notes.md': { name: 'notes.md', type: 'file', content: '# Notes Système\n- Orbital PS4 Emulator: v0.1.4\n- Kernel: 6.8.0-generic\n- AI: Gemini 3 Flash' }
        }
      }
    }
  },
  'etc': { name: 'etc', type: 'dir', children: { 'hostname': { name: 'hostname', type: 'file', content: 'ubuntu-intelligence' } } },
  'var': { name: 'var', type: 'dir', children: { 'log': { name: 'log', type: 'dir', children: { 'syslog': { name: 'syslog', type: 'file', content: 'Mar 02 11:36:42 kernel: [0.000000] Linux version 6.8.0-generic' } } } } },
  'bin': { name: 'bin', type: 'dir', children: { 'bash': { name: 'bash', type: 'file', content: 'BINARY_DATA' }, 'ls': { name: 'ls', type: 'file', content: 'BINARY_DATA' } } }
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${
        copied ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
      }`}
      title="Copier dans le presse-papiers"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

const deepCloneFS = (fs: Record<string, FSItem>): Record<string, FSItem> => {
  const clone: Record<string, FSItem> = {};
  for (const key in fs) {
    const item = fs[key];
    if (item.type === 'dir') {
      clone[key] = { ...item, children: deepCloneFS(item.children) };
    } else {
      clone[key] = { ...item };
    }
  }
  return clone;
};

const Terminal: React.FC<{ onAppOpen: (id: AppID) => void; addNotification: (text: string) => void }> = ({ onAppOpen, addNotification }) => {
  const [fs, setFs] = useState<Record<string, FSItem>>(initialFS);
  const [currentPath, setCurrentPath] = useState<string[]>(['home', 'ubuntu']);
  const [startTime] = useState(Date.now());
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'Bienvenue sur Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)' },
    { type: 'system', content: ' * Noyau IA:       Gemini 3 Flash' },
    { type: 'system', content: ' * Capacités:      Ancrage Web Complet, Synthèse de Commandes' },
    { type: 'system', content: '' },
    { type: 'system', content: "Ubuntu Intelligence prêt. Tapez `help` pour les commandes ou `Tab` pour l'auto-complétion." },
    { type: 'system', content: '' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allCopied, setAllCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const resolvePath = (target: string): string[] => {
    if (!target) return currentPath;
    if (target === '~') return ['home', 'ubuntu'];
    
    let pathParts: string[];
    if (target.startsWith('/')) {
      pathParts = target.split('/').filter(p => p !== '');
    } else {
      pathParts = [...currentPath, ...target.split('/').filter(p => p !== '')];
    }
    
    const resolved: string[] = [];
    for (const part of pathParts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }
    return resolved;
  };

  const getItem = (path: string[], currentFs: Record<string, FSItem>): FSItem | null => {
    if (path.length === 0) return { name: '/', type: 'dir', children: currentFs };
    const parentPath = path.slice(0, -1);
    const name = path[path.length - 1];
    const parentDir = getDir(parentPath, currentFs);
    if (parentDir && parentDir[name]) return parentDir[name];
    return null;
  };

  const getDir = (path: string[], currentFs: Record<string, FSItem>): Record<string, FSItem> | null => {
    let current: Record<string, FSItem> = currentFs;
    for (const p of path) {
      if (current[p] && current[p].type === 'dir' && current[p].children) {
        current = current[p].children!;
      } else {
        return null;
      }
    }
    return current;
  };

  const handleCopyAll = async () => {
    const allText = lines.map(line => {
      if (line.type === 'input') return `ubuntu@intelligence:~$ ${line.content}`;
      return line.content;
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(allText);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy all text: ', err instanceof Error ? err.message : String(err));
    }
  };

  const simulateInstall = async (pkg: string, appId: AppID, manager: string) => {
    const steps = [
      { msg: `Lecture des listes de paquets... Fait`, delay: 400 },
      { msg: `Construction de l'arbre des dépendances... Fait`, delay: 300 },
      { msg: `Lecture de l'information d'état... Fait`, delay: 300 },
      { msg: `Les NOUVEAUX paquets suivants seront installés :`, delay: 200 },
      { msg: `  ${pkg}`, delay: 100 },
      { msg: `0 mis à jour, 1 nouvellement installés, 0 à enlever et 0 non mis à jour.`, delay: 200 },
      { msg: `Il est nécessaire de prendre 14,2 Mo dans les archives.`, delay: 200 },
      { msg: `Après cette opération, 48,6 Mo d'espace disque supplémentaires seront utilisés.`, delay: 200 },
      { msg: `Réception de :1 http://archive.ubuntu.com/ubuntu noble/main amd64 ${pkg} [14,2 MB]`, delay: 800 },
      { msg: `Progress: [##########----------] 50%`, delay: 400 },
      { msg: `Progress: [####################] 100%`, delay: 400 },
      { msg: `Sélection du paquet ${pkg} précédemment désélectionné.`, delay: 300 },
      { msg: `(Lecture de la base de données... 184522 fichiers et répertoires déjà installés.)`, delay: 500 },
      { msg: `Préparation du dépaquetage de .../${pkg}_amd64.deb ...`, delay: 400 },
      { msg: `Dépaquetage de ${pkg} (2.4.0-ubuntu1) ...`, delay: 600 },
      { msg: `Paramétrage de ${pkg} (2.4.0-ubuntu1) ...`, delay: 500 },
      { msg: `Traitement des actions différées (« triggers ») pour systemd (255.4-1ubuntu8) ...`, delay: 400 },
      { msg: `Traitement des actions différées (« triggers ») pour man-db (2.12.0-4build2) ...`, delay: 300 },
      { msg: `Installation terminée pour ${pkg}.`, delay: 200 },
    ];

    for (const step of steps) {
      setLines(prev => [...prev, { type: 'system', content: step.msg }]);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    addNotification(`Succès : ${pkg} a été installé via ${manager}.`);
    onAppOpen(appId);
    setIsProcessing(false);
  };
  
  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd || isProcessing) return;

    setLines(prev => [...prev, { type: 'input', content: cmd }]);
    setHistory(prev => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    setInputValue('');
    setSuggestions([]);
    setIsProcessing(true);

    if (cmd.toLowerCase() === 'clear') {
      setLines([{ type: 'system', content: 'Console effacée. Ubuntu Intelligence en attente.' }]);
      setIsProcessing(false);
      return;
    }

    if (cmd.toLowerCase() === 'help') {
      setLines(prev => [...prev, { type: 'output', content: "### Commandes :\n- **clear** : Effacer l'écran\n- **help** : Afficher ce message\n- **whoami** : Infos de session\n- **info** : Infos système\n- **ls [path]** : Lister les fichiers\n- **pwd** : Afficher le répertoire courant\n- **cd [dir]** : Changer de répertoire\n- **mkdir [-p] [dir]** : Créer un répertoire\n- **touch [file]** : Créer un fichier\n- **cp [-r] [src] [dest]** : Copier un fichier ou dossier\n- **mv [src] [dest]** : Déplacer ou renommer un fichier/dossier\n- **rm [-r] [item]** : Supprimer un fichier ou dossier\n- **cat [file]** : Lire un fichier\n- **echo [text]** : Afficher du texte\n- **uname** : Infos noyau\n- **date** : Date actuelle\n- **uptime** : Temps d'activité\n- **pkg install [paquet]** : Installer une application\n- **snap install [paquet]** : Installer une application via snap\n- **sudo apt update** : Mise à jour système\n- **ai [prompt]** : Interroger l'IA Gemini 3 Flash" }]);
      setIsProcessing(false);
      return;
    }

    if (cmd.toLowerCase() === 'whoami') {
      setLines(prev => [...prev, { type: 'output', content: '**Utilisateur :** `ubuntu`\n**Shell :** `/bin/gemini-sh`' }]);
      setIsProcessing(false);
      return;
    }

    if (cmd.toLowerCase() === 'info') {
      const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      const uptimeStr = `${h}h ${m}m ${s}s`;
      
      setLines(prev => [...prev, { type: 'output', content: `### Informations Système :
- **OS** : Ubuntu 24.04 LTS (Noble Numbat)
- **Hôte** : ubuntu-intelligence
- **Noyau** : 6.8.0-generic
- **Uptime** : ${uptimeStr}
- **Moteur IA** : Gemini 3 Flash (Neural Core v3.0)
- **Mémoire** : 16GB (Simulé)
- **CPU** : Intel(R) Core(TM) i9-14900K (Simulé)
- **Environnement** : Web-Integrated Ubuntu Emulator` }]);
      setIsProcessing(false);
      return;
    }

    const parts = cmd.split(' ');
    const baseCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (baseCmd === 'ls') {
      const target = args[0] || '.';
      const resolved = resolvePath(target);
      const dir = getDir(resolved, fs);
      if (dir) {
        const list = Object.values(dir).map(item => item.type === 'dir' ? `**${item.name}/**` : item.name).sort().join('  ');
        setLines(prev => [...prev, { type: 'output', content: list || 'Répertoire vide' }]);
      } else {
        const item = getItem(resolved, fs);
        if (item && item.type === 'file') {
          setLines(prev => [...prev, { type: 'output', content: item.name }]);
        } else {
          setLines(prev => [...prev, { type: 'error', content: `ls: impossible d'accéder à '${target}': Aucun fichier ou dossier de ce type` }]);
        }
      }
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'pwd') {
      setLines(prev => [...prev, { type: 'output', content: `/${currentPath.join('/')}` }]);
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'cd') {
      const target = args[0];
      if (!target || target === '~') {
        setCurrentPath(['home', 'ubuntu']);
      } else {
        const resolved = resolvePath(target);
        const item = getItem(resolved, fs);
        if (item && item.type === 'dir') {
          setCurrentPath(resolved);
        } else {
          setLines(prev => [...prev, { type: 'error', content: `cd: ${target}: Aucun dossier de ce type` }]);
        }
      }
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'mkdir') {
      const isRecursive = args.includes('-p');
      const name = args.find(a => !a.startsWith('-'));
      if (!name) {
        setLines(prev => [...prev, { type: 'error', content: 'mkdir: argument manquant' }]);
      } else {
        setFs(prevFs => {
          const newFs = deepCloneFS(prevFs);
          const resolved = resolvePath(name);
          const parentPath = resolved.slice(0, -1);
          const dirName = resolved[resolved.length - 1];

          if (isRecursive) {
            let current = newFs;
            let currentP: string[] = [];
            for (const p of resolved) {
              currentP.push(p);
              if (!current[p]) {
                current[p] = { name: p, type: 'dir', children: {} };
              } else if (current[p].type !== 'dir') {
                setLines(prev => [...prev, { type: 'error', content: `mkdir: impossible de créer le répertoire « ${name} »: Un fichier existe déjà` }]);
                return prevFs;
              }
              current = current[p].children!;
            }
          } else {
            const parentDir = getDir(parentPath, newFs);
            if (!parentDir) {
              setLines(prev => [...prev, { type: 'error', content: `mkdir: impossible de créer le répertoire « ${name} »: Aucun fichier ou dossier de ce type` }]);
              return prevFs;
            }
            if (parentDir[dirName]) {
              setLines(prev => [...prev, { type: 'error', content: `mkdir: impossible de créer le répertoire « ${name} »: Le fichier existe` }]);
              return prevFs;
            }
            parentDir[dirName] = { name: dirName, type: 'dir', children: {} };
          }
          return newFs;
        });
      }
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'touch') {
      const name = args[0];
      if (!name) {
        setLines(prev => [...prev, { type: 'error', content: 'touch: argument manquant' }]);
      } else {
        setFs(prevFs => {
          const newFs = deepCloneFS(prevFs);
          const resolved = resolvePath(name);
          const parentPath = resolved.slice(0, -1);
          const fileName = resolved[resolved.length - 1];
          const parentDir = getDir(parentPath, newFs);
          
          if (!parentDir) {
            setLines(prev => [...prev, { type: 'error', content: `touch: impossible de créer « ${name} »: Aucun fichier ou dossier de ce type` }]);
            return prevFs;
          }
          if (!parentDir[fileName]) {
            parentDir[fileName] = { name: fileName, type: 'file', content: '' };
          }
          return newFs;
        });
      }
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'cat') {
      const name = args[0];
      if (!name) {
        setLines(prev => [...prev, { type: 'error', content: 'cat: argument manquant' }]);
      } else {
        const resolved = resolvePath(name);
        const item = getItem(resolved, fs);
        if (item) {
          if (item.type === 'file') {
            setLines(prev => [...prev, { type: 'output', content: item.content || '' }]);
          } else {
            setLines(prev => [...prev, { type: 'error', content: `cat: ${name}: est un dossier` }]);
          }
        } else {
          setLines(prev => [...prev, { type: 'error', content: `cat: ${name}: Aucun fichier de ce type` }]);
        }
      }
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'echo') {
      setLines(prev => [...prev, { type: 'output', content: args.join(' ') }]);
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'uname') {
      setLines(prev => [...prev, { type: 'output', content: 'Linux ubuntu-intelligence 6.8.0-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' }]);
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'date') {
      setLines(prev => [...prev, { type: 'output', content: new Date().toString() }]);
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'uptime') {
      const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      setLines(prev => [...prev, { type: 'output', content: `up ${h} hours, ${m} minutes, ${s} seconds` }]);
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'rm') {
      const isRecursive = args.includes('-r') || args.includes('-rf');
      const name = args.find(a => !a.startsWith('-'));
      if (!name) {
        setLines(prev => [...prev, { type: 'error', content: 'rm: argument manquant' }]);
      } else {
        setFs(prevFs => {
          const newFs = deepCloneFS(prevFs);
          const resolved = resolvePath(name);
          const parentPath = resolved.slice(0, -1);
          const itemName = resolved[resolved.length - 1];
          const parentDir = getDir(parentPath, newFs);
          
          if (parentDir && parentDir[itemName]) {
            if (parentDir[itemName].type === 'dir' && !isRecursive) {
              setLines(prev => [...prev, { type: 'error', content: `rm: impossible de supprimer « ${name} »: est un dossier` }]);
              return prevFs;
            }
            delete parentDir[itemName];
            return newFs;
          } else {
            setLines(prev => [...prev, { type: 'error', content: `rm: impossible de supprimer « ${name} »: Aucun fichier ou dossier de ce type` }]);
            return prevFs;
          }
        });
      }
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'cp') {
      const isRecursive = args.includes('-r') || args.includes('-R');
      const filteredArgs = args.filter(a => !a.startsWith('-'));
      const source = filteredArgs[0];
      const dest = filteredArgs[1];
      
      if (!source || !dest) {
        setLines(prev => [...prev, { type: 'error', content: 'cp: opérande de fichier manquant' }]);
      } else {
        setFs(prevFs => {
          const newFs = deepCloneFS(prevFs);
          const srcResolved = resolvePath(source);
          const destResolved = resolvePath(dest);
          const srcItem = getItem(srcResolved, newFs);
          
          if (!srcItem) {
            setLines(prev => [...prev, { type: 'error', content: `cp: impossible d'évaluer « ${source} »: Aucun fichier ou dossier de ce type` }]);
            return prevFs;
          }

          if (srcItem.type === 'dir' && !isRecursive) {
            setLines(prev => [...prev, { type: 'error', content: `cp: -r non spécifié; omission du répertoire « ${source} »` }]);
            return prevFs;
          }

          const destParentPath = destResolved.slice(0, -1);
          const destName = destResolved[destResolved.length - 1];
          const destParentDir = getDir(destParentPath, newFs);
          
          if (!destParentDir) {
            setLines(prev => [...prev, { type: 'error', content: `cp: impossible de copier vers « ${dest} »: Aucun fichier ou dossier de ce type` }]);
            return prevFs;
          }

          if (destParentDir[destName] && destParentDir[destName].type === 'dir') {
            destParentDir[destName].children![srcItem.name] = { ...srcItem };
          } else {
            destParentDir[destName] = { ...srcItem, name: destName };
          }
          
          return newFs;
        });
      }
      setIsProcessing(false);
      return;
    }

    if (baseCmd === 'mv') {
      const source = args[0];
      const dest = args[1];
      if (!source || !dest) {
        setLines(prev => [...prev, { type: 'error', content: 'mv: opérande de fichier manquant' }]);
      } else {
        setFs(prevFs => {
          const newFs = deepCloneFS(prevFs);
          const srcResolved = resolvePath(source);
          const destResolved = resolvePath(dest);
          const srcParentPath = srcResolved.slice(0, -1);
          const srcName = srcResolved[srcResolved.length - 1];
          const srcParentDir = getDir(srcParentPath, newFs);

          if (!srcParentDir || !srcParentDir[srcName]) {
            setLines(prev => [...prev, { type: 'error', content: `mv: impossible d'évaluer « ${source} »: Aucun fichier ou dossier de ce type` }]);
            return prevFs;
          }

          const itemToMove = { ...srcParentDir[srcName] };
          const destParentPath = destResolved.slice(0, -1);
          const destName = destResolved[destResolved.length - 1];
          const destParentDir = getDir(destParentPath, newFs);

          if (!destParentDir) {
            setLines(prev => [...prev, { type: 'error', content: `mv: impossible de déplacer vers « ${dest} »: Aucun fichier ou dossier de ce type` }]);
            return prevFs;
          }

          if (destParentDir[destName] && destParentDir[destName].type === 'dir') {
            destParentDir[destName].children![srcName] = itemToMove;
          } else {
            destParentDir[destName] = { ...itemToMove, name: destName };
          }

          delete srcParentDir[srcName];
          return newFs;
        });
      }
      setIsProcessing(false);
      return;
    }

    if (cmd.startsWith('sys.time_dilate')) {
      const parts = cmd.split(' ');
      const value = parseFloat(parts[1]);
      if (!isNaN(value) && value >= 0.1 && value <= 5.0) {
        window.dispatchEvent(new CustomEvent('sys:time_dilate', { detail: { value } }));
        setLines(prev => [...prev, { type: 'system', content: `[KERNEL] Dilatation temporelle réglée sur ${value.toFixed(2)}x` }]);
        addNotification(`Flux temporel ajusté : ${value.toFixed(2)}x`);
      } else {
        setLines(prev => [...prev, { type: 'error', content: 'Usage: sys.time_dilate [0.1 - 5.0]' }]);
      }
      setIsProcessing(false);
      return;
    }

    if (cmd.startsWith('pkg install') || cmd.startsWith('snap install') || cmd.startsWith('sudo apt install')) {
      const parts = cmd.split(' ');
      const pkg = parts[parts.length - 1];
      const manager = parts[0] === 'sudo' ? 'apt' : parts[0];
      const appId = packageMap[pkg];
      
      if (appId) {
        await simulateInstall(pkg, appId, manager);
      } else {
        setLines(prev => [...prev, { type: 'error', content: `E: Impossible de trouver le paquet ${pkg}` }]);
        setIsProcessing(false);
      }
      return;
    }

    let geminiPrompt = cmd;
    if (baseCmd === 'ai') {
      if (args.length === 0) {
        setLines(prev => [...prev, { type: 'error', content: 'Usage: ai [votre question ou commande]' }]);
        setIsProcessing(false);
        return;
      }
      geminiPrompt = args.join(' ');
    }

    try {
        const { text, sources } = await geminiService.processCommand(geminiPrompt);
        let output = text;
        if (sources && sources.length > 0) {
        output += '\n\n**Sources:**\n' + sources.map(s => `- [${s.title}](${s.uri})`).join('\n');
        }
        setLines(prev => [...prev, { type: 'output', content: output }]);
    } catch (err) {
        setLines(prev => [...prev, { type: 'error', content: `Erreur interne: ${String(err)}` }]);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const matches = commands.filter(c => c.startsWith(inputValue));
      if (matches.length === 1) setInputValue(matches[0]);
      else if (matches.length > 1) setSuggestions(matches);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setInputValue(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const markdownComponents = useMemo(() => ({
    code({ inline, className, children }: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className}>
          {children}
        </code>
      );
    },
  }), []);

  const itemContent = useCallback((_index: number, line: TerminalLine) => {
    const pathStr = currentPath.join('/') === 'home/ubuntu' ? '~' : `/${currentPath.join('/')}`;
    return (
      <div className="mb-2">
        {line.type === 'input' && (
          <div className="flex">
            <span className="text-[#87ff5f] font-bold mr-2 whitespace-nowrap">ubuntu@intelligence:{pathStr}$</span>
            <span>{line.content}</span>
          </div>
        )}
        {line.type === 'output' && (
          <div className="relative group pl-2 border-l-2 border-[#E95420]/30 py-1">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]} className="terminal-markdown">
              {line.content}
            </ReactMarkdown>
            <CopyButton text={line.content} />
          </div>
        )}
        {line.type === 'system' && <div className="text-gray-400 italic text-xs leading-relaxed">{line.content}</div>}
        {line.type === 'error' && <div className="text-red-400 font-bold">{line.content}</div>}
      </div>
    );
  }, [markdownComponents, currentPath]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isProcessing]);
  
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="h-full bg-[#300A24] text-white p-4 font-mono text-sm flex flex-col relative overflow-hidden" onClick={handleContainerClick}>
      <button onClick={handleCopyAll} className={`absolute top-2 right-4 p-1 rounded bg-white/5 hover:bg-white/10 z-10 transition-colors text-xs ${allCopied ? 'text-green-500' : 'text-gray-400'}`}>
        {allCopied ? 'Copié !' : 'Tout copier'}
      </button>

      <div className="flex-1 relative">
        <Virtuoso
          ref={virtuosoRef}
          data={lines}
          itemContent={itemContent}
          style={{ height: '100%' }}
          followOutput="auto"
          context={{}}
        />
      </div>

      <div className="pt-2 shrink-0 border-t border-white/5 mt-2">
        {isProcessing && (
          <div className="flex items-center text-[#E95420] text-xs font-bold mb-1 animate-pulse">
            <span className="mr-2">●</span> OPÉRATION SYSTÈME EN COURS...
          </div>
        )}
        <form onSubmit={handleCommand} className="flex items-center gap-2">
          <span className="text-[#87ff5f] font-bold mr-2 whitespace-nowrap">
            ubuntu@intelligence:{currentPath.join('/') === 'home/ubuntu' ? '~' : `/${currentPath.join('/')}`}$
          </span>
          <input
            ref={inputRef}
            autoFocus
            className="bg-transparent border-none outline-none flex-1 text-white p-0 m-0"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
          />
          <button type="submit" disabled={isProcessing || !inputValue.trim()} className="text-xs bg-[#E95420] text-white px-3 py-1 rounded-md hover:bg-[#d94410] disabled:bg-gray-500 disabled:opacity-50 transition-colors">
            Envoyer
          </button>
        </form>
        {suggestions.length > 0 && (
          <div className="mt-2 p-2 bg-black/30 rounded border border-white/10 flex gap-4 text-gray-400 text-xs">
            {suggestions.map(s => <span key={s}>{s}</span>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
