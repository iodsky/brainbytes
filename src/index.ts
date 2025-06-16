import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import convoRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import { authenticateToken } from "./middleware/authenticate-token";
import { connectDB, flushDB } from "./util/database";

dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 8000;

// middlewares
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

app.use("/auth", authRoutes);
app.use("/chat", authenticateToken, convoRoutes);
app.use("/message", authenticateToken, messageRoutes);

// Connect DB and start server
const initServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`👍 Server running on port ${PORT}`);
  });
};

initServer();
