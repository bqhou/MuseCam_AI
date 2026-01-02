import { GoogleGenAI, Type } from "@google/genai";
import { PromptSuggestion } from "../types";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateIceBreakers = async (): Promise<PromptSuggestion[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = "Generate 3 creative, thought-provoking, and open-ended questions that a person could answer in a short video log or diary entry. Return them as a JSON list.";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              category: { type: Type.STRING, description: "E.g. 'Personal Growth', 'Creativity', 'Memory'" }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PromptSuggestion[];
    }
    return [];
  } catch (error) {
    console.error("Error generating ice breakers:", error);
    return [
      { text: "What is a small moment that brought you joy today?", category: "Gratitude" },
      { text: "If you could send a message to your future self, what would it be?", category: "Reflection" },
      { text: "Describe a place where you feel most at peace.", category: "Memory" }
    ];
  }
};

// Export the client for use in the Live API hooks
export const getGeminiClient = () => ai;
