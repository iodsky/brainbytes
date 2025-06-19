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
      HTTPResponse.badRequest(res, "Empty prompt");
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
      HTTPResponse.internalServerError(res, "Failed to generate chat metadata");
      return;
    }

    const chat = await Chat.create({
      user: req.userId,
      ...chatMetaData,
    });

    if (!Chat) {
      console.error("Failed to create Chat");
      HTTPResponse.internalServerError(res, "Failed to create chat");
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

    HTTPResponse.created(res, "Chat successfully created", {
      chat: chat,
      message: message,
    });
  } catch (error) {
    console.error(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpected error has occured.",
      error
    );
  }
};

export const getUserChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await Chat.find({ user: userId }).sort({
      createdAt: -1,
    });

    HTTPResponse.ok(res, "Chat successfully retrieved", result);
  } catch (error) {
    console.error(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpcted error has occured",
      error
    );
  }
};

export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id;

    const toDelete = await Chat.findById(id);
    if (!toDelete) {
      HTTPResponse.notFound(res, `Chat not found for id: ${id}`);
      return;
    }

    if (String(toDelete.user) !== userId) {
      HTTPResponse.unauthorized(
        res,
        "You are unauthorized to delete this chat"
      );
      return;
    }

    await Chat.findOneAndDelete({ _id: id });
    HTTPResponse.ok(res, "Chat successfully deleted");
  } catch (error) {
    console.error(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpected error has occurred",
      error
    );
  }
};

export const updateChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const title = req.body?.title;

    if (!title) {
      HTTPResponse.badRequest(res, "Please provided chat title");
      return;
    }

    const toUpdate = await Chat.findById(id);

    if (!toUpdate) {
      HTTPResponse.notFound(res, `Chat not found for id ${id}`);
      return;
    }

    if (String(toUpdate.user) !== userId) {
      HTTPResponse.unauthorized(res, "You are authorized to update this chat");
      return;
    }

    if (toUpdate.title === title) {
      HTTPResponse.ok(res, "Chat details are up to date");
      return;
    }

    toUpdate.title = title;
    await toUpdate.save();

    HTTPResponse.ok(res, "Chat title successfully update", toUpdate);
  } catch (error) {
    console.error(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpected error has occurred",
      error
    );
  }
};
