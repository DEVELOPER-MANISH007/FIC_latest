import { Readable } from "stream";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import isServerless from "./isServerless.js";
import ApiError from "./ApiError.js";

const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

/**
 * Persists an uploaded image and returns a public URL or local path.
 * On Vercel/serverless, Cloudinary must be configured.
 */
export async function persistUploadedImage(file, subfolder = "") {
  const folder = subfolder ? `fic/${subfolder}` : "fic";

  if (isCloudinaryConfigured) {
    if (file.buffer) {
      const result = await uploadBufferToCloudinary(file.buffer, folder);
      return result.secure_url;
    }
    if (file.path) {
      const result = await cloudinary.uploader.upload(file.path, { folder });
      return result.secure_url;
    }
    throw new Error("Uploaded file has no readable content");
  }

  if (isServerless()) {
    throw new ApiError(503, "Image uploads are temporarily unavailable. Configure the institute media storage to enable uploads.");
  }

  // Disk storage writes uploaded files directly under server/uploads. Keep the
  // public URL aligned with that storage path; the folder is metadata only.
  return `/uploads/${file.filename}`;
}
