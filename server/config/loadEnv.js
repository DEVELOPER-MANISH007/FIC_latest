import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Populates process.env from .env files. This file has ONE job and must be
 * the very first `import` in app.js.
 *
 * Why: ES module imports are hoisted and evaluated, in order, before any of
 * the importing file's own top-level code runs. app.js used to import
 * apiRoutes (which transitively imports config/cloudinary.js) BEFORE calling
 * dotenv.config() in its own body — so cloudinary.js's top-level
 * `isCloudinaryConfigured` check ran against an empty process.env and was
 * permanently `false`, even with correct .env values. Isolating dotenv.config()
 * into its own module and importing it first guarantees it runs before any
 * other module (including the whole routes/controllers/config tree) is
 * evaluated.
 *
 * Not needed on Vercel — the platform injects env vars into process.env
 * directly at cold start, before any of this code runs, so import order is
 * irrelevant there. This only matters for local dev / traditional servers.
 */
dotenv.config({
  path: [path.join(__dirname, "..", ".env"), path.join(__dirname, "../../.env.development.local")],
});
