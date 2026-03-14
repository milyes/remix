
import { GoogleGenAI, Type } from "@google/genai";

export interface GeminiResponse {
  text: string;
  sources?: { title: string; uri: string }[];
  functionCalls?: any[];
}

export class GeminiService {
  private getAI(): GoogleGenAI {
    // We recreate the instance to ensure we use the most up-to-date API key from the platform dialog
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });
  }

  async processCommand(command: string, history: any[] = []): Promise<GeminiResponse> {
    try {
      const ai = this.getAI();
      
      const tools = [
        {
          functionDeclarations: [
            {
              name: "list_files",
              description: "Liste les fichiers et répertoires dans un chemin donné du système de fichiers virtuel Ubuntu.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  path: {
                    type: Type.STRING,
                    description: "Le chemin du répertoire à lister (par défaut '.' pour le répertoire courant)."
                  }
                }
              }
            },
            {
              name: "read_file",
              description: "Lit le contenu d'un fichier spécifique dans le système de fichiers virtuel.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  path: {
                    type: Type.STRING,
                    description: "Le chemin du fichier à lire."
                  }
                },
                required: ["path"]
              }
            },
            {
              name: "execute_command",
              description: "Exécute une commande shell Ubuntu standard (ex: 'uname', 'uptime', 'date', 'whoami').",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  command: {
                    type: Type.STRING,
                    description: "La commande à exécuter."
                  }
                },
                required: ["command"]
              }
            }
          ]
        },
        { googleSearch: {} }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: command }] }
        ],
        config: {
          systemInstruction: `Tu es 'Ubuntu Intelligence', un assistant IA très sophistiqué intégré dans un environnement web Ubuntu 24.04. 
          Les utilisateurs interagissent via un terminal.
          - Tu as accès à des outils pour interagir avec le système de fichiers virtuel et exécuter des commandes système.
          - Utilise un formatage adapté au terminal (tableaux et listes à espacement fixe).
          - Si l'utilisateur demande d'effectuer une action (lister des fichiers, lire un fichier, etc.), utilise les outils appropriés.
          - Si l'utilisateur pose des questions sur l'actualité, utilise ton outil de recherche.
          - Adopte une personnalité professionnelle, serviable et centrée sur Ubuntu.
          - Fournis toujours les URL des sources si tu utilises l'ancrage Google Search.
          - Sois concis et efficace dans tes réponses.`,
          tools,
          temperature: 0.7,
        },
      });

      const text = response.text || "";
      const functionCalls = response.functionCalls;
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks?.map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || ''
      })).filter(s => s.uri !== '') || [];

      return { text, sources, functionCalls };
    } catch (error: unknown) {
      // Safe logging to avoid circular structures
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Gemini API Error:", errorMsg);
      
      let errorMessage = `### ⚠️ Erreur Système Critique\n\nUne défaillance imprévue a été détectée dans le noyau neuronal.`;
      let errorStringForDisplay = errorMsg;

      if (errorStringForDisplay.includes('403') || errorStringForDisplay.includes('PERMISSION_DENIED')) {
        errorMessage = `### 🚫 Accès Refusé (403)\n\nLe noyau neuronal refuse la connexion.\n\n**Causes probables :**\n- La clé API n'a pas les permissions nécessaires.\n- Le projet Google Cloud n'a pas activé l'API Gemini.\n\n**Action recommandée :** Allez dans **Paramètres** > **Intelligence Artificielle** pour configurer votre clé API.`;
      } else if (errorStringForDisplay.includes('401') || errorStringForDisplay.includes('UNAUTHENTICATED')) {
        errorMessage = `### 🔑 Erreur d'Authentification (401)\n\nLa clé API fournie est invalide ou a expiré.\n\n**Action recommandée :** Veuillez générer une nouvelle clé sur [Google AI Studio](https://aistudio.google.com/app/apikey) et la mettre à jour dans vos paramètres.`;
      } else if (errorStringForDisplay.includes('429') || errorStringForDisplay.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = `### ⏳ Quota Épuisé (429)\n\nVous avez atteint la limite de requêtes autorisées pour votre clé API.\n\n**Action recommandée :** Attendez quelques minutes ou passez à un plan supérieur si nécessaire.`;
      } else if (errorStringForDisplay.includes('503') || errorStringForDisplay.includes('UNAVAILABLE')) {
        errorMessage = `### ☁️ Service Indisponible (503)\n\nLes serveurs de Gemini sont actuellement surchargés ou en maintenance.\n\n**Action recommandée :** Réessayez dans quelques instants.`;
      } else if (errorStringForDisplay.includes('400') || errorStringForDisplay.includes('INVALID_ARGUMENT')) {
        errorMessage = `### 📝 Requête Invalide (400)\n\nLe message envoyé ne peut pas être traité par le modèle.\n\n**Causes probables :**\n- Le contenu a été bloqué par les filtres de sécurité.\n- Format de requête non supporté.`;
      } else if (errorStringForDisplay.toLowerCase().includes('fetch') || errorStringForDisplay.toLowerCase().includes('network')) {
        errorMessage = `### 🌐 Erreur Réseau\n\nImpossible d'établir une connexion avec les serveurs distants. Vérifiez votre connexion internet.`;
      } else {
        errorMessage = `### ⚠️ Erreur Système\n\nUn problème inattendu est survenu.\n\n\`\`\`\n${errorStringForDisplay}\n\`\`\``;
      }

      return { 
        text: errorMessage,
        sources: [] 
      };
    }
  }
}

export const geminiService = new GeminiService();
