import { Response } from "express";
import Message from "../model/message.model";
import { AuthRequest } from "../types/auth-request";
import { HTTPResponse } from "../util/http-response";
import Chat from "../model/chat.model";
import { Template, TemplateValue } from "../service/template-config";
import {
  ConversationHistory,
  generateResponse,
} from "../service/prompt-service";
import { Types } from "mongoose";

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, attachmentUrls, template } = req.body;
    const chatId = req.params.chatId as string;

    if (!Types.ObjectId.isValid(chatId)) {
      HTTPResponse.badRequest(res, "Invalid chat ID format");
      return;
    }

    if (!prompt) {
      HTTPResponse.badRequest(res, "Empty prompt or invalid prompt");
      return;
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      HTTPResponse.notFound(res, `Chat not found for id ${chatId}`);
      return;
    }

    const templateType: TemplateValue = template || Template.TUTOR;

    const messages = await Message.find({ chat: chat.id })
      .sort({ createdAt: 1 })
      .lean();
    const history: ConversationHistory[] = messages.map((msg) => {
      return {
        prompt: msg.prompt,
        response: JSON.stringify(msg.response),
      };
    });

    const ai = await generateResponse({
      prompt: prompt,
      attachmentUrls: attachmentUrls,
      template: templateType,
      history: history,
    });

    if (!ai) {
      HTTPResponse.internalServerError(res, "Failed to generate response");
      return;
    }

    const parsed = JSON.parse(ai.text!);
    const message = await Message.create({
      chat: chat.id,
      prompt: prompt,
      response: parsed.response,
    });

    if (!message) {
      HTTPResponse.internalServerError(res, "Failed to create message");
      return;
    }

    HTTPResponse.created(res, "Message successfully created", message);
  } catch (error) {
    console.log(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpected error has occurred",
      error
    );
  }
};

export const getMessagesByChatId = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .sort({
        createdAt: 1,
      })
      .lean();

    if (!messages || messages.length === 0) {
      HTTPResponse.notFound(res, `No message found for chatId ${chatId}`);
    }

    HTTPResponse.ok(res, `Messages found for chatId ${chatId}`, messages);
  } catch (error: unknown) {
    console.log(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpected error has occurred",
      error
    );
  }
};
