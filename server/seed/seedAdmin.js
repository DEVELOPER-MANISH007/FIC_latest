/**
 * Creates the configured admin account without printing its credentials.
 * Run with: npm run seedAdmin (from the server/ directory)
 */
import "../config/loadEnv.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const seed = async () => {
  const email = String(process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Admin seeding requires SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD; no default account was created.");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("Configured admin account already exists; leaving it unchanged.");
    } else {
      await Admin.create({
        name: process.env.SEED_ADMIN_NAME || "Future IT College Admin",
        email,
        password,
        role: "superadmin",
      });
      console.log("Configured admin account created.");
    }
  } catch (error) {
    // Avoid printing database URLs or other configuration secrets from driver errors.
    console.error("Admin seeding failed because the database connection or account operation failed.");
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close().catch(() => {});
  }
};

seed();
