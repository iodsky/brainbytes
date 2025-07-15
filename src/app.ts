import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import { HTTPResponse } from "./util/http-response";
import { authenticateToken } from "./middleware/authenticate-token";
import { Request, Response } from "express";
import httpLogger from "./middleware/httpLogger";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);

// Routes
app.get("/health", (_req: Request, res: Response) => {
  HTTPResponse.ok(res);
});
app.use("/auth", authRoutes);
app.use("/chat", authenticateToken, chatRoutes);
app.use("/message", authenticateToken, messageRoutes);

export default app;
