import { body } from "express-validator";

// signupValidationRules is no longer wired to any route (public
// registration removed — see #9) but stays exported in case an admin tool
// wants the same shape validation for account creation fields later.
export const signupValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Please provide a valid email address"),
  body("phone").trim().matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid 10-digit mobile number"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("course").optional({ checkFalsy: true }).trim(),
  body("address").optional({ checkFalsy: true }).trim(),
];

// Accepts either an email address or a username as the login identifier.
export const loginValidationRules = [
  body("email").trim().notEmpty().withMessage("Please enter your email or username"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidationRules = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address"),
];

export const resetPasswordValidationRules = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];
