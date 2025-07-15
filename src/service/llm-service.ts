import { GeminiLLM } from "./llms/gemini-service";
import { ConversationHistory } from "./prompt-service";
import { TemplateValue } from "./template-config";

export interface ConvoGenParam {
  prompt: string;
  template: TemplateValue;
  attachmentUrls?: string[];
  history?: ConversationHistory[];
}

export interface GenAI {
  invoke(params: ConvoGenParam): Promise<LLMResponse>;
}

export interface LLMResponse {
  text: string;
  image: string;
}

export const LLM = {
  GEMINI: GeminiLLM.create(),
};
