import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth-request";
import { HTTPResponse } from "../util/http-response";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    HTTPResponse.badRequest(res, "No token provided in cookies.");
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
      HTTPResponse.forbidden(res, "Token has expired.");
      return;
    }

    if (isInvalid) {
      HTTPResponse.forbidden(res, "Invalid token");
      return;
    }

    HTTPResponse.forbidden(res, "Unable to verify token");
  }
};
