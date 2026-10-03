import type { Course } from "@/types";

type CourseCategory = NonNullable<Course["category"]>;
type CourseEntry = Pick<Course, "title" | "icon"> & {
  category: Exclude<CourseCategory, "general">;
  subjects?: string[];
  featured?: boolean;
  badge?: string;
};

const entries: CourseEntry[] = [
  // Computer & Office (12)
  { title: "Basic Computer Course", category: "office", icon: "monitor" },
  { title: "CCC – Course on Computer Concepts", category: "office", icon: "award" },
  { title: "DCA – Diploma in Computer Applications", category: "office", icon: "fileText" },
  { title: "ADCA – Advanced Diploma in Computer Applications", category: "office", icon: "checkFile" },
  { title: "DOAP – Diploma in Office Automation & Publishing", category: "office", icon: "layout" },
  { title: "DTP – Desktop Publishing", category: "office", icon: "fileText" },
  { title: "MS Office", category: "office", icon: "briefcase" },
  { title: "Hindi & English Typing", category: "office", icon: "monitor" },
  { title: "Data Entry", category: "office", icon: "grid" },
  { title: "Tally Prime + GST", category: "office", icon: "rupee" },
  { title: "DFA – Diploma in Financial Accounting", category: "office", icon: "trendingUp" },
  { title: "DCFA – Diploma in Computerized Financial Accounting", category: "office", icon: "trendingUp" },

  // Programming & Coding (15)
  { title: "C Programming", category: "programming", icon: "terminal" },
  { title: "C++ Programming", category: "programming", icon: "terminal2" },
  { title: "C++ with OOP", category: "programming", icon: "layers" },
  { title: "Java Programming", category: "programming", icon: "code" },
  { title: "Java with OOP", category: "programming", icon: "layers" },
  { title: "Python Programming", category: "programming", icon: "code" },
  { title: "Python for Data Science", category: "programming", icon: "database" },
  { title: "HTML & CSS", category: "programming", icon: "code2" },
  { title: "JavaScript", category: "programming", icon: "zap" },
  { title: "Frontend Web Development", category: "programming", icon: "globe" },
  { title: "Backend Web Development", category: "programming", icon: "database" },
  { title: "Full Stack Web Development", category: "programming", icon: "globe" },
  { title: "MERN Stack Development", category: "programming", icon: "layers", subjects: ["MongoDB", "Express.js", "React.js", "Node.js"] },
  { title: "PHP & MySQL", category: "programming", icon: "database2" },
  { title: "SQL & Database Management", category: "programming", icon: "database" },

  // Professional IT (13)
  { title: "Data Science", category: "professional", icon: "database" },
  { title: "Machine Learning", category: "professional", icon: "network" },
  { title: "Artificial Intelligence", category: "professional", icon: "monitor" },
  { title: "Deep Learning", category: "professional", icon: "network" },
  { title: "NLP – Natural Language Processing", category: "professional", icon: "fileText" },
  { title: "Data Analytics", category: "professional", icon: "grid" },
  { title: "Power BI", category: "professional", icon: "grid" },
  { title: "Cloud Computing", category: "professional", icon: "globe" },
  { title: "Cyber Security", category: "professional", icon: "shield" },
  { title: "DevOps", category: "professional", icon: "settings" },
  { title: "Software Testing / QA", category: "professional", icon: "checkFile" },
  { title: "UI/UX Design", category: "professional", icon: "layout" },
  { title: "Git & GitHub", category: "professional", icon: "code" },

  // Industry-Level / Engineering (10)
  { title: "NX Siemens – CAD/CAM/CAE", category: "industry", icon: "cube", featured: true, badge: "Featured" },
  { title: "AutoCAD", category: "industry", icon: "drafting", featured: true, badge: "Featured" },
  { title: "SolidWorks", category: "industry", icon: "cube" },
  { title: "CATIA", category: "industry", icon: "cube" },
  { title: "Creo", category: "industry", icon: "cube" },
  { title: "ANSYS", category: "industry", icon: "settings" },
  { title: "Revit", category: "industry", icon: "layout" },
  { title: "STAAD.Pro", category: "industry", icon: "layout" },
  { title: "3ds Max", category: "industry", icon: "cube" },
  { title: "CNC Programming & CAD/CAM", category: "industry", icon: "settings" },

  // Design & Multimedia (7)
  { title: "Graphic Designing", category: "design", icon: "palette" },
  { title: "Adobe Photoshop", category: "design", icon: "palette" },
  { title: "CorelDRAW", category: "design", icon: "penTool" },
  { title: "Adobe Illustrator", category: "design", icon: "penTool" },
  { title: "Video Editing", category: "design", icon: "globe" },
  { title: "Motion Graphics", category: "design", icon: "zap" },
  { title: "3D Modeling & Animation", category: "design", icon: "cube" },
];

/** The single static source for public course titles, categories and card visuals. */
export const COURSE_CATALOG: Course[] = entries.map((course, index) => ({ ...course, order: index + 1 }));

export const INDUSTRY_COURSES = COURSE_CATALOG.filter((course) => course.category === "industry");
