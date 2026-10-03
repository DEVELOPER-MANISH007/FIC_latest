/**
 * Seeds Categories, the Question Bank, and one ready-to-use Test
 * ("Basic Computer Proficiency Test") matching the example category
 * distribution from the spec (50 questions total).
 *
 * Run with: npm run seedQuestions  (from the server/ directory)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Question from "../models/Question.js";
import Test from "../models/Test.js";
import { CATEGORIES, QUESTIONS_BY_CATEGORY } from "./questionsData.js";

dotenv.config({ path: [".env", "../.env.development.local"] });

// Matches the example distribution in the spec — totals 50 questions.
const DISTRIBUTION = {
  "Computer Fundamentals": 15,
  "MS Word": 5,
  "MS Excel": 5,
  "Microsoft PowerPoint": 5,
  Internet: 5,
  "Windows Operating System": 3,
  "Computer Hardware": 3,
  "Computer Software": 3,
  "Computer Networking": 3,
  "Cyber Security": 3,
};

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([Category.deleteMany({}), Question.deleteMany({}), Test.deleteMany({})]);

    const categoryDocs = {};
    for (const name of CATEGORIES) {
      const category = await Category.create({ name, description: `${name} questions` });
      categoryDocs[name] = category;
    }
    console.log(`Categories created: ${CATEGORIES.length}`);

    let totalQuestions = 0;
    for (const [categoryName, questions] of Object.entries(QUESTIONS_BY_CATEGORY)) {
      const category = categoryDocs[categoryName];
      const docs = questions.map((q) => ({
        ...q,
        category: category._id,
        topic: categoryName,
        language: "English",
        status: "Active",
      }));
      await Question.insertMany(docs);
      totalQuestions += docs.length;
    }
    console.log(`Questions created: ${totalQuestions}`);

    const categoryDistribution = Object.entries(DISTRIBUTION).map(([name, count]) => ({
      category: categoryDocs[name]._id,
      count,
    }));

    const totalTestQuestions = categoryDistribution.reduce((sum, c) => sum + c.count, 0);

    await Test.create({
      testName: "Basic Computer Proficiency Test",
      duration: 15,
      totalQuestions: totalTestQuestions,
      topic: "Basic Computer",
      difficulty: "Mixed",
      passingMarks: 60,
      categoryDistribution,
      isActive: true,
      allowRetest: false,
      showExplanationAfterSubmit: true,
    });
    console.log(`Test created: "Basic Computer Proficiency Test" (${totalTestQuestions} questions, 15 min, 60% passing)`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Question bank seeding failed:", error);
    process.exit(1);
  }
};

seed();

