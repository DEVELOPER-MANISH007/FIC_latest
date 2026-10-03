import type { Course } from "@/types";

type CourseCategory = NonNullable<Course["category"]>;
type CourseEntry = Pick<Course, "title" | "description" | "icon"> & {
  category: Exclude<CourseCategory, "general">;
  shortTitle?: string;
  subjects?: string[];
  featured?: boolean;
  badge?: string;
};

const entries: CourseEntry[] = [
  // Computer & Office (12)
  { title: "Basic Computer Course", category: "office", description: "Build familiarity with computers, common applications, files and everyday digital tasks.", icon: "monitor" },
  { title: "CCC – Course on Computer Concepts", shortTitle: "CCC", category: "office", description: "Study core computer concepts, digital services and practical computer use.", icon: "award" },
  { title: "DCA – Diploma in Computer Applications", shortTitle: "DCA", category: "office", description: "An introduction to computer applications, office tools and digital workflows.", icon: "fileText" },
  { title: "ADCA – Advanced Diploma in Computer Applications", shortTitle: "ADCA", category: "office", description: "Develop broader skills with computer applications and office productivity tools.", icon: "checkFile" },
  { title: "DOAP – Diploma in Office Automation & Publishing", shortTitle: "DOAP", category: "office", description: "Learn office productivity workflows and document publishing fundamentals.", icon: "layout" },
  { title: "DTP – Desktop Publishing", category: "office", description: "Explore page layout, typography and preparation of materials for publication.", icon: "fileText" },
  { title: "MS Office", category: "office", description: "Practice common document, spreadsheet and presentation workflows.", icon: "briefcase" },
  { title: "Hindi & English Typing", category: "office", description: "Build typing accuracy and fluency with Hindi and English text.", icon: "keyboard" },
  { title: "Data Entry", category: "office", description: "Practice accurate data input, organization and spreadsheet-based workflows.", icon: "grid" },
  { title: "Tally Prime + GST", category: "office", description: "Work with accounting workflows and GST features in Tally Prime.", icon: "rupee" },
  { title: "DFA – Diploma in Financial Accounting", shortTitle: "DFA", category: "office", description: "Study financial accounting concepts and computerized accounting workflows.", icon: "trendingUp" },
  { title: "DCFA – Diploma in Computerized Financial Accounting", shortTitle: "DCFA", category: "office", description: "Combine accounting fundamentals with computerized financial record keeping.", icon: "trendingUp" },

  // Programming & Coding (15)
  { title: "C Programming", category: "programming", description: "Learn programming fundamentals, structured logic and core C language concepts.", icon: "terminal" },
  { title: "C++ Programming", category: "programming", description: "Explore C++ syntax, programming logic and foundational software development.", icon: "terminal2" },
  { title: "C++ with OOP", category: "programming", description: "Apply object-oriented programming concepts using C++.", icon: "layers" },
  { title: "Java Programming", category: "programming", description: "Study Java syntax, core language features and application-building fundamentals.", icon: "code" },
  { title: "Java with OOP", category: "programming", description: "Use Java to practice classes, objects and object-oriented design principles.", icon: "layers" },
  { title: "Python Programming", category: "programming", description: "Build programming foundations with Python syntax, data structures and problem solving.", icon: "code" },
  { title: "Python for Data Science", category: "programming", description: "Use Python libraries and workflows for data preparation and analysis.", icon: "database" },
  { title: "HTML & CSS", category: "programming", description: "Create structured web pages and style responsive layouts with HTML and CSS.", icon: "code2" },
  { title: "JavaScript", category: "programming", description: "Learn the language used to add behavior and interactivity to web applications.", icon: "zap" },
  { title: "Frontend Web Development", category: "programming", description: "Build browser-based interfaces with modern frontend development concepts.", icon: "globe" },
  { title: "Backend Web Development", category: "programming", description: "Study server-side application logic, APIs and data-backed web workflows.", icon: "database" },
  { title: "Full Stack Web Development", category: "programming", description: "Understand how frontend interfaces connect to server-side applications and data.", icon: "globe" },
  { title: "MERN Stack Development", category: "programming", description: "Build full stack web applications with MongoDB, Express.js, React.js and Node.js.", icon: "layers", subjects: ["MongoDB", "Express.js", "React.js", "Node.js"] },
  { title: "PHP & MySQL", category: "programming", description: "Create data-driven web applications using PHP and MySQL fundamentals.", icon: "database2" },
  { title: "SQL & Database Management", category: "programming", description: "Work with relational data, SQL queries and database organization principles.", icon: "database" },

  // Professional IT (13)
  { title: "Data Science", category: "professional", description: "Explore data preparation, analysis and interpretation with computational tools.", icon: "database" },
  { title: "Machine Learning", category: "professional", description: "Study methods for training, evaluating and applying machine learning models.", icon: "network" },
  { title: "Artificial Intelligence", category: "professional", description: "Learn core artificial intelligence concepts and common application areas.", icon: "monitor" },
  { title: "Deep Learning", category: "professional", description: "Explore neural network concepts and deep learning workflows.", icon: "network" },
  { title: "NLP – Natural Language Processing", shortTitle: "NLP", category: "professional", description: "Study computational approaches to processing and analyzing human language.", icon: "fileText" },
  { title: "Data Analytics", category: "professional", description: "Practice preparing, exploring and communicating insights from data.", icon: "grid" },
  { title: "Power BI", category: "professional", description: "Create data models, reports and interactive visualizations with Power BI.", icon: "grid" },
  { title: "Cloud Computing", category: "professional", description: "Understand cloud services, deployment concepts and common cloud workflows.", icon: "globe" },
  { title: "Cyber Security", category: "professional", description: "Learn security fundamentals, risk awareness and defensive practices.", icon: "shield" },
  { title: "DevOps", category: "professional", description: "Explore collaboration, automation and delivery practices used in DevOps.", icon: "settings" },
  { title: "Software Testing / QA", category: "professional", description: "Practice software quality concepts, test design and defect reporting.", icon: "checkFile" },
  { title: "UI/UX Design", category: "professional", description: "Learn interface design, usability principles and user-centered workflows.", icon: "layout" },
  { title: "Git & GitHub", category: "professional", description: "Manage source code with version control and collaborative GitHub workflows.", icon: "code" },

  // Industry-Level / Engineering (10)
  { title: "NX Siemens – CAD/CAM/CAE", shortTitle: "NX Siemens", category: "industry", description: "Explore CAD, CAM and CAE workflows using Siemens NX tools.", icon: "cube", featured: true, badge: "Featured" },
  { title: "AutoCAD", category: "industry", description: "Learn computer-aided drafting and drawing workflows with AutoCAD.", icon: "drafting", featured: true, badge: "Featured" },
  { title: "SolidWorks", category: "industry", description: "Create and work with parametric 3D models and mechanical design assemblies.", icon: "cube" },
  { title: "CATIA", category: "industry", description: "Explore 3D product design and engineering workflows using CATIA.", icon: "cube" },
  { title: "Creo", category: "industry", description: "Study parametric product design and engineering modeling with Creo.", icon: "cube" },
  { title: "ANSYS", category: "industry", description: "Learn simulation concepts and engineering analysis workflows with ANSYS.", icon: "settings" },
  { title: "Revit", category: "industry", description: "Work with building information modeling concepts and Revit project workflows.", icon: "layout" },
  { title: "STAAD.Pro", category: "industry", description: "Explore structural modeling and analysis workflows with STAAD.Pro.", icon: "layout" },
  { title: "3ds Max", category: "industry", description: "Learn 3D modeling, visualization and scene creation using 3ds Max.", icon: "cube" },
  { title: "CNC Programming & CAD/CAM", category: "industry", description: "Study CNC programming concepts and the relationship between CAD and CAM.", icon: "settings" },

  // Design & Multimedia (7)
  { title: "Graphic Designing", category: "design", description: "Learn visual communication, layout and digital graphic design fundamentals.", icon: "palette" },
  { title: "Adobe Photoshop", category: "design", description: "Edit raster images and create visual compositions with Photoshop workflows.", icon: "palette" },
  { title: "CorelDRAW", category: "design", description: "Create vector illustrations and print-oriented designs with CorelDRAW.", icon: "penTool" },
  { title: "Adobe Illustrator", category: "design", description: "Build scalable vector artwork and illustrations with Illustrator workflows.", icon: "penTool" },
  { title: "Video Editing", category: "design", description: "Practice editing footage, arranging sequences and preparing video projects.", icon: "globe" },
  { title: "Motion Graphics", category: "design", description: "Explore animated graphic elements, timing and motion-based visual storytelling.", icon: "zap" },
  { title: "3D Modeling & Animation", category: "design", description: "Learn 3D modeling concepts and animation workflows for digital content.", icon: "cube" },
];

/** The single public catalog source. Durations and entry requirements are confirmed with the institute. */
export const COURSE_CATALOG: Course[] = entries.map((course, index) => ({
  ...course,
  duration: "Confirm with institute",
  eligibility: "Confirm with institute",
  order: index + 1,
  ctaLabel: "Enquire about this course",
  ctaHref: "#contact",
}));

export const INDUSTRY_COURSES = COURSE_CATALOG.filter((course) => course.category === "industry");
