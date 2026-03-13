
import React, { useState, useEffect, useRef } from 'react';

const Orbital: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [gpuUsage, setGpuUsage] = useState(0);
  const [ramUsage, setRamUsage] = useState(0);
  const [timeScale, setTimeScale] = useState(1.0);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLogCopied, setIsLogCopied] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTimeDilate = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.value === 'number') {
        setTimeScale(e.detail.value);
        setConsoleOutput(prev => [...prev, `[SYS] FLUX TEMPOREL AJUSTÉ : ${e.detail.value.toFixed(2)}x`]);
      }
    };

    window.addEventListener('sys:time_dilate' as any, handleTimeDilate as any);
    return () => window.removeEventListener('sys:time_dilate' as any, handleTimeDilate as any);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning) {
      // Adjust interval based on timeScale (lower timeScale = slower updates = slower "time")
      const baseInterval = 800;
      const adjustedInterval = baseInterval / timeScale;

      interval = setInterval(() => {
        setCpuUsage(Math.floor(Math.random() * (95 - 30 + 1)) + 30); // 30-95%
        setGpuUsage(Math.floor(Math.random() * (90 - 20 + 1)) + 20); // 20-90%
        setRamUsage(Math.floor(Math.random() * (80 - 40 + 1)) + 40); // 40-80%

        const messages = [
          '[EMU] Core_0: Exécution du bloc d\'instruction à 0xDEADBEEF...',
          '[GPU] Rendu: Calcul de la trame 1234. VRAM: 3.5GB/4.0GB.',
          '[SYS] ThreadManager: Planification du thread jeu ID 0x1A2B...',
          '[AUDIO] SPU: Traitement du flux audio 0xABCDEF...',
          '[INPUT] Manette 1: Vérification des entrées utilisateur.',
          '[EMU] MMU: Défaut de page à 0xCAFEBABE, mappage...',
          '[NET] PSN: Protocole de connexion initié. Statut: CONNECTÉ.',
          '[SYS] Kernel: Allocation mémoire heap réussie.',
          '[GPU] Shader: Compilation du shader vertex #452.',
          `[TIME] Dilatation active: ${timeScale.toFixed(2)}x`,
        ];
        
        setConsoleOutput(prev => {
          const newOutput = [...prev, messages[Math.floor(Math.random() * messages.length)]];
          return newOutput.slice(-20); // Keep last 20 messages for scroll effect
        });
      }, adjustedInterval);
    } else {
        // Reset stats when stopped
        setCpuUsage(0);
        setGpuUsage(0);
        setRamUsage(0);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeScale]);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleOutput]);

  const handleExec = () => {
    if (!isRunning) {
        setIsRunning(true);
        setConsoleOutput(prev => [...prev, "[SYS] INITIALISATION DU NOYAU ORBITAL...", "[SYS] CHARGEMENT DES MODULES..."]);
    } else {
        setIsRunning(false);
        setConsoleOutput(prev => [...prev, "[SYS] ARRÊT D'URGENCE DEMANDÉ.", "[SYS] SYSTÈME HALT."]);
    }
  };

  const handleCopyLog = async () => {
    const logText = consoleOutput.join('\n');
    if (!logText) return;

    try {
        await navigator.clipboard.writeText(logText);
        setIsLogCopied(true);
        setTimeout(() => setIsLogCopied(false), 2500);
    } catch (err) {
        console.error("Failed to copy log:", err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-[#10002B] to-[#0A0A0A] text-gray-200 font-mono overflow-hidden">
      {/* Top Bar: Emulator Name and Version */}
      <div className="bg-[#1A1A1A] p-3 flex items-center justify-between border-b border-gray-700 shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <img src="https://img.icons8.com/fluency/48/controller.png" alt="Controller Icon" className="w-7 h-7" />
          <h1 className="text-xl font-bold text-[#E95420] tracking-wider uppercase">Émulateur Orbital PS4</h1>
          <span className="text-xs text-gray-400 opacity-70">v0.1.4-fr (Alpha)</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExec}
            className={`px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                : 'bg-[#E95420] hover:bg-[#d94410] text-white'
            }`}
          >
            {isRunning ? (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    <span>STOP</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>EXÉCUTER</span>
                </>
            )}
          </button>
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors">Charger ROM</button>
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors">Paramètres</button>
        </div>
      </div>

      {/* Main Content Area: Game Screen & Console */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Game Screen Placeholder */}
        <div className="flex-1 bg-black border border-gray-800 rounded-lg flex items-center justify-center relative shadow-inner overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-tl from-[#0A0A0A] to-[#2c001e] opacity-70 ${isRunning ? 'animate-pulse' : ''}`}></div>
          <div className="z-10 flex flex-col items-center">
            {isRunning ? (
                <>
                    <div className="w-16 h-16 border-4 border-[#E95420] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-[#E95420] text-xl font-bold tracking-widest animate-pulse">BOOT SYSTÈME EN COURS...</span>
                </>
            ) : (
                <span className="text-gray-600 text-lg font-mono">EN ATTENTE D'EXÉCUTION</span>
            )}
          </div>
        </div>

        {/* System Info / Console Log */}
        <div className="w-full md:w-96 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-md flex flex-col p-3 text-sm">
          <h2 className="font-bold text-[#87ff5f] mb-2 uppercase text-xs flex justify-between">
            <span>État du Système</span>
            <span className={isRunning ? "text-green-500" : "text-red-500"}>● {isRunning ? "ON" : "OFF"}</span>
          </h2>
          <div className="grid grid-cols-1 gap-3 mb-4 bg-black/20 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="w-12 text-gray-400">CPU</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1.5">
                <div className="bg-[#E95420] h-full rounded-full transition-all duration-300" style={{ width: `${cpuUsage}%` }}></div>
              </div>
              <span className="text-xs w-8 text-right font-mono">{cpuUsage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="w-12 text-gray-400">GPU</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1.5">
                <div className="bg-[#007bff] h-full rounded-full transition-all duration-300" style={{ width: `${gpuUsage}%` }}></div>
              </div>
              <span className="text-xs w-8 text-right font-mono">{gpuUsage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="w-12 text-gray-400">RAM</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1.5">
                <div className="bg-[#28a745] h-full rounded-full transition-all duration-300" style={{ width: `${ramUsage}%` }}></div>
              </div>
              <span className="text-xs w-8 text-right font-mono">{ramUsage}%</span>
            </div>
            <div className="flex flex-col space-y-1 mt-2 border-t border-gray-700 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Flux Temporel</span>
                <span className={`text-[10px] font-mono ${timeScale < 1 ? 'text-cyan-400' : timeScale > 1 ? 'text-red-400' : 'text-gray-400'}`}>
                  {timeScale.toFixed(2)}x
                </span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="3.0" 
                step="0.1" 
                value={timeScale} 
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E95420]"
              />
              <div className="flex justify-between text-[8px] text-gray-500 uppercase">
                <span>Ralenti</span>
                <span>Normal</span>
                <span>Accéléré</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-700 pt-2 mb-2">
              <h2 className="font-bold text-[#87ff5f] uppercase text-xs">Journal de Debug</h2>
              <button
                  onClick={handleCopyLog}
                  title="Copy Log"
                  className="p-1 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                  {isLogCopied ? (
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                  ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                  )}
              </button>
          </div>
          <div className="flex-1 bg-black text-gray-300 p-2 rounded border border-gray-800 overflow-y-auto no-scrollbar font-mono text-[10px] leading-relaxed shadow-inner">
            {consoleOutput.length === 0 && <div className="text-gray-700 text-center mt-10 italic">Prêt.</div>}
            {consoleOutput.map((line, index) => (
              <div key={index} className="mb-0.5 break-all">
                {line.includes('[EMU]') && <span className="text-yellow-500 font-bold mr-1">[EMU]</span>}
                {line.includes('[GPU]') && <span className="text-purple-500 font-bold mr-1">[GPU]</span>}
                {line.includes('[SYS]') && <span className="text-blue-500 font-bold mr-1">[SYS]</span>}
                {line.includes('[AUDIO]') && <span className="text-green-500 font-bold mr-1">[AUDIO]</span>}
                {line.includes('[INPUT]') && <span className="text-orange-500 font-bold mr-1">[INPUT]</span>}
                {line.includes('[NET]') && <span className="text-cyan-500 font-bold mr-1">[NET]</span>}
                
                <span className="text-gray-300">
                    {line.replace(/\[.*?\]\s*/, '')}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orbital;
