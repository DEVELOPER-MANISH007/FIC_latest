const item = (title, description = "", icon = "checkCircle", order = 0) => ({ title, description, icon, order, isActive: true });

export const defaultWebsiteContent = {
  brand: {
    name: "Future IT College",
    shortName: "FIC",
    alternateName: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
    locationName: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
    tagline: "Learn Today. Lead Tomorrow.",
    description: "Empowering students with practical computer education, industry-ready skills and career-focused learning since 2016. From computer basics to professional software training, we prepare students for real-world success.",
    establishedYear: 2016,
    logo: "",
    favicon: "/favicon.png",
    primaryColor: "#193B5A",
    secondaryColor: "#0D1533",
  },
  navbar: {
    items: [
      { label: "Home", href: "#home", visible: true, order: 1 },
      { label: "About Us", href: "#about", visible: true, order: 2 },
      { label: "Courses", href: "#courses", visible: true, order: 3 },
      { label: "Faculty", href: "#faculty", visible: true, order: 4 },
      { label: "Gallery", href: "#gallery", visible: true, order: 5 },
      { label: "Notices", href: "/notices", visible: true, order: 6 },
      { label: "Library", href: "/library", visible: true, order: 7 },
      { label: "Contact", href: "#contact", visible: true, order: 8 },
    ],
    studentLoginLabel: "Student Login",
    callCtaLabel: "Call Now",
    admissionCtaLabel: "Apply for Admission",
    admissionCtaHref: "#admission",
  },
  websiteSettings: { showFloatingContact: true, showMobileAdmissionBar: true, showHomepageAnnouncement: true },
  contact: {
    phones: ["9927444970", "6398842895"],
    whatsapp: "9927444970",
    email: "DCM20020@gmail.com",
    address: { line1: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER", city: "Aligarh", state: "Uttar Pradesh", pincode: "202142" },
    openingHours: "Monday to Saturday, 9:00 AM–6:00 PM",
    mapUrl: "https://maps.app.goo.gl/LMMnXY95ohxfgmHj8",
    mapEmbedUrl: "https://maps.google.com/maps?q=28.0271461,77.9218959&hl=en&z=17&output=embed",
  },
  socials: [
    { label: "Instagram", href: "", visible: false },
    { label: "Facebook", href: "", visible: false },
    { label: "YouTube", href: "", visible: false },
  ],
  homepage: {
    announcement: { enabled: false, label: "Notice", text: "", href: "/notices" },
    hero: {
      title: "Future IT College",
      subtitle: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
      eyebrow: "Since 2016 · Veerapura, Aligarh",
      description: "Empowering students with practical computer education, industry-ready skills and career-focused learning since 2016. From computer basics to professional software training, we prepare students for real-world success.",
      primaryButtonText: "Apply for Admission",
      primaryButtonHref: "#admission",
      secondaryButtonText: "Explore Courses",
      secondaryButtonHref: "#courses",
      trustBadges: ["Since 2016", "3000+ Students Trained", "Job Assistance", "Government Certified Courses", "5–7 Days Demo Classes"],
    },
    quickActions: { enabled: true, showCall: true, showWhatsApp: true, showScrollTop: true, mobileCallLabel: "Call Now", mobileAdmissionLabel: "Apply Now" },
    stats: [
      { label: "Students Trained", value: 3000, suffix: "+", visible: true, order: 1 },
      { label: "Professional Courses", value: 20, suffix: "+", visible: true, order: 2 },
      { label: "Years of Excellence", value: 10, suffix: "+", visible: true, order: 3 },
      { label: "Practical Learning", value: 100, suffix: "%", visible: true, order: 4 },
    ],
    sections: {
      hero: { enabled: true, order: 1 },
      stats: { enabled: true, order: 2 },
      about: {
        order: 3,
        enabled: true, title: "Practical, career-focused education built for real classrooms", eyebrow: "About Future IT College",
        description: "Future IT College, known locally as Dinesh Computer Center, has been serving students in Veerapura and the wider Aligarh region since 2016. Over the years, thousands of students have trained here — from school students taking their first computer class to working professionals upgrading their skills.",
        secondaryDescription: "Our approach pairs solid theoretical foundations with hands-on practical training, using modern teaching methods that keep pace with how the industry actually works today. Every course is designed with one goal in mind: helping students build real, usable skills for their careers.",
        image: "", establishedLabel: "Serving Veerapura since", establishedYear: 2016,
        items: ["Practical + theory learning model", "Career-oriented course design", "Modern teaching methods", "Thousands of students trained"],
        directorMessage: { enabled: false, name: "", title: "Director's Message", message: "", image: "" },
      },
      whyChooseUs: {
        order: 4,
        enabled: true, title: "Everything you need for a strong start", eyebrow: "Why Choose Us",
        subtitle: "A learning environment built around students — practical, affordable and genuinely supportive.",
        items: [
          item("Experienced Faculty", "Instructors who focus on clarity, discipline and genuine student progress.", "users", 1),
          item("Industry-Oriented Courses", "Curriculum built around real, current skills employers actually look for.", "network", 2),
          item("Government Certified Certificates", "Recognized course completion certificates for eligible programs.", "certificate", 3),
          item("Modern Smart Classrooms", "Well-lit, organized classrooms designed for focused learning.", "monitor2", 4),
          item("AC Computer Labs", "Comfortable, air-conditioned labs with modern desktop systems.", "snowflake", 5),
          item("Practical + Theory Learning", "Balanced learning approach so concepts translate into real skills.", "bookOpen", 6),
        ],
      },
      courses: { enabled: true, order: 5, eyebrow: "Popular Courses", title: "Courses built for every learner", subtitle: "From foundational computer literacy to professional programming and design software." },
      industryCourses: { enabled: true, order: 6, eyebrow: "Industry Training", title: "Learn tools used across industries", subtitle: "Practical software skills with structured, instructor-led learning." },
      learningJourney: {
        order: 7,
        enabled: true, eyebrow: "Your Learning Journey", title: "From first class to career confidence",
        items: [item("Admission", "Register with our team", "userPlus", 1), item("Demo Classes", "Attend 5–7 days before deciding", "calendar", 2), item("Regular Classes", "Structured course learning", "bookOpen", 3), item("Practical Training", "Hands-on lab sessions", "monitor", 4), item("Projects", "Apply what you've learned", "folder", 5), item("Certificate", "Complete an eligible program", "certificate", 6), item("Career Guidance", "Personalized direction", "compass", 7), item("Job Assistance", "Support finding opportunities", "briefcase", 8)],
      },
      scholarship: { enabled: true, order: 8, eyebrow: "Student Support", title: "A supportive start for every learner", description: "Talk with our team about course options, demo classes and available student support.", buttonText: "Ask about admission", buttonHref: "#admission" },
      demoClass: { enabled: true, order: 9, eyebrow: "Try a Demo Class", title: "Experience a class before you enroll", description: "Attend 5–7 days of demo classes and ask our team which course fits your goals.", buttonText: "Book a demo class", buttonHref: "#admission" },
      facilities: {
        order: 10,
        enabled: true, eyebrow: "Campus & Facilities", title: "A campus built for focused learning",
        items: [item("Fully AC Computer Lab", "", "snowflake", 1), item("Modern Desktop Computers", "", "monitor", 2), item("High-Speed Internet", "", "wifi", 3), item("Practical-Oriented Training", "", "checkFile", 4), item("Smart Touch Screen Classroom", "", "presentation", 5), item("RO & Cold Drinking Water", "", "droplet", 6), item("Clean Washroom Facilities", "", "washroom", 7), item("Comfortable Learning Environment", "", "users2", 8), item("Small Batch Size", "", "userGroup", 9), item("Individual Student Guidance", "", "shield", 10)],
      },
      faculty: { enabled: true, order: 11, eyebrow: "Meet the Faculty", title: "Learn with experienced instructors", subtitle: "A team focused on practical learning and individual student guidance." },
      studentSuccess: {
        order: 12,
        enabled: true, eyebrow: "Student Success", title: "Learning that builds lasting skills",
        items: [item("3000+ Students Trained", "", "userGroup", 1), item("Since 2016", "", "clock", 2), item("Practical Learning", "", "checkFile", 3), item("Career Guidance", "", "compass", 4), item("Eligible Certified Courses", "", "certificate", 5), item("Industry-Level Training", "", "network", 6)],
      },
      laptopProgram: { enabled: true, order: 13, eyebrow: "Learning Resources", title: "Tools and guidance for learning", description: "Ask about available computer access and guidance for choosing a personal laptop." },
      certificate: { enabled: true, order: 14, eyebrow: "Course Completion", title: "Showcase the skills you build", description: "Students who complete eligible programs receive a course completion certificate.", image: "" },
      admission: { enabled: true, order: 15, eyebrow: "Admission Enquiry", title: "Let's get you started", description: "Share your details and our team will help you choose a course and plan a visit.", process: { eyebrow: "Admission Process", title: "Six simple steps to get started", steps: ["Contact Institute", "Visit Campus or Apply Online", "Attend 5–7 Day Demo Classes", "Select Course", "Complete Admission", "Start Learning"].map((title, index) => ({ title, step: index + 1, isActive: true })) } },
      gallery: { enabled: true, order: 16, eyebrow: "Gallery", title: "A glimpse inside the campus", subtitle: "See classrooms, labs and everyday learning at Future IT College." },
      testimonials: { enabled: false, order: 17, eyebrow: "Testimonials", title: "What students say", subtitle: "Reviews shared by students after completing their courses." },
      faqs: {
        order: 18,
        enabled: true, eyebrow: "FAQs", title: "Questions about learning at FIC",
        items: [
          { question: "How can I take admission?", answer: "Contact us by phone or WhatsApp, or fill the enquiry form. Our team will guide you through demo classes and the admission process." },
          { question: "Are demo classes available?", answer: "Yes — students can attend demo classes for approximately 5–7 days before deciding on admission." },
          { question: "Which programming courses are offered?", answer: "We offer Python, Java, JavaScript, web development, office software, accounting, AutoCAD and other computer courses." },
          { question: "Is practical training provided?", answer: "Yes, courses combine theory with hands-on practical sessions in the computer labs." },
          { question: "How can I contact the institute?", answer: "Call 9927444970 or 6398842895, email DCM20020@gmail.com, or visit us in Veerapura, Aligarh." },
        ],
      },
      notices: { enabled: true, order: 19, eyebrow: "Institute Notices", title: "Latest updates", subtitle: "Notices and announcements from Future IT College." },
      library: { enabled: true, order: 20, eyebrow: "Student Resources", title: "Study material for your next class", subtitle: "Browse class notes and learning material from the student library.", buttonText: "Explore the library", buttonHref: "/library" },
      contact: { enabled: true, order: 21, eyebrow: "Contact Us", title: "Visit or get in touch with the institute", subtitle: "Our team can help with courses, admissions and campus visits." },
      finalCta: { enabled: true, order: 22, title: "Ready to start your journey?", description: "Book a demo class and see the Future IT College learning environment for yourself.", primaryButtonText: "Apply for Admission", primaryButtonHref: "#admission", secondaryButtonText: "Call Now" },
    },
  },
  footer: { tagline: "Practical, career-focused computer education since 2016.", copyright: "© {year} Future IT College. All rights reserved.", quickLinksTitle: "Quick Links", links: [{ label: "Courses", href: "#courses", visible: true, order: 1 }, { label: "Facilities", href: "#facilities", visible: true, order: 2 }, { label: "Gallery", href: "#gallery", visible: true, order: 3 }, { label: "Admission", href: "#admission", visible: true, order: 4 }, { label: "Contact", href: "#contact", visible: true, order: 5 }, { label: "Notices", href: "/notices", visible: true, order: 6 }, { label: "Library", href: "/library", visible: true, order: 7 }] },
  seo: {
    title: "Future IT College | Computer Courses & Practical Training in Veerapura",
    description: "Computer courses, practical learning, student resources and admissions at Future IT College, Veerapura, Aligarh.",
    keywords: "computer courses, computer training, Future IT College, Veerapura, Aligarh",
    canonicalUrl: "",
    ogImage: "",
  },
};

export const mergeWebsiteDefaults = (defaults, saved) => {
  if (Array.isArray(saved)) return saved;
  if (!saved || typeof saved !== "object") return saved ?? defaults;
  const merged = { ...defaults, ...saved };
  for (const [key, value] of Object.entries(defaults || {})) {
    merged[key] = mergeWebsiteDefaults(value, saved[key]);
  }
  return merged;
};

export default defaultWebsiteContent;
