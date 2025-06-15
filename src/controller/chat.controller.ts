import { Response } from "express";
import { AuthRequest } from "../types/auth-request";
import { promptService } from "../service/prompt-service";
import { Template, TemplateValue } from "../service/template-config";
import Message from "../model/message.model";
import Chat from "../model/chat.model";
import { HTTPResponse } from "../util/http-response";

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, attachmentUrls, template } = req.body;
    const templateType: TemplateValue = template || Template.TUTOR;

    if (!prompt) {
      HTTPResponse.error(res, 400, "Empty prompt");
      return;
    }

    const chatMetaDataGenerator = await promptService.build().generateResponse({
      userInput: String(prompt),
      template: Template.GENERATE_TITLE,
    });

    console.info(
      `AI response: ${JSON.stringify(chatMetaDataGenerator.response)}`
    );

    const chatMetaData = JSON.parse(chatMetaDataGenerator.text!);
    console.log("Chat MetaData: ", chatMetaData);

    if (!chatMetaData) {
      console.error("Failed to generate chat metadata");
      HTTPResponse.error(res, 500, "Failed to generate chat metadata");
      return;
    }

    const chat = await Chat.create({
      user: req.userId,
      ...chatMetaData,
    });

    if (!Chat) {
      console.error("Failed to create Chat");
      HTTPResponse.error(res, 500, "Failed to create chat");
      return;
    }

    const ai = await promptService.build().generateResponse({
      userInput: prompt,
      attachmentsUrls: attachmentUrls,
      template: templateType,
    });

    const parsed = JSON.parse(ai.text!);
    const message = await Message.create({
      chat: chat.id,
      prompt: prompt,
      response: parsed.response,
    });

    HTTPResponse.success(res, 201, "Chat successfully created", [
      chat,
      message,
    ]);
  } catch (error) {
    console.error(error);
    HTTPResponse.error(res, 500, "An unexpected error has occured.", error);
  }
};

export const getUserChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await Chat.find({ user: userId }).sort({
      createdAt: -1,
    });

    HTTPResponse.success(res, 200, "Chat successfully retrieved", result);
  } catch (error) {
    console.error(error);
    HTTPResponse.error(res, 500, "An unexpcted error has occured", error);
  }
};

export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id;

    const toDelete = await Chat.findById(id);
    if (!toDelete) {
      HTTPResponse.error(res, 404, `Chat not found for id: ${id}`);
      return;
    }

    if (String(toDelete.user) !== userId) {
      HTTPResponse.error(res, 401, "You are unauthorized to delete this chat");
      return;
    }

    await toDelete.deleteOne();
    HTTPResponse.success(res, 200, "Chat successfully deleted");
  } catch (error) {
    console.error(error);
    HTTPResponse.error(res, 500, "An unexpected error has occurred", error);
  }
};

export const updateChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const title = req.body?.title;

    if (!title) {
      HTTPResponse.error(res, 400, "Please provided chat title");
      return;
    }

    const toUpdate = await Chat.findById(id);

    if (!toUpdate) {
      HTTPResponse.error(res, 404, `Chat not found for id ${id}`);
      return;
    }

    if (String(toUpdate.user) !== userId) {
      HTTPResponse.error(res, 401, `You are authorized to update this chat`);
      return;
    }

    if (toUpdate.title === title) {
      HTTPResponse.success(res, 200, `Chat details are up to date.`);
      return;
    }

    toUpdate.title = title;
    await toUpdate.save();

    HTTPResponse.success(res, 200, `Chat title successfully update`, toUpdate);
  } catch (error) {
    console.error(error);
    HTTPResponse.error(res, 500, "An unexpected error has occurred", error);
  }
};
