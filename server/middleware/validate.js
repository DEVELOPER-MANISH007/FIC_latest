import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Runs after express-validator field validators.
 * If validation failed, forwards a 422 ApiError with a list
 * of human-readable messages; otherwise continues to the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = errors.array().map((err) => err.msg);
  next(new ApiError(422, "Validation failed", extractedErrors));
};

export default validate;

