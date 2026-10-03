import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  // Absolute globs so class scanning works regardless of the launch directory.
  content: [path.join(__dirname, "index.html"), path.join(__dirname, "src/**/*.{js,ts,jsx,tsx}")],
  theme: {
    extend: {
      colors: {
        royal: { DEFAULT: "#2547E0", dark: "#1B34A8" },
        navy: { DEFAULT: "#0B1440", soft: "#12296B" },
        accent: { DEFAULT: "#FF7A29", soft: "#FFA35C" },
        inkSoft: "#5B6280",
        line: "#E4E8F5",
        bgSoft: "#F4F6FC",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        num: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        lg2: "28px",
        md2: "18px",
      },
      boxShadow: {
        soft: "0 20px 50px -20px rgba(18,41,107,0.25)",
        card: "0 12px 30px -12px rgba(18,41,107,0.18)",
        cardHover: "0 26px 50px -18px rgba(18,41,107,0.28)",
      },
    },
  },
  plugins: [],
};

