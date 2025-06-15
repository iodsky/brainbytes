import { GenAI, LLM } from "./llm-service";
import {
  Template,
  TemplateResponseMap,
  TemplateValue,
} from "./template-config";

export interface ConversationHistory {
  prompt: string;
  response: string;
}

class PromptService {
  constructor() {
    console.info("ℹ️  PromptService initialized");
  }

  build(llm?: GenAI) {
    console.debug(
      `ℹ️  Building PromptResponseGenerator with LLM: ${
        llm?.constructor?.name || "Default (Gemini)"
      }`
    );
    return new PromptResponseGenerator(llm || LLM.GEMINI);
  }
}

interface GenerateConversationParams {
  userInput: string;
  attachmentsUrls?: string[];
  history?: ConversationHistory[];
  template?: TemplateValue;
}

class PromptResponseGenerator {
  constructor(private llm: GenAI) {}

  async generateResponse<T extends TemplateValue>({
    userInput,
    attachmentsUrls,
    template,
    history,
  }: GenerateConversationParams) {
    if (!userInput) {
      console.warn(
        "PromptResponseGenerator: generateResponse called without user input"
      );
      throw new Error("User input is required");
    }

    console.info(
      `[prompt-service] Generating response for user input: ${userInput}`
    );
    console.debug(
      `Attachments: ${JSON.stringify(
        attachmentsUrls
      )}, Template: ${template}, History length: ${history?.length || 0}`
    );

    try {
      const response = await this.llm.invoke({
        prompt: userInput,
        attachmentUrls: attachmentsUrls || [],
        template: template || Template.DEFAULT,
        history: history || [],
      });

      console.info("[prompt-service] Returning text response: ", response.text);
      return {
        text: response?.text,
        image: "",
      };
    } catch (error) {
      return {
        response: JSON.parse(
          JSON.stringify({ error: "Failed to generate response" })
        ) as TemplateResponseMap[T],
        image: "",
      };
    }
  }
}

export const promptService = new PromptService();
