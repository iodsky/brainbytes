import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth-request";
import { HTTPResponse } from "../util/http-response";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    HTTPResponse.error(res, 401, "No token provided in cookies.");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (err: any) {
    const isExpired = err.name === "TokenExpiredError";
    const isInvalid = err.name === "JsonWebTokenError";

    if (isExpired) {
      HTTPResponse.error(res, 403, "Token has expired.");
      return;
    }

    if (isInvalid) {
      HTTPResponse.error(res, 403, "Invalid token");
      return;
    }

    HTTPResponse.error(res, 403, "Unable to verify token");
  }
};
