// MUST be the first import — see config/loadEnv.js for why.
import "./config/loadEnv.js";

import express from "express";
import mongoose from "mongoose";
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

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const parseCorsOrigins = () => {
  const raw = process.env.CLIENT_URL || process.env.CLIENT_URLS || process.env.FRONTEND_URL || "";
  const defaults = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ficveerpura.vercel.app",
    "https://ficcc-zeta.vercel.app",
  ];

  const configuredOrigins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...defaults, ...configuredOrigins])];
};

const createApp = () => {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        const allowedOrigins = parseCorsOrigins();
        const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => {
          if (allowedOrigin === "*") return true;
          if (allowedOrigin === origin) return true;
          if (allowedOrigin.includes("*")) {
            const pattern = new RegExp(`^${allowedOrigin.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*")}$`);
            return pattern.test(origin);
          }
          return false;
        });

        const hostname = (() => {
          try {
            return new URL(origin).hostname;
          } catch {
            return "";
          }
        })();

        if (isAllowedOrigin || hostname.endsWith(".vercel.app")) {
          return callback(null, true);
        }

        callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      optionsSuccessStatus: 204,
    })
  );
  app.options("*", cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = parseCorsOrigins();
      const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin === "*") return true;
        if (allowedOrigin === origin) return true;
        if (allowedOrigin.includes("*")) {
          const pattern = new RegExp(`^${allowedOrigin.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*")}$`);
          return pattern.test(origin);
        }
        return false;
      });

      const hostname = (() => {
        try {
          return new URL(origin).hostname;
        } catch {
          return "";
        }
      })();

      if (isAllowedOrigin || hostname.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  }));
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

  // Keep health checks available even while MongoDB is reconnecting or unconfigured.
  app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "API process is healthy", timestamp: new Date().toISOString(), database: mongoose.connection.readyState === 1 ? "connected" : "unavailable" });
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
    console.error("Initial MongoDB connection failed; API is running in limited mode until the database is available:", error.message);
  });
}

export default app;
