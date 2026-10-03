import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    // Point Tailwind at this app's config explicitly so the build works
    // no matter which directory Vite is launched from.
    tailwindcss: { config: path.join(__dirname, "tailwind.config.js") },
    autoprefixer: {},
  },
};

