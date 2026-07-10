import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import isServerless from "../utils/isServerless.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUploadDir = () => {
  if (isServerless()) {
    return path.join("/tmp", "fic-uploads", "students");
  }
  return path.join(__dirname, "../uploads/students");
};

const ensureUploadDir = () => {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
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
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        const safeName = `student-${req.student?._id || "unknown"}-${Date.now()}${ext}`;
        cb(null, safeName);
      },
    });

const uploadImage = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

export default uploadImage;
