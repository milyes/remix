
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: "Bonjour ! Je suis l'assistant IA d'Ubuntu Intelligence. Comment puis-je vous aider aujourd'hui ?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<Chat | null>(null);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);

  // Initialize Chat Session
  useEffect(() => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        console.warn("AIChat: API Key is missing.");
        setApiKeyError(true);
      }
      const ai = new GoogleGenAI({ apiKey: apiKey || '' });
      chatSession.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "Tu es 'Ubuntu Intelligence Chat', un assistant IA souverain intégré dans un environnement Ubuntu 24.04. Tu es serviable, technique et précis. Utilise le formatage Markdown pour tes réponses.",
          temperature: 0.8,
        },
      });
    } catch (e) {
      console.error("Failed to initialize Gemini:", e instanceof Error ? e.message : String(e));
      setApiKeyError(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    if (apiKeyError || !chatSession.current) {
         setMessages(prev => [...prev, {
            role: 'user',
            content: input,
            timestamp: new Date()
          }, {
            role: 'model',
            content: "⚠️ **Erreur de Configuration** : La clé API est manquante ou invalide. Veuillez configurer `process.env.API_KEY`.",
            timestamp: new Date()
          }]);
          setInput('');
          return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSession.current.sendMessageStream({ message: input });
      
      let fullResponse = '';
      const aiMessage: Message = {
        role: 'model',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || "";
        fullResponse += chunkText;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: fullResponse
          };
          return newMessages;
        });
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error("Chat Error:", errorMsg);
      
      let displayMessage = "### ⚠️ Erreur Système Critique\n\nUne défaillance imprévue a été détectée dans le noyau neuronal.";
      
      if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED')) {
        displayMessage = "### 🚫 Accès Refusé (403)\n\nLe noyau neuronal refuse la connexion. \n\n**Causes probables :**\n- La clé API n'a pas les permissions nécessaires.\n- Le projet Google Cloud n'a pas activé l'API Gemini.\n- Restrictions géographiques ou de quota.\n\n**Action recommandée :** Vérifiez votre configuration dans les paramètres système.";
        setApiKeyError(true);
      } else if (errorMsg.includes('401') || errorMsg.includes('UNAUTHENTICATED')) {
        displayMessage = "### 🔑 Erreur d'Authentification (401)\n\nLa clé API fournie est invalide ou a expiré.\n\n**Action recommandée :** Veuillez générer une nouvelle clé sur [Google AI Studio](https://aistudio.google.com/app/apikey) et la mettre à jour dans vos paramètres.";
        setApiKeyError(true);
      } else if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        displayMessage = "### ⏳ Quota Épuisé (429)\n\nVous avez atteint la limite de requêtes autorisées pour votre clé API.\n\n**Action recommandée :** Attendez quelques minutes ou passez à un plan supérieur si nécessaire.";
      } else if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE')) {
        displayMessage = "### ☁️ Service Indisponible (503)\n\nLes serveurs de Gemini sont actuellement surchargés ou en maintenance.\n\n**Action recommandée :** Réessayez dans quelques instants. Le système tentera de rétablir la connexion automatiquement.";
      } else if (errorMsg.includes('400') || errorMsg.includes('INVALID_ARGUMENT')) {
        displayMessage = "### 📝 Requête Invalide (400)\n\nLe message envoyé ne peut pas être traité par le modèle.\n\n**Causes probables :**\n- Le message est trop long.\n- Le contenu a été bloqué par les filtres de sécurité (Safety Settings).\n- Format de requête non supporté.";
      } else if (errorMsg.toLowerCase().includes('fetch') || errorMsg.toLowerCase().includes('network')) {
        displayMessage = "### 🌐 Erreur Réseau\n\nImpossible d'établir une connexion avec les serveurs distants.\n\n**Action recommandée :** Vérifiez votre connexion internet et assurez-vous qu'aucun pare-feu ne bloque le trafic vers `generativelanguage.googleapis.com`.";
      } else if (errorMsg.includes('Requested entity was not found')) {
        displayMessage = "### 🔍 Entité Introuvable\n\nLe modèle ou la ressource demandée n'existe pas ou n'est plus accessible.\n\n**Action recommandée :** Si vous utilisez une clé API personnalisée, assurez-vous qu'elle est correctement configurée.";
      }

      setMessages(prev => [...prev, {
        role: 'model',
        content: displayMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'model', 
      content: "Session réinitialisée. En quoi puis-je vous être utile ?", 
      timestamp: new Date() 
    }]);
    setApiKeyError(false);
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
        <code className={`bg-black/30 px-1 rounded text-orange-400 font-mono text-sm ${className || ''}`}>
          {children}
        </code>
      );
    },
  }), []);

  return (
    <div className="h-full flex flex-col bg-[#2D2D2D] text-gray-100 overflow-hidden font-sans">
      {/* Header Info */}
      <div className="bg-black/20 p-3 border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${apiKeyError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">Intelligence Core v3.0</span>
        </div>
        <button 
          onClick={clearChat}
          className="text-[10px] uppercase font-bold text-gray-400 hover:text-[#E95420] transition-colors"
        >
          Effacer la discussion
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`p-4 rounded-2xl shadow-lg relative ${
                  msg.role === 'user' 
                    ? 'bg-[#772953] text-white rounded-tr-none' 
                    : 'bg-[#3D3D3D] text-gray-100 border border-white/5 rounded-tl-none'
                }`}
              >
                <div className="terminal-markdown prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              <span className="text-[10px] mt-1 text-white/30 font-medium">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-[#3D3D3D] p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-[#E95420] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#E95420] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-[#E95420] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-xs text-white/40 italic pl-2">Système en réflexion...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/5 shrink-0">
        <form onSubmit={handleSend} className="flex items-center space-x-3 bg-[#3D3D3D] rounded-xl p-1 border border-white/10 focus-within:border-[#E95420] transition-colors shadow-inner">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-white placeholder-white/30"
            placeholder={apiKeyError ? "Erreur API : Vérifiez votre clé." : "Posez votre question à l'intelligence centrale..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || apiKeyError}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || apiKeyError}
            className={`p-2 rounded-lg transition-all ${
              !input.trim() || isTyping || apiKeyError
                ? 'text-white/20' 
                : 'text-white bg-[#E95420] hover:bg-[#d94410] shadow-lg shadow-orange-900/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <div className="mt-2 text-[9px] text-center text-white/20 uppercase tracking-[2px] font-bold">
          Gemini 3 Flash Powered Neural Interface
        </div>
      </div>
    </div>
  );
};

export default AIChat;
