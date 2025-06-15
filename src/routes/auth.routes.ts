import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/auth.controller";
import authValidator from "../middleware/validator/auth-validator";

const router = express.Router();

router.post("/register", authValidator, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
