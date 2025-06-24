import { createPartFromUri, GoogleGenAI } from "@google/genai";
import { ConvoGenParam, GenAI } from "../llm-service";
import { GeminiConfig } from "../templates/gemini-configs";

const BASE_MODEL = "gemini-2.0-flash";

export class GeminiLLM implements GenAI {
  async invoke({
    prompt,
    attachmentUrls = [],
    template,
    history,
  }: ConvoGenParam) {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    const attachments = await Promise.all(
      attachmentUrls.map(async (url) => {
        if (!url || url === "") {
          return null;
        }

        try {
          return await client.files.upload({ file: url });
        } catch (err) {
          console.error(
            `Error fetching or uploading file from URL: ${url}`,
            err
          );
          return null;
        }
      })
    );

    const validAttachments = attachments.filter((file) => file !== null);

    const geminiHistory = history?.flatMap((item) => {
      return [
        {
          role: "user",
          parts: [{ text: item.prompt || "" }],
        },
        {
          role: "model",
          parts: [{ text: item.response || "" }],
        },
      ];
    });

    const chat = client.chats.create({
      model: BASE_MODEL,
      history: geminiHistory,
      config: GeminiConfig[template],
    });

    const geminiResponse = await chat
      .sendMessage({
        message: [
          prompt,
          ...validAttachments.map((attachment) =>
            createPartFromUri(attachment.uri ?? "", attachment.mimeType ?? "")
          ),
        ],
      })
      .catch((error) => {
        console.error(`[gemini-sercice] Error generating response: `, error);
        return null;
      });

    if (!geminiResponse) {
      return { text: "", image: "" };
    }

    console.info("[gemini-service] Generated response: " + geminiResponse.text);

    return {
      text: geminiResponse?.text?.trim() || "",
      image: "",
    };
  }

  static create() {
    return new GeminiLLM();
  }
}
