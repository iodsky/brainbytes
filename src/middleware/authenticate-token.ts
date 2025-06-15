import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth-request";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
