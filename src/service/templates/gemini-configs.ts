import { GenerateContentConfig, Type } from "@google/genai";
import { TemplateTypeConfig } from "../template-config";
import { AI_TUTOR_INSTRUCTION } from "../prompt-instructions";
import { Subject } from "../../model/chat.model";

export const GeminiConfig: TemplateTypeConfig<GenerateContentConfig> = {
  default: {
    maxOutputTokens: 1024,
    temperature: 0.7,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        response: { type: Type.STRING },
      },
    },
  },

  generate_title: {
    maxOutputTokens: 128,
    temperature: 0.8,
    systemInstruction:
      "For this task you are expcted to generate a title or name (short and catchy) for the following text. And categorize the text based on the subject.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subject: { type: Type.STRING, enum: Object.values(Subject) },
      },
    },
  },

  tutor: {
    systemInstruction: AI_TUTOR_INSTRUCTION,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        response: { type: Type.STRING },
      },
    },
  },

  summarize: {
    maxOutputTokens: 512,
    temperature: 0.3,
    systemInstruction:
      AI_TUTOR_INSTRUCTION +
      "For this task you are expected to summarize the following text.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        response: { type: Type.STRING },
      },
    },
  },

  explain_like_im_5: {
    maxOutputTokens: 512,
    temperature: 0.2,
    systemInstruction:
      AI_TUTOR_INSTRUCTION +
      "For this task you are expected to explain the following text like I am a 5 years old.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        response: { type: Type.STRING },
      },
    },
  },
};
