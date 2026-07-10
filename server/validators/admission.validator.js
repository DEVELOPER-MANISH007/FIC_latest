import { body } from "express-validator";

export const admissionValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit mobile number"),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("fatherName")
    .trim()
    .notEmpty()
    .withMessage("Father's name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Father's name must be between 2 and 100 characters"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 300 })
    .withMessage("Address cannot exceed 300 characters"),

  body("course").trim().notEmpty().withMessage("Please select an interested course"),

  body("qualification")
    .trim()
    .notEmpty()
    .withMessage("Qualification is required")
    .isLength({ max: 150 })
    .withMessage("Qualification cannot exceed 150 characters"),

  body("message")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message cannot exceed 1000 characters"),
];
