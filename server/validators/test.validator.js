import { body } from "express-validator";

const fields = [
  ["testName", (rule) => rule.trim().notEmpty().withMessage("Test name is required")],
  ["duration", (rule) => rule.isInt({ min: 1 }).withMessage("Duration must be at least one minute")],
  ["totalQuestions", (rule) => rule.isInt({ min: 1 }).withMessage("Question count must be at least one")],
  ["topic", (rule) => rule.optional().trim()],
  ["difficulty", (rule) => rule.optional().isIn(["Easy", "Medium", "Hard", "Mixed"])],
  ["passingMarks", (rule) => rule.isFloat({ min: 0, max: 100 }).withMessage("Passing marks must be a percentage")],
  ["categoryDistribution", (rule) => rule.optional().isArray()],
  ["isActive", (rule) => rule.optional().isBoolean()],
  ["allowRetest", (rule) => rule.optional().isBoolean()],
  ["showExplanationAfterSubmit", (rule) => rule.optional().isBoolean()],
];

export const testRules = fields.map(([key, apply]) => apply(body(key)));
export const testUpdateRules = fields.map(([key, apply]) => apply(body(key).optional()));
