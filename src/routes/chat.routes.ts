import express from "express";
import {
  createChat,
  deleteChat,
  getUserChat,
  updateChat,
} from "../controller/chat.controller";

const router = express.Router();

router.post("/", createChat);
router.get("/", getUserChat);
router.patch("/:id", updateChat);
router.delete("/:id", deleteChat);

export default router;
