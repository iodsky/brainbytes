import { Response } from "express";

export const HTTPResponse = {
  success<T>(res: Response, statusCode: number, message: string, data?: T) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error<T>(
    res: Response,
    statusCode: number,
    message?: string,
    errorDetails?: T
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errorDetails,
    });
  },
};
