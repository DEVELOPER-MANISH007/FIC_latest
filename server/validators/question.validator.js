import { body } from "express-validator";

export const questionValidationRules = [
  body("category").notEmpty().withMessage("Category is required"),
  body("question").trim().notEmpty().withMessage("Question text is required"),
  body("optionA").trim().notEmpty().withMessage("Option A is required"),
  body("optionB").trim().notEmpty().withMessage("Option B is required"),
  body("optionC").trim().notEmpty().withMessage("Option C is required"),
  body("optionD").trim().notEmpty().withMessage("Option D is required"),
  body("correctAnswer").isIn(["A", "B", "C", "D"]).withMessage("Correct answer must be A, B, C or D"),
  body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]),
  body("marks").optional().isFloat({ min: 0 }),
];

