/**
 * Seeds the Online Examination System: predefined categories, a
 * default Admin account, a real Basic Computer question bank across
 * all 10 categories, and one ready-to-use "Basic Computer Test" exam
 * configured with a category distribution (Test Generator example).
 *
 * Run with: npm run seed:exam  (from the server/ directory)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Admin from "../models/Admin.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";

dotenv.config({ path: [".env", "../.env.development.local"] });

const adminEmail = String(process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
if (!adminEmail || !adminPassword) {
  console.error("Exam seeding requires SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD; no default admin credentials are used.");
  process.exit(1);
}

const CATEGORY_NAMES = [
  "Computer Fundamentals",
  "MS Word",
  "MS Excel",
  "Microsoft PowerPoint",
  "Internet",
  "Windows Operating System",
  "Computer Hardware",
  "Computer Software",
  "Computer Networking",
  "Cyber Security",
];

const toSlug = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// [question, A, B, C, D, correctLetter, difficulty]
const QUESTION_BANK = {
  "Computer Fundamentals": [
    ["What does CPU stand for?", "Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Central Processor Unifier", "A", "Easy"],
    ["Which of these is an input device?", "Monitor", "Printer", "Keyboard", "Speaker", "C", "Easy"],
    ["1 Byte is equal to how many bits?", "4", "8", "16", "32", "B", "Easy"],
    ["Which memory is volatile?", "ROM", "Hard Disk", "RAM", "Pen Drive", "C", "Medium"],
    ["The brain of the computer is called the ____.", "Monitor", "CPU", "Mouse", "Keyboard", "B", "Easy"],
    ["Which of the following is an output device?", "Scanner", "Mouse", "Monitor", "Keyboard", "C", "Easy"],
    ["Full form of RAM is:", "Random Access Memory", "Read Access Memory", "Random Access Module", "Read Only Memory", "A", "Easy"],
    ["Which generation of computers used vacuum tubes?", "First", "Second", "Third", "Fourth", "A", "Medium"],
    ["Full form of ROM is:", "Read Only Memory", "Random Only Memory", "Read Operation Memory", "Random Operation Module", "A", "Easy"],
    ["Which of these is a pointing device?", "Keyboard", "Mouse", "Printer", "Scanner", "B", "Easy"],
    ["A byte typically consists of how many bits?", "4", "2", "8", "10", "C", "Easy"],
    ["Which unit measures computer speed?", "Kg", "Hertz", "Meter", "Litre", "B", "Medium"],
    ["Which of the following is a storage device?", "Monitor", "Hard Disk", "Keyboard", "Mouse", "B", "Easy"],
    ["The full form of GUI is:", "Graphical User Interface", "General User Interface", "Graphic Unit Installer", "General Unit Interface", "A", "Medium"],
    ["Which is the smallest unit of data in a computer?", "Byte", "Bit", "Nibble", "Word", "B", "Medium"],
    ["Which device converts data into information?", "Input device", "Output device", "CPU", "Storage device", "C", "Medium"],
    ["Which of these is a non-volatile memory?", "RAM", "Cache", "ROM", "Register", "C", "Medium"],
    ["What is the full form of PC?", "Personal Computer", "Public Computer", "Personal Console", "Program Computer", "A", "Easy"],
    ["1 KB is equal to:", "1000 bytes", "1024 bytes", "100 bytes", "1024 bits", "B", "Medium"],
    ["Which part of the computer is called hardware?", "Operating System", "Antivirus", "Keyboard", "MS Word", "C", "Easy"],
  ],
  "MS Word": [
    ["Which key is used to underline text in MS Word?", "Ctrl+U", "Ctrl+B", "Ctrl+I", "Ctrl+L", "A", "Easy"],
    ["The default file extension of a Word document is:", ".txt", ".docx", ".xls", ".ppt", "B", "Easy"],
    ["Which tab contains the 'Font' option in MS Word?", "Insert", "Home", "View", "References", "B", "Easy"],
    ["Which shortcut key is used to bold text?", "Ctrl+B", "Ctrl+I", "Ctrl+U", "Ctrl+N", "A", "Easy"],
    ["What is used to check spelling errors in MS Word?", "Thesaurus", "Spell Check", "Word Count", "Find & Replace", "B", "Easy"],
    ["Which feature is used to combine multiple documents' data with a template?", "Mail Merge", "Track Changes", "Word Art", "Header/Footer", "A", "Medium"],
    ["Which key combination opens the Print dialog box?", "Ctrl+P", "Ctrl+O", "Ctrl+S", "Ctrl+N", "A", "Easy"],
    ["'Track Changes' is used to:", "Change page color", "Record edits made by reviewers", "Insert pictures", "Count words", "B", "Medium"],
  ],
  "MS Excel": [
    ["A collection of cells in Excel is called a:", "Sheet", "Workbook", "Range", "Table", "C", "Medium"],
    ["Which symbol starts a formula in Excel?", "@", "=", "#", "$", "B", "Easy"],
    ["What is the intersection of a row and column called?", "Field", "Cell", "Range", "Table", "B", "Easy"],
    ["Which function adds a range of numbers in Excel?", "AVERAGE()", "SUM()", "COUNT()", "TOTAL()", "B", "Easy"],
    ["Which shortcut key opens a new workbook in Excel?", "Ctrl+N", "Ctrl+O", "Ctrl+S", "Ctrl+P", "A", "Easy"],
    ["A worksheet is made up of rows and:", "Charts", "Columns", "Tabs", "Sheets", "B", "Easy"],
    ["Which feature helps summarize large data in Excel?", "Pivot Table", "Word Art", "Mail Merge", "Track Changes", "A", "Medium"],
    ["What does the VLOOKUP function do?", "Sorts data", "Searches a value vertically in a table", "Formats a cell", "Deletes duplicate values", "B", "Hard"],
  ],
  "Microsoft PowerPoint": [
    ["The default extension of a PowerPoint file is:", ".pptx", ".docx", ".xlsx", ".pdf", "A", "Easy"],
    ["Which view is used to rearrange slides in PowerPoint?", "Slide Sorter", "Normal", "Reading View", "Outline", "A", "Medium"],
    ["Which key starts a slideshow from the beginning?", "F5", "F2", "F7", "F10", "A", "Easy"],
    ["Slide transition refers to:", "Text formatting", "Effect when moving between slides", "File saving", "Spell check", "B", "Medium"],
    ["Which tab is used to insert a chart in PowerPoint?", "Insert", "Design", "Review", "View", "A", "Easy"],
    ["What is a 'Slide Master' used for?", "Recording audio", "Controlling overall slide design", "Printing slides", "Adding animations only", "B", "Medium"],
    ["Which file format is best for a PowerPoint presentation to be shared as read-only?", ".pptx", ".ppsx", ".docx", ".txt", "B", "Hard"],
    ["Which option adds movement effects to text/objects on a slide?", "Transition", "Animation", "Layout", "Theme", "B", "Medium"],
  ],
  "Internet": [
    ["WWW stands for:", "World Wide Web", "World Wide Wire", "Wide World Web", "Web Wide World", "A", "Easy"],
    ["Which protocol is used to browse websites?", "FTP", "HTTP", "SMTP", "POP3", "B", "Easy"],
    ["A website address is also called a:", "URL", "IP", "HTML", "ISP", "A", "Easy"],
    ["Which company developed the Chrome browser?", "Microsoft", "Google", "Apple", "Mozilla", "B", "Easy"],
    ["Which symbol is used in an email address to separate the username and domain?", "#", "@", "&", "%", "B", "Easy"],
    ["What does ISP stand for?", "Internet Service Provider", "Internal System Process", "Internet System Provider", "Internal Service Process", "A", "Medium"],
    ["Which of these is a search engine?", "Google", "MS Word", "Excel", "Windows", "A", "Easy"],
    ["HTTPS is more secure than HTTP because it uses:", "Compression", "Encryption", "Cookies", "Cache", "B", "Medium"],
  ],
  "Windows Operating System": [
    ["Which key combination opens Task Manager in Windows?", "Ctrl+Alt+Delete", "Ctrl+Shift+Esc", "Alt+F4", "Ctrl+Esc", "B", "Medium"],
    ["The Windows feature that temporarily stores deleted files is called:", "My Computer", "Recycle Bin", "Control Panel", "Task Bar", "B", "Easy"],
    ["Which key opens the Start Menu in Windows?", "Windows key", "Ctrl", "Alt", "Tab", "A", "Easy"],
    ["What is the default file manager in Windows called?", "File Explorer", "Finder", "Nautilus", "Disk Manager", "A", "Easy"],
    ["Which shortcut is used to lock a Windows computer?", "Windows+L", "Windows+D", "Ctrl+L", "Alt+L", "A", "Medium"],
    ["The taskbar in Windows is usually located:", "At the top", "At the bottom", "On the left only", "It is hidden always", "B", "Easy"],
  ],
  "Computer Hardware": [
    ["Which of these is the main circuit board of a computer?", "RAM", "Motherboard", "Hard Disk", "Monitor", "B", "Medium"],
    ["Which device is used to print documents?", "Scanner", "Printer", "Projector", "Monitor", "B", "Easy"],
    ["SSD stands for:", "Solid State Drive", "Secondary Storage Device", "System Storage Disk", "Simple Storage Drive", "A", "Medium"],
    ["Which port is commonly used to connect a USB flash drive?", "VGA", "USB", "HDMI", "PS/2", "B", "Easy"],
    ["Which of these components performs arithmetic and logic operations?", "ALU", "RAM", "Cache", "BIOS", "A", "Hard"],
    ["Which device is used to convert digital signals to analog and vice versa?", "Router", "Modem", "Switch", "Hub", "B", "Medium"],
  ],
  "Computer Software": [
    ["An operating system is an example of:", "Application Software", "System Software", "Hardware", "Firmware", "B", "Medium"],
    ["Which of these is an example of application software?", "Windows", "Linux", "MS Word", "BIOS", "C", "Easy"],
    ["Antivirus software is used to:", "Speed up the CPU", "Protect against malware", "Increase RAM", "Print documents", "B", "Easy"],
    ["Which type of software translates an entire program before execution?", "Interpreter", "Compiler", "Assembler", "Debugger", "B", "Hard"],
    ["Freeware refers to software that is:", "Paid and licensed", "Free of cost", "Only for businesses", "Illegal to use", "B", "Easy"],
    ["Which of the following is a popular open-source operating system?", "Windows", "macOS", "Linux", "MS Office", "C", "Medium"],
  ],
  "Computer Networking": [
    ["LAN stands for:", "Local Area Network", "Large Area Network", "Long Area Network", "Linked Area Network", "A", "Easy"],
    ["Which device connects multiple computers within a network?", "Modem", "Switch", "Monitor", "Scanner", "B", "Medium"],
    ["What does IP in 'IP Address' stand for?", "Internet Protocol", "Internal Process", "Internet Program", "Internal Protocol", "A", "Medium"],
    ["Which network covers the largest geographical area?", "LAN", "PAN", "WAN", "MAN", "C", "Medium"],
    ["Wi-Fi is used to connect devices using:", "Cables", "Radio waves", "Light signals", "Sound waves", "B", "Easy"],
    ["Which device is used to connect a LAN to the Internet?", "Router", "Keyboard", "Printer", "Monitor", "A", "Easy"],
  ],
  "Cyber Security": [
    ["A strong password should ideally include:", "Only your name", "Only numbers", "A mix of letters, numbers and symbols", "Only lowercase letters", "C", "Easy"],
    ["What is 'phishing'?", "A type of computer virus", "A fraudulent attempt to obtain sensitive information", "A hardware fault", "A programming language", "B", "Medium"],
    ["Which of these helps protect a computer from malware?", "Antivirus software", "MS Word", "Calculator", "Notepad", "A", "Easy"],
    ["A firewall is used to:", "Increase internet speed", "Block unauthorized network access", "Print documents", "Format a hard disk", "B", "Medium"],
    ["What should you do if you receive an email asking for your bank password?", "Reply with the password", "Delete or report it without responding", "Forward it to friends", "Click all links inside", "B", "Easy"],
    ["Two-factor authentication adds security by requiring:", "Only a password", "A password and a second verification step", "No login at all", "Only a username", "B", "Medium"],
  ],
};

const seedExam = async () => {
  try {
    await connectDB();

    // 1. Categories
    await Category.deleteMany({});
    const categoryDocs = await Category.insertMany(
      CATEGORY_NAMES.map((name) => ({ name, slug: toSlug(name) }))
    );
    const categoryIdByName = Object.fromEntries(categoryDocs.map((c) => [c.name, c._id]));

    // 2. Default Admin
    await Admin.deleteMany({});
    await Admin.create({ name: "Future IT College Admin", email: adminEmail, password: adminPassword, role: "superadmin" });

    // 3. Questions
    await Question.deleteMany({});
    const questionDocs = [];
    for (const [categoryName, rows] of Object.entries(QUESTION_BANK)) {
      for (const [question, A, B, C, D, correctAnswer, difficulty] of rows) {
        questionDocs.push({
          category: categoryIdByName[categoryName],
          topic: "Basic Computer",
          question,
          optionA: A,
          optionB: B,
          optionC: C,
          optionD: D,
          correctAnswer,
          difficulty,
          marks: 1,
          language: "English",
          status: "Active",
        });
      }
    }
    await Question.insertMany(questionDocs);

    // 4. A ready-to-use exam using the Test Generator's category distribution
    await Exam.deleteMany({});
    await Exam.create({
      name: "Basic Computer Test",
      description: "A 50-question mixed-difficulty test covering all core computer topics.",
      durationMinutes: 15,
      totalQuestions: 50,
      topic: "Basic Computer",
      difficulty: "Mixed",
      passingPercentage: 60,
      categoryDistribution: [
        { category: categoryIdByName["Computer Fundamentals"], count: 15 },
        { category: categoryIdByName["MS Word"], count: 5 },
        { category: categoryIdByName["MS Excel"], count: 5 },
        { category: categoryIdByName["Microsoft PowerPoint"], count: 5 },
        { category: categoryIdByName["Internet"], count: 5 },
        { category: categoryIdByName["Windows Operating System"], count: 3 },
        { category: categoryIdByName["Computer Hardware"], count: 3 },
        { category: categoryIdByName["Computer Software"], count: 3 },
        { category: categoryIdByName["Computer Networking"], count: 3 },
        { category: categoryIdByName["Cyber Security"], count: 3 },
      ],
      allowRetest: false,
      showExplanationAfterSubmit: true,
      isActive: true,
    });

    console.log("Exam module seed complete:");
    console.log(`  Categories: ${categoryDocs.length}`);
    console.log(`  Questions: ${questionDocs.length}`);
    console.log(`  Admin login -> email: ${adminEmail} / password: ${adminPassword}`);
    console.log(`  Exam created: "Basic Computer Test" (50 questions, 15 minutes)`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Exam seeding failed:", error);
    process.exit(1);
  }
};

seedExam();
