import morgan from "morgan";
import logger from "../util/logger";

const httpLogger = morgan("combined", {
  stream: {
    write: (message: string) => logger.http(message.trim()),
  },
});

export default httpLogger;
