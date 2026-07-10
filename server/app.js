import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import ensureDb from "./middleware/ensureDb.js";
import isServerless from "./utils/isServerless.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: [path.join(__dirname, ".env"), path.join(__dirname, "../.env.development.local")],
});

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  process.env.JWT_SECRET = "fic_9f2c1d7e84ab4c6a9e51d3f0b7a8c2e6d4f19b3a7c5e8d20461f7b9a3c5d8e01";
  console.warn("JWT_SECRET not set - using development fallback secret.");
}

const parseCorsOrigins = () => {
  const raw = process.env.CLIENT_URL || "http://localhost:5173";
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
};

const createApp = () => {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: parseCorsOrigins(),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  if (!isServerless()) {
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  }

  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Future IT College API is running",
      docs: "/api/health",
    });
  });

  app.use("/api", ensureDb, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const app = createApp();

/** Eager DB connect for long-running local/traditional servers only. */
if (!isServerless()) {
  connectDB().catch((error) => {
    console.error("Initial MongoDB connection failed:", error.message);
    process.exit(1);
  });
}

export default app;
