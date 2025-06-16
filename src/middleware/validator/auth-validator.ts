import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { HTTPResponse } from "../../util/http-response";

const authValidator = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be 8 charactes long"),
  body("firstName").notEmpty().withMessage("First name cannot be empty"),
  body("lastName").notEmpty().withMessage("Last name cannot be empty"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errText = errors
        .array()
        .map((err) => err.msg)
        .join(", ");
      HTTPResponse.badRequest(res, "Validation failed", errText);
      return;
    }
    next();
  },
];

export default authValidator;
