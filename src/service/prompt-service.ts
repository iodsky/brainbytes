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
    console.warn(
      "PromptResponseGenerator: generateResponse called without user input"
    );
    throw new Error("User input is required");
  }

  console.info(`[prompt-service] Generating response for prompt: ${prompt}`);
  console.debug(
    `Attachments: ${JSON.stringify(
      attachmentUrls
    )}, Template: ${template}, History length: ${history?.length || 0}`
  );

  try {
    const response = await llm.invoke({
      prompt: prompt,
      attachmentUrls: attachmentUrls ?? [],
      template: template || Template.DEFAULT,
      history: history || [],
    });

    console.info("[prompt-service] Returning text response: ", response.text);
    return {
      text: response?.text,
      image: "",
    };
  } catch (error) {
    console.error(error);
    return {
      response: JSON.parse(
        JSON.stringify({ error: "Failed to generate response" })
      ) as TemplateResponseMap[T],
      image: "",
    };
  }
}
