import app from "./app";
import { connectDB } from "./util/database";
import logger from "./util/logger";

const PORT = process.env.PORT || 8000;

// Connect DB and start server
const initServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

initServer();
