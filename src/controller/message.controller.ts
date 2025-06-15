import { Response } from "express";
import Message from "../model/message.model";
import { AuthRequest } from "../types/auth-request";
import { HTTPResponse } from "../util/http-response";
import Chat from "../model/chat.model";
import { Template, TemplateValue } from "../service/template-config";
import { ConversationHistory, promptService } from "../service/prompt-service";
import { Types } from "mongoose";

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, attachmentsUrls, template } = req.body;
    const chatId = req.params.chatId as string;

    if (!Types.ObjectId.isValid(chatId)) {
      HTTPResponse.error(res, 400, "Invalid chat ID format");
      return;
    }

    if (!prompt) {
      HTTPResponse.error(res, 400, "Empty prompt or invalid prompt");
      return;
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      HTTPResponse.error(res, 404, `Chat not found for id ${chatId}`);
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

    const ai = await promptService.build().generateResponse({
      userInput: prompt,
      attachmentsUrls: attachmentsUrls,
      template: templateType,
      history: history,
    });

    if (!ai) {
      HTTPResponse.error(res, 500, "Failed to generate response");
      return;
    }

    const parsed = JSON.parse(ai.text!);
    const message = await Message.create({
      chat: chat.id,
      prompt: prompt,
      response: parsed.response,
    });

    if (!message) {
      HTTPResponse.error(res, 500, "Failed to create message");
      return;
    }

    HTTPResponse.success(res, 201, "Message successfully created", message);
  } catch (error) {
    console.log(error);
    HTTPResponse.error(res, 500, "An unexpected error has occurred", error);
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

    res.status(200).json({
      success: true,
      message: `messages found for chatId ${chatId}`,
      data: messages,
    });
  } catch (error: any) {
    HTTPResponse.error(res, 500, "An unexpected error has occurred", error);
  }
};
