
import { GoogleGenAI } from "@google/genai";

export interface GeminiResponse {
  text: string;
  sources?: { title: string; uri: string }[];
}

export class GeminiService {
  private getAI(): GoogleGenAI {
    // We recreate the instance to ensure we use the most up-to-date API key from the platform dialog
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });
  }

  async processCommand(command: string): Promise<GeminiResponse> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: command,
        config: {
          systemInstruction: `Tu es 'Ubuntu Intelligence', un assistant IA très sophistiqué intégré dans un environnement web Ubuntu 24.04. 
          Les utilisateurs interagissent via un terminal.
          - Utilise un formatage adapté au terminal (tableaux et listes à espacement fixe).
          - Si l'utilisateur pose des questions sur l'actualité, utilise ton outil de recherche.
          - Adopte une personnalité professionnelle, serviable et centrée sur Ubuntu.
          - Fournis toujours les URL des sources si tu utilises l'ancrage Google Search.`,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });

      const text = response.text || "Aucune réponse reçue du système.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks?.map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || ''
      })).filter(s => s.uri !== '') || [];

      return { text, sources };
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
