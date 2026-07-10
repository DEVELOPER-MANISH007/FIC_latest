import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import isServerless from "../utils/isServerless.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUploadDir = () => {
  if (isServerless()) {
    return path.join("/tmp", "fic-uploads");
  }
  return path.join(__dirname, "..", "uploads");
};

const ensureUploadDir = () => {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
  if (isValid) return cb(null, true);
  cb(new Error("Only image files (jpg, jpeg, png, webp, gif) are allowed"));
};

const storage = isServerless()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        try {
          cb(null, ensureUploadDir());
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });

/**
 * Image uploads for faculty/gallery/course icons.
 * Uses memory storage on Vercel; local disk in development.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
