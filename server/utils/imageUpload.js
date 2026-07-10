import { Readable } from "stream";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import isServerless from "./isServerless.js";

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
    throw new Error(
      "Image uploads on Vercel require CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
    );
  }

  const prefix = subfolder ? `/uploads/${subfolder}/` : "/uploads/";
  return `${prefix}${file.filename}`;
}
