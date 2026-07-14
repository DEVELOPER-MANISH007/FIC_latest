/**
 * Migration: backfills `subject` and `unit` on StudyMaterial documents that
 * were uploaded under the old Course -> Subject -> Category structure
 * (before the Subject/Topic/Unit redesign) and therefore predate those two
 * now-required fields.
 *
 * Safe to run multiple times — only touches documents missing `subject` or
 * `unit`; never deletes data. Legacy fields (`course`, `courseName`,
 * `subjectId`, `subjectName`, `category`, `module`, `difficulty`) are left
 * untouched on the document for reference/backward compatibility.
 *
 * Run with: npm run migrate:study-material   (from the server/ directory)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import StudyMaterial from "../models/StudyMaterial.js";

dotenv.config({ path: [".env", "../.env.development.local"] });

const migrate = async () => {
  try {
    await connectDB();

    // Read via the raw collection (not the model) so Mongoose's `required`
    // validators on subject/unit don't block us from finding the very
    // documents that are missing them.
    const collection = mongoose.connection.collection("studymaterials");

    const legacyDocs = await collection
      .find({ $or: [{ subject: { $exists: false } }, { unit: { $exists: false } }] })
      .toArray();

    if (legacyDocs.length === 0) {
      console.log("No legacy study materials to migrate — subject/unit already present on all records.");
    } else {
      console.log(`Migrating ${legacyDocs.length} legacy study material record(s)...`);

      let updated = 0;
      for (const doc of legacyDocs) {
        const subject = doc.subject || doc.subjectName || doc.courseName || "General";
        const unit = doc.unit || doc.module || "General";

        await collection.updateOne({ _id: doc._id }, { $set: { subject, unit } });
        updated += 1;
      }

      console.log(`Done — backfilled subject/unit on ${updated} record(s).`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Study material migration failed:", error);
    process.exit(1);
  }
};

migrate();
