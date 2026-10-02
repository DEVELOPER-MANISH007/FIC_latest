import "../config/loadEnv.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import WebsiteSettings from "../models/WebsiteSettings.js";
import HeroBanner from "../models/HeroBanner.js";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Gallery from "../models/Gallery.js";
import { defaultWebsiteContent } from "../constants/defaultWebsiteContent.js";

// Safe, additive migration: existing CMS data and all legacy collections stay untouched.
await connectDB();
const existing = await WebsiteSettings.findOne({ key: "main" }).lean();
if (existing) {
  console.log("Website CMS settings already exist; leaving current content unchanged.");
} else {
  await WebsiteSettings.create({ key: "main", data: defaultWebsiteContent });
  console.log("Seeded the initial Website CMS settings from the existing institute content.");
}
const existingBanners = await HeroBanner.countDocuments();
if (existingBanners === 0) {
  await HeroBanner.insertMany([
    { title: "Learn practical computer skills", subtitle: "Instructor-led learning in Veerapura", image: "/website/slide-1-building.jpg", order: 1, isActive: true },
    { title: "Learn in a supportive classroom", subtitle: "Guidance for beginners and experienced learners", image: "/website/slide-2-classroom.jpg", order: 2, isActive: true },
    { title: "Practice with modern computers", subtitle: "Build confidence through hands-on training", image: "/website/slide-3-lab.jpg", order: 3, isActive: true },
    { title: "Build skills through projects", subtitle: "Practical learning for the next step in your career", image: "/website/slide-4-practical.jpg", order: 4, isActive: true },
  ]);
  console.log("Seeded 4 hero banners from the existing website photography.");
} else {
  console.log(`Found ${existingBanners} hero banners; leaving them unchanged.`);
}
const legacyCourses = [
  ["Basic Computer Course", "Foundational computer literacy for absolute beginners.", "monitor", "general"],
  ["CCC", "Government-recognized Course on Computer Concepts.", "award", "general"],
  ["DCA", "Diploma in Computer Applications — broad digital skills.", "fileText", "general"],
  ["ADCA", "Advanced Diploma covering deeper computer applications.", "checkFile", "general"],
  ["DOAP", "Diploma in Office Automation & Programming.", "layout", "office"],
  ["DCAA", "Diploma in Computer Applications & Accounting.", "trendingUp", "office"],
  ["MS Office", "Word, Excel, PowerPoint for everyday productivity.", "briefcase", "office"],
  ["Advanced Excel", "Formulas, pivot tables and data analysis in Excel.", "grid", "office"],
  ["Tally with GST", "Accounting and GST-compliant billing using Tally.", "rupee", "office"],
  ["Python", "Beginner-friendly programming for logic and automation.", "code", "programming"],
  ["Core Java (OOPs)", "Object-oriented programming fundamentals in Java.", "layers", "programming"],
  ["JavaScript", "Interactive, dynamic web programming basics.", "zap", "programming"],
  ["HTML5", "The building blocks of every website.", "code2", "programming"],
  ["CSS3", "Styling and layout for modern, responsive websites.", "palette", "programming"],
  ["SQL", "Structured Query Language for managing data.", "database", "programming"],
  ["MySQL", "Practical relational database management.", "database2", "programming"],
  ["C", "The foundational language behind modern programming.", "terminal", "programming"],
  ["C++", "Object-oriented extension of C for structured software.", "terminal2", "programming"],
  ["Web Development", "Full front-end web building using HTML, CSS & JS.", "globe", "programming"],
  ["AutoCAD", "Professional 2D/3D drafting used across engineering.", "drafting", "industry"],
  ["Siemens NX", "Industry-grade CAD/CAM/CAE for product design.", "cube", "industry"],
].map(([title, description, icon, category], index) => ({ title, description, icon, category, order: index + 1, featured: category === "industry", badge: category === "industry" ? "New in 2026" : "" }));

const legacyFaculty = [
  { name: "Mr. Dinesh Kumar", designation: "Founder & Director", qualification: "M.Sc. (Chemistry)", bio: "Leads Future IT College with a focus on discipline, experience and genuine student development, guiding the institute's growth since 2016.", image: "/website/director.jpg", order: 1 },
  { name: "Shivani Singh", designation: "Faculty", qualification: "BCA / B.Sc. (Computer Science)", bio: "A passionate instructor focused on practical computer education and building strong programming fundamentals.", image: "/website/faculty.jpg", order: 2 },
];

const legacyGallery = [
  ["Computer Lab", "Computer Lab", "lab.jpg"], ["Smart Classroom", "Smart Classroom", "classroom.jpg"],
  ["Practical Sessions", "Practical Sessions", "practical.jpg"], ["Institute Building", "Institute Building", "building.jpg"],
  ["Students Learning", "Students Learning", "office.jpg"],
].map(([title, category, image], index) => ({ title, category, image: `/website/${image}`, order: index + 1 }));

for (const [name, model, docs] of [["courses", Course, legacyCourses], ["faculty", Faculty, legacyFaculty], ["gallery", Gallery, legacyGallery]]) {
  const count = await model.countDocuments();
  if (count === 0) {
    await model.insertMany(docs);
    console.log(`Seeded ${docs.length} legacy ${name} items because the collection was empty.`);
  } else {
    console.log(`Found ${count} existing ${name} items; leaving them unchanged.`);
  }
}
await mongoose.disconnect();
