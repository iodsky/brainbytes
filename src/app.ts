import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import { HTTPResponse } from "./util/http-response";
import { authenticateToken } from "./middleware/authenticate-token";
import { Request, Response } from "express";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
if (process.env.ENABLE_CORS === "true") {
  app.use(
    cors({
      origin: process.env.CLIENT_IP,
      credentials: true,
    })
  );
}
app.use(cookieParser());

// Routes
app.get("/health", (_req: Request, res: Response) => {
  HTTPResponse.ok(res);
});
app.use("/auth", authRoutes);
app.use("/chat", authenticateToken, chatRoutes);
app.use("/message", authenticateToken, messageRoutes);

export default app;
