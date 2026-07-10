import connectDB from "../config/db.js";
import ApiError from "../utils/ApiError.js";

/**
 * Ensures MongoDB is connected before API handlers run.
 * Required on Vercel where the process does not stay alive between requests.
 */
const ensureDb = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("[ensureDb] Database unavailable:", error.message);
    next(new ApiError(503, "Database is temporarily unavailable. Please try again shortly."));
  }
};

export default ensureDb;
