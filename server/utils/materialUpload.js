import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import isServerless from "./isServerless.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

// Same allow-list enforced by middleware/uploadMaterial.js — kept in sync so
// the signed direct-upload path (which never touches Multer) is validated
// just as strictly before we hand out a Cloudinary signature.
export const ALLOWED_MATERIAL_EXTENSIONS = /\.(pdf|zip|docx?|pptx?|jpe?g|png|webp)$/i;

const extOf = (filename) => path.extname(filename).replace(".", "").toLowerCase();

/** Maps a file's extension to the friendly `fileType` stored on StudyMaterial. */
export const detectFileType = (filename) => {
  const ext = extOf(filename);
  if (ext === "pdf") return "pdf";
  if (ext === "zip") return "zip";
  if (ext === "doc" || ext === "docx") return "docx";
  if (ext === "ppt" || ext === "pptx") return "ppt";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  return "file";
};

/** Cloudinary treats images specially (transformations); everything else is "raw". */
export const resourceTypeFor = (filename) => (IMAGE_EXTENSIONS.has(extOf(filename)) ? "image" : "raw");

const uploadBufferToCloudinary = (buffer, folder, resourceType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

/**
 * Persists an uploaded study-material file and returns the public URL plus
 * enough metadata (publicId/resourceType) to delete it later. Falls back to
 * local disk (same convention as utils/imageUpload.js) when Cloudinary isn't
 * configured and we're not running serverless.
 */
export async function persistUploadedMaterial(file, subfolder = "study-materials") {
  const resourceType = resourceTypeFor(file.originalname);
  const folder = `fic/${subfolder}`;

  if (isCloudinaryConfigured) {
    let result;
    if (file.buffer) {
      result = await uploadBufferToCloudinary(file.buffer, folder, resourceType);
    } else if (file.path) {
      result = await cloudinary.uploader.upload(file.path, { folder, resource_type: resourceType });
    } else {
      throw new Error("Uploaded file has no readable content");
    }
    return { url: result.secure_url, publicId: result.public_id, resourceType };
  }

  if (isServerless()) {
    throw new Error(
      "File uploads on Vercel require CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
    );
  }

  return { url: `/uploads/${subfolder}/${file.filename}`, publicId: "", resourceType };
}

/**
 * Builds a signed-upload payload the browser can use to send a file
 * *directly* to Cloudinary, bypassing our Vercel serverless function
 * entirely (Vercel's ~4.5MB request-body ceiling only applies to requests
 * that pass through our function — a browser → Cloudinary request never
 * does). Only the API secret ever touches this signature; api_key and
 * cloud_name are safe to hand to the browser (Cloudinary expects that).
 *
 * @param {string} originalFilename — used only to pick folder/resource_type.
 */
export function buildMaterialUploadSignature(originalFilename, subfolder = "study-materials") {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)");
  }
  if (!ALLOWED_MATERIAL_EXTENSIONS.test(originalFilename || "")) {
    throw new Error("Unsupported file type. Upload a PDF, ZIP, DOC(X), PPT(X), or image file.");
  }

  const folder = `fic/${subfolder}`;
  const resourceType = resourceTypeFor(originalFilename);
  const timestamp = Math.round(Date.now() / 1000);

  // Only params actually sent to Cloudinary's /upload endpoint need to be
  // signed — resource_type/api_key/file are not part of the signed payload.
  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

  return {
    signature,
    timestamp,
    folder,
    resourceType,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

/**
 * Best-effort cleanup of the underlying file when a material is replaced or
 * deleted. Never throws — a failed cleanup should not block the API response.
 */
export async function deleteUploadedMaterial({ fileUrl, filePublicId, fileResourceType }) {
  try {
    if (filePublicId && isCloudinaryConfigured) {
      await cloudinary.uploader.destroy(filePublicId, { resource_type: fileResourceType || "raw" });
      return;
    }
    if (fileUrl && fileUrl.startsWith("/uploads/")) {
      const absolute = path.join(__dirname, "..", fileUrl);
      if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
    }
  } catch (error) {
    console.error("[StudyMaterial] Failed to remove underlying file:", error.message);
  }
}
