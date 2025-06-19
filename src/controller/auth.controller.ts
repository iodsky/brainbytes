import { Request, Response } from "express";
import User from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HTTPResponse } from "../util/http-response";

export const registerUser = async (req: Request, res: Response) => {
  try {
    // Get user data from request
    const { firstName, lastName, email, password } = req.body;

    // Check if user exits
    const userExists = await User.findOne({ email });
    if (userExists) {
      HTTPResponse.conflict(res, "An account with this email already exists.");
      return;
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // create and save user
    const user = new User({ firstName, lastName, email, password: hashed });
    await user.save();

    // create jwt
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // set jwt in http-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // return success response
    HTTPResponse.created(res, "User resgistration success", user);
  } catch (error) {
    console.error(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpected error has occurred",
      error
    );
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    //Get user email and password
    const { email, password } = req.body;

    if (!email || !password) {
      HTTPResponse.badRequest(res, "Email and password required");
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      HTTPResponse.notFound(res, "User with this email does not exist.");
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      HTTPResponse.badRequest(res, "Incorrect password");
      return;
    }

    // create jwt
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // set jwt in http-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // return success response
    HTTPResponse.ok(res, "Login success");
  } catch (error: unknown) {
    console.error(error);
    HTTPResponse.internalServerError(
      res,
      "An unexpected error has occurred",
      error
    );
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  HTTPResponse.ok(res, "Logout success");
};
