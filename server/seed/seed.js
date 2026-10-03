/**
 * Seeds the database with the institute's real courses, faculty
 * and gallery data so the API returns meaningful content immediately
 * after setup — matching exactly what the original design specified.
 *
 * Run with: npm run seed  (from the server/ directory)
 */
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Gallery from "../models/Gallery.js";

dotenv.config({ path: [".env", "../.env.development.local"] });

const courses = [
  { title: "Basic Computer Course", description: "Foundational computer literacy for absolute beginners.", icon: "monitor", category: "general", order: 1 },
  { title: "CCC", description: "Government-recognized Course on Computer Concepts.", icon: "award", category: "general", order: 2 },
  { title: "DCA", description: "Diploma in Computer Applications — broad digital skills.", icon: "fileText", category: "general", order: 3 },
  { title: "ADCA", description: "Advanced Diploma covering deeper computer applications.", icon: "checkFile", category: "general", order: 4 },
  { title: "DOAP", description: "Diploma in Office Automation & Programming.", icon: "layout", category: "office", order: 5 },
  { title: "DCAA", description: "Diploma in Computer Applications & Accounting.", icon: "trendingUp", category: "office", order: 6 },
  { title: "MS Office", description: "Word, Excel, PowerPoint for everyday productivity.", icon: "briefcase", category: "office", order: 7 },
  { title: "Advanced Excel", description: "Formulas, pivot tables and data analysis in Excel.", icon: "grid", category: "office", order: 8 },
  { title: "Tally with GST", description: "Accounting and GST-compliant billing using Tally.", icon: "rupee", category: "office", order: 9 },
  { title: "Python", description: "Beginner-friendly programming for logic and automation.", icon: "code", category: "programming", order: 10 },
  { title: "Core Java (OOPs)", description: "Object-oriented programming fundamentals in Java.", icon: "layers", category: "programming", order: 11 },
  { title: "JavaScript", description: "Interactive, dynamic web programming basics.", icon: "zap", category: "programming", order: 12 },
  { title: "HTML5", description: "The building blocks of every website.", icon: "code2", category: "programming", order: 13 },
  { title: "CSS3", description: "Styling and layout for modern, responsive websites.", icon: "palette", category: "programming", order: 14 },
  { title: "SQL", description: "Structured Query Language for managing data.", icon: "database", category: "programming", order: 15 },
  { title: "MySQL", description: "Practical relational database management.", icon: "database2", category: "programming", order: 16 },
  { title: "C", description: "The foundational language behind modern programming.", icon: "terminal", category: "programming", order: 17 },
  { title: "C++", description: "Object-oriented extension of C for structured software.", icon: "terminal2", category: "programming", order: 18 },
  { title: "Web Development", description: "Full front-end web building using HTML, CSS & JS.", icon: "globe", category: "programming", order: 19 },
  { title: "AutoCAD", description: "Professional 2D/3D drafting used across engineering.", icon: "drafting", category: "industry", featured: true, badge: "New in 2026", order: 20 },
  { title: "Siemens NX", description: "Industry-grade CAD/CAM/CAE for product design.", icon: "cube", category: "industry", featured: true, badge: "New in 2026", order: 21 },
];

const faculty = [
  {
    name: "Mr. Dinesh Kumar",
    designation: "Founder & Director",
    qualification: "M.Sc. (Chemistry)",
    bio: "Leads Future IT College with a focus on discipline, experience and genuine student development, guiding the institute's growth since 2016.",
    image: "/uploads/director.jpg",
    order: 1,
  },
  {
    name: "Shivani Singh",
    designation: "Faculty",
    qualification: "BCA / B.Sc. (Computer Science)",
    bio: "A passionate instructor focused on practical computer education and building strong programming fundamentals.",
    image: "/uploads/faculty.jpg",
    order: 2,
  },
];

const gallery = [
  { title: "Computer Lab", category: "Computer Lab", image: "/uploads/lab.jpg", order: 1 },
  { title: "Smart Classroom", category: "Smart Classroom", image: "/uploads/classroom.jpg", order: 2 },
  { title: "Practical Sessions", category: "Practical Sessions", image: "/uploads/practical.jpg", order: 3 },
  { title: "Institute Building", category: "Institute Building", image: "/uploads/building.jpg", order: 4 },
  { title: "Students Learning", category: "Students Learning", image: "/uploads/office.jpg", order: 5 },
];

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Course.deleteMany({}),
      Faculty.deleteMany({}),
      Gallery.deleteMany({}),
    ]);

    await Course.insertMany(courses);
    await Faculty.insertMany(faculty);
    await Gallery.insertMany(gallery);

    console.log("Seed complete:");
    console.log(`  Courses: ${courses.length}`);
    console.log(`  Faculty: ${faculty.length}`);
    console.log(`  Gallery: ${gallery.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();

