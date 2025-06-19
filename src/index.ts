import app from "./app";
import { connectDB } from "./util/database";

const PORT = process.env.PORT || 8000;

// Connect DB and start server
const initServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`👍 Server running on port ${PORT}`);
  });
};

initServer();
