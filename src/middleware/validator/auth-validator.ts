import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const authValidator = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be 8 charactes long"),
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ success: false, message: "validation error", data: errors });
      return;
    }
    next();
  },
];

export default authValidator;
