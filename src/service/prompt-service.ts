import logger from "../util/logger";
import { ConvoGenParam, GenAI, LLM } from "./llm-service";
import {
  Template,
  TemplateResponseMap,
  TemplateValue,
} from "./template-config";

export interface ConversationHistory {
  prompt: string;
  response: string;
}

export async function generateResponse<T extends TemplateValue>(
  { prompt, attachmentUrls, template, history }: ConvoGenParam,
  llm: GenAI = LLM.GEMINI
) {
  if (!prompt) {
    logger.warn("[prompt-service] generateResponse called without user input");
    throw new Error("User input is required");
  }

  logger.info(`[prompt-service] generating response for prompt: ${prompt}`);
  logger.info(
    `[prompt-service] attachments: ${JSON.stringify(
      attachmentUrls
    )}, template: ${template}, history length: ${history?.length || 0}`
  );

  try {
    const response = await llm.invoke({
      prompt: prompt,
      attachmentUrls: attachmentUrls ?? [],
      template: template || Template.DEFAULT,
      history: history || [],
    });

    return {
      text: response?.text,
      image: "",
    };
  } catch (error) {
    logger.error(error);
    return {
      response: JSON.parse(
        JSON.stringify({ error: "Failed to generate response" })
      ) as TemplateResponseMap[T],
      image: "",
    };
  }
}
