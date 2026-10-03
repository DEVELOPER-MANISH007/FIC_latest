import type { Course } from "@/types";

type CourseCategory = NonNullable<Course["category"]>;
type CourseEntry = Pick<Course, "title" | "icon"> & {
  category: Exclude<CourseCategory, "general">;
  subjects?: string[];
  featured?: boolean;
  badge?: string;
};

const entries: CourseEntry[] = [
  // Computer & Office (10)
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

  // Professional IT (1)
  { title: "Data Analytics", category: "professional", icon: "grid" },

  // Industry-Level / Engineering (2)
  { title: "NX Siemens – CAD/CAM/CAE", category: "industry", icon: "cube", featured: true, badge: "Featured" },
  { title: "AutoCAD", category: "industry", icon: "drafting", featured: true, badge: "Featured" },
];

/** The single static source for public course titles, categories and card visuals. */
export const COURSE_CATALOG: Course[] = entries.map((course, index) => ({ ...course, order: index + 1 }));

export const INDUSTRY_COURSES = COURSE_CATALOG.filter((course) => course.category === "industry");
