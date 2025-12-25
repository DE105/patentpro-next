
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

// Complex Text Tasks like patent drafting and analysis require the specialized gemini-3-pro-preview model.
const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzePatentTask = async (
  prompt: string, 
  systemInstruction: string,
  useThinking: boolean = true,
  useSearch: boolean = false,
  mediaItems?: { data: string; mimeType: string }[]
): Promise<AnalysisResult> => {
  // Always use a named parameter and direct process.env.API_KEY access.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const config: any = {
    systemInstruction,
    temperature: 0.7,
  };

  if (useThinking) {
    // The maximum thinking budget for gemini-3-pro-preview is 32768.
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const parts: any[] = [{ text: prompt }];
  if (mediaItems && mediaItems.length > 0) {
    mediaItems.forEach(item => {
      parts.push({
        inlineData: {
          data: item.data,
          mimeType: item.mimeType,
        },
      });
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config,
    });

    return {
      // response.text is a property, not a method.
      response: response.text || "未能生成有效响应。",
      groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
