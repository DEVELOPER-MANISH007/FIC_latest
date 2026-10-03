import { body } from "express-validator";

export const adminLoginValidationRules = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

