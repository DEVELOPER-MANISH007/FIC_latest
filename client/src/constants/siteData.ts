import type { Course, FAQItem, RoadmapStep, Testimonial } from "@/types";

export const SITE = {
  name: "Future IT College",
  alternateName: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
  locationName: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
  tagline: "Learn Today. Lead Tomorrow.",
  establishedYear: 2016,
  description:
    "Empowering students with practical computer education, industry-ready skills and career-focused learning since 2016. From computer basics to professional software training, we prepare students for real-world success.",
  address: {
    line1: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
    city: "Aligarh",
    state: "Uttar Pradesh",
    pincode: "202142",
  },
  phones: ["9927444970", "6398842895"],
  email: "DCM20020@gmail.com",
  mapUrl: "https://maps.app.goo.gl/LMMnXY95ohxfgmHj8",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=28.0271461,77.9218959&hl=en&z=17&output=embed",
};

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Library", href: "/library" },
  { label: "Facilities", href: "#facilities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Faculty", href: "#faculty" },
  { label: "Contact", href: "#contact" },
];

export const HERO_STATS = [
  { target: 3000, suffix: "+", label: "Students Trained" },
  { target: 20, suffix: "+", label: "Professional Courses" },
  { target: 10, suffix: "+", label: "Years of Excellence" },
  { target: 100, suffix: "%", label: "Practical Learning" },
];

export const TRUST_BADGES = [
  "Since 2016",
  "3000+ Students Trained",
  "Job Assistance",
  "Government Certified Courses",
  "5–7 Days Demo Classes",
];

export const WHY_CHOOSE_US = [
  { icon: "users", title: "Experienced Faculty", desc: "Instructors who focus on clarity, discipline and genuine student progress." },
  { icon: "network", title: "Industry-Oriented Courses", desc: "Curriculum built around real, current skills employers actually look for." },
  { icon: "certificate", title: "Government Certified Certificates", desc: "Recognized course completion certificates for eligible programs." },
  { icon: "monitor2", title: "Modern Smart Classrooms", desc: "Well-lit, organized classrooms designed for focused learning." },
  { icon: "snowflake", title: "AC Computer Labs", desc: "Comfortable, air-conditioned labs with modern desktop systems." },
  { icon: "presentation", title: "Touch Screen Smart Board", desc: "Interactive smart boards that make concepts easier to visualize." },
  { icon: "bookOpen", title: "Practical + Theory Learning", desc: "Balanced learning approach so concepts translate into real skills." },
  { icon: "wallet", title: "Affordable Learning", desc: "Quality education priced sensibly for students and families." },
  { icon: "compass", title: "Career Guidance", desc: "One-on-one guidance to help students choose the right path." },
  { icon: "briefcase2", title: "Job Assistance", desc: "Support connecting capable students with relevant opportunities." },
  { icon: "laptop", title: "Affordable Refurbished Laptops", desc: "Guidance available for students who need a personal laptop." },
  { icon: "heart", title: "Friendly Learning Environment", desc: "A welcoming space where beginners feel comfortable asking questions." },
];

export const FACILITIES = [
  { icon: "snowflake", title: "Fully AC Computer Lab" },
  { icon: "monitor", title: "Modern Desktop Computers" },
  { icon: "wifi", title: "High-Speed Internet" },
  { icon: "checkFile", title: "Practical-Oriented Training" },
  { icon: "presentation", title: "Smart Touch Screen Classroom" },
  { icon: "droplet", title: "RO & Cold Drinking Water" },
  { icon: "washroom", title: "Clean Washroom Facilities" },
  { icon: "users2", title: "Comfortable Learning Environment" },
  { icon: "userGroup", title: "Small Batch Size" },
  { icon: "shield", title: "Individual Student Guidance" },
];

export const STUDENT_SUCCESS = [
  { icon: "userGroup", label: "3000+ Students Trained" },
  { icon: "clock", label: "Since 2016" },
  { icon: "checkFile", label: "Practical Learning" },
  { icon: "compass", label: "Career Guidance" },
  { icon: "certificate", label: "Government Certified Courses" },
  { icon: "network", label: "Industry-Level Training" },
];

export const LEARNING_JOURNEY: RoadmapStep[] = [
  { step: 1, title: "Admission", description: "Register with our team" },
  { step: 2, title: "Demo Classes", description: "Attend 5–7 days, risk-free" },
  { step: 3, title: "Regular Classes", description: "Structured course learning" },
  { step: 4, title: "Practical Training", description: "Hands-on lab sessions" },
  { step: 5, title: "Projects", description: "Apply what you've learned" },
  { step: 6, title: "Certificate", description: "Government certified" },
  { step: 7, title: "Career Guidance", description: "Personalized direction" },
  { step: 8, title: "Job Assistance", description: "Support finding opportunities" },
];

export const ADMISSION_PROCESS: RoadmapStep[] = [
  { step: 1, title: "Contact Institute" },
  { step: 2, title: "Visit Campus or Apply Online" },
  { step: 3, title: "Attend 5–7 Day Demo Classes" },
  { step: 4, title: "Select Course" },
  { step: 5, title: "Complete Admission" },
  { step: 6, title: "Start Learning" },
];

export const COURSES_FALLBACK: Course[] = [
  { title: "Basic Computer Course", description: "Foundational computer literacy for absolute beginners.", icon: "monitor", category: "general" },
  { title: "CCC", description: "Government-recognized Course on Computer Concepts.", icon: "award", category: "general" },
  { title: "DCA", description: "Diploma in Computer Applications — broad digital skills.", icon: "fileText", category: "general" },
  { title: "ADCA", description: "Advanced Diploma covering deeper computer applications.", icon: "checkFile", category: "general" },
  { title: "DOAP", description: "Diploma in Office Automation & Programming.", icon: "layout", category: "office" },
  { title: "DCAA", description: "Diploma in Computer Applications & Accounting.", icon: "trendingUp", category: "office" },
  { title: "MS Office", description: "Word, Excel, PowerPoint for everyday productivity.", icon: "briefcase", category: "office" },
  { title: "Advanced Excel", description: "Formulas, pivot tables and data analysis in Excel.", icon: "grid", category: "office" },
  { title: "Tally with GST", description: "Accounting and GST-compliant billing using Tally.", icon: "rupee", category: "office" },
  { title: "Python", description: "Beginner-friendly programming for logic and automation.", icon: "code", category: "programming" },
  { title: "Core Java (OOPs)", description: "Object-oriented programming fundamentals in Java.", icon: "layers", category: "programming" },
  { title: "JavaScript", description: "Interactive, dynamic web programming basics.", icon: "zap", category: "programming" },
  { title: "HTML5", description: "The building blocks of every website.", icon: "code2", category: "programming" },
  { title: "CSS3", description: "Styling and layout for modern, responsive websites.", icon: "palette", category: "programming" },
  { title: "SQL", description: "Structured Query Language for managing data.", icon: "database", category: "programming" },
  { title: "MySQL", description: "Practical relational database management.", icon: "database2", category: "programming" },
  { title: "C", description: "The foundational language behind modern programming.", icon: "terminal", category: "programming" },
  { title: "C++", description: "Object-oriented extension of C for structured software.", icon: "terminal2", category: "programming" },
  { title: "Web Development", description: "Full front-end web building using HTML, CSS & JS.", icon: "globe", category: "programming" },
  { title: "AutoCAD", description: "Professional 2D/3D drafting used across engineering.", icon: "drafting", category: "industry", featured: true, badge: "New in 2026" },
  { title: "Siemens NX", description: "Industry-grade CAD/CAM/CAE for product design.", icon: "cube", category: "industry", featured: true, badge: "New in 2026" },
];

export const COURSE_OPTIONS = COURSES_FALLBACK.map((c) => c.title).concat(["Not sure yet"]);

export const FAQS: FAQItem[] = [
  {
    question: "How can I take admission?",
    answer:
      "Contact us by phone or WhatsApp, or fill the enquiry form above. Our team will guide you through demo classes and the admission process.",
  },
  {
    question: "Are demo classes available?",
    answer: "Yes — students can attend demo classes for approximately 5–7 days before deciding on admission.",
  },
  {
    question: "Which programming courses are offered?",
    answer:
      "We offer Python, Core Java (OOPs), JavaScript, HTML5, CSS3, SQL, MySQL, C, and C++, along with web development and industry software like AutoCAD and Siemens NX.",
  },
  {
    question: "Is practical training provided?",
    answer: "Yes, every course combines theory with hands-on practical sessions in our AC computer labs.",
  },
  {
    question: "Are certificates available?",
    answer: "Eligible students receive government certified course completion certificates after successfully finishing their programs.",
  },
  {
    question: "How can I contact the institute?",
    answer: "Call 9927444970 / 6398842895, email DCM20020@gmail.com, or visit us at FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER, Aligarh.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sample Student A",
    role: "Placeholder review",
    quote:
      "The practical sessions made concepts so much easier to understand. Sample testimonial — pending real student review.",
    rating: 5,
  },
  {
    name: "Sample Student B",
    role: "Placeholder review",
    quote: "Small batch sizes meant I actually got my questions answered. Sample testimonial — pending real student review.",
    rating: 5,
  },
  {
    name: "Sample Student C",
    role: "Placeholder review",
    quote:
      "The demo classes helped me decide with confidence before enrolling. Sample testimonial — pending real student review.",
    rating: 5,
  },
];
