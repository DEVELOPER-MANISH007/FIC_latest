import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import isServerless from "../utils/isServerless.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUploadDir = () => {
  if (isServerless()) {
    return path.join("/tmp", "fic-uploads", "study-materials");
  }
  return path.join(__dirname, "..", "uploads", "study-materials");
};

const ensureUploadDir = () => {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const ALLOWED_EXTENSIONS = /\.(pdf|zip|docx?|pptx?|jpe?g|png|webp)$/i;
const ALLOWED_MIMETYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream", // some browsers send this for .zip/.docx
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const fileFilter = (req, file, cb) => {
  const extOk = ALLOWED_EXTENSIONS.test(file.originalname);
  const mimeOk = ALLOWED_MIMETYPES.has(file.mimetype);
  if (extOk || mimeOk) return cb(null, true);
  cb(new Error("Unsupported file type. Upload a PDF, ZIP, DOC(X), PPT(X), or image file."));
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
 * Study Material uploads — PDF/ZIP/DOC(X)/PPT(X)/images.
 * Uses memory storage on Vercel (persisted to Cloudinary); local disk in
 * development, served from /uploads/study-materials (see app.js static route).
 */
const uploadMaterial = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default uploadMaterial;
