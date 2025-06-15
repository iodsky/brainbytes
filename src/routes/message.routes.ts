import express from "express";
import {
  createMessage,
  getMessagesByChatId,
} from "../controller/message.controller";

const router = express.Router();

router.post("/:chatId", createMessage);
router.get("/:chatId", getMessagesByChatId);

export default router;
