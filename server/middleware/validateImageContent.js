import fs from "fs/promises";
import ApiError from "../utils/ApiError.js";

const hasSignature = (buffer, mimeType) => {
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  if (mimeType === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
};

/** Validate actual image bytes after multer, before sending them to storage. */
const validateImageContent = (req, res, next) => {
  if (!req.file) return next();
  const file = req.file;
  const read = file.buffer ? Promise.resolve(file.buffer) : fs.readFile(file.path);
  read.then(async (buffer) => {
    if (!hasSignature(buffer, file.mimetype)) {
      if (file.path) await fs.unlink(file.path).catch(() => {});
      throw new ApiError(400, "The uploaded file is not a valid JPG, PNG, WebP or GIF image");
    }
    next();
  }).catch(next);
};

export default validateImageContent;
