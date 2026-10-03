import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import WebsiteSettings from "../models/WebsiteSettings.js";
import HeroBanner from "../models/HeroBanner.js";
import Notice from "../models/Notice.js";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Gallery from "../models/Gallery.js";
import Testimonial from "../models/Testimonial.js";
import MediaAsset from "../models/MediaAsset.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { defaultWebsiteContent, mergeWebsiteDefaults } from "../constants/defaultWebsiteContent.js";
import { persistUploadedImage } from "../utils/imageUpload.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RESOURCE_MODELS = {
  banners: { model: HeroBanner, fields: ["title", "subtitle", "description", "image", "mobileImage", "primaryCtaText", "primaryCtaHref", "secondaryCtaText", "secondaryCtaHref", "isActive", "order", "startAt", "endAt"] },
  notices: { model: Notice, fields: ["title", "summary", "body", "category", "priority", "link", "attachment", "isActive", "pinned", "order", "publishAt", "expiresAt"] },
  courses: { model: Course, fields: ["title", "shortTitle", "description", "icon", "duration", "eligibility", "feeDisplay", "image", "features", "subjects", "batches", "ctaLabel", "ctaHref", "category", "featured", "badge", "order", "isActive"] },
  faculty: { model: Faculty, fields: ["name", "designation", "subject", "qualification", "experience", "specialization", "bio", "image", "order", "isActive"] },
  gallery: { model: Gallery, fields: ["title", "category", "image", "caption", "eventName", "eventDate", "isFeatured", "order", "isActive"] },
  testimonials: { model: Testimonial, fields: ["name", "role", "quote", "rating", "image", "order", "isActive"] },
};

const resourceFor = (name) => {
  const resource = RESOURCE_MODELS[name];
  if (!resource) throw new ApiError(404, "Website content type not found");
  return resource;
};

const validUrl = (value) => /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value);

const validateSettingsTree = (value, key = "", depth = 0) => {
  if (depth > 8) throw new ApiError(400, "Website settings are nested too deeply");
  if (typeof value === "string") {
    if (value.length > 2000) throw new ApiError(400, `${key || "Text"} cannot exceed 2000 characters`);
    if (/(href|url|image|logo|favicon|src|attachment|link)$/i.test(key) && value && !validUrl(value)) {
      throw new ApiError(400, `${key} must use https, http, a local path, or a safe link`);
    }
    return;
  }
  if (value === null || typeof value === "boolean" || typeof value === "number") return;
  if (Array.isArray(value)) {
    if (value.length > 100) throw new ApiError(400, "A website settings list cannot contain more than 100 items");
    value.forEach((child) => validateSettingsTree(child, key, depth + 1));
    return;
  }
  if (typeof value !== "object") throw new ApiError(400, "Website settings contain an unsupported value");
  const entries = Object.entries(value);
  if (entries.length > 100) throw new ApiError(400, "A website settings section has too many fields");
  for (const [childKey, child] of entries) {
    if (["__proto__", "prototype", "constructor"].includes(childKey)) throw new ApiError(400, "Unsafe settings field");
    validateSettingsTree(child, childKey, depth + 1);
  }
};

export const getAdminWebsiteSettings = asyncHandler(async (req, res) => {
  const record = await WebsiteSettings.findOne({ key: "main" }).lean();
  const data = mergeWebsiteDefaults(defaultWebsiteContent, record?.data);
  // Add the optional photo control to older facility records without writing
  // to or replacing any existing website settings until an admin saves.
  const facilityItems = data.homepage?.sections?.facilities?.items;
  if (Array.isArray(facilityItems)) data.homepage.sections.facilities.items = facilityItems.map((item) => ({ ...item, image: item.image || "" }));
  return res.status(200).json(new ApiResponse(200, {
    data,
    updatedAt: record?.updatedAt || null,
  }));
});

export const updateWebsiteSettings = asyncHandler(async (req, res) => {
  const data = req.body?.data ?? req.body;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new ApiError(400, "Website settings must be an object");
  if (Buffer.byteLength(JSON.stringify(data), "utf8") > 250_000) throw new ApiError(413, "Website settings cannot exceed 250 KB");
  validateSettingsTree(data);
  const record = await WebsiteSettings.findOneAndUpdate(
    { key: "main" },
    { $set: { data, updatedBy: req.admin?._id || null } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
  return res.status(200).json(new ApiResponse(200, { data: record.data, updatedAt: record.updatedAt }, "Website settings saved"));
});

export const listWebsiteResources = asyncHandler(async (req, res) => {
  const { model } = resourceFor(req.params.resource);
  const items = await model.find({}).sort({ order: 1, createdAt: -1 }).limit(500).lean();
  return res.status(200).json(new ApiResponse(200, items));
});

const entityPayload = (resource, payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new ApiError(400, "Content must be an object");
  const clean = {};
  for (const field of resource.fields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) clean[field] = payload[field];
  }
  if (!Object.keys(clean).length) throw new ApiError(400, "No editable content fields were provided");
  validateSettingsTree(clean);
  if (clean.order !== undefined && (!Number.isFinite(Number(clean.order)) || Number(clean.order) < 0)) throw new ApiError(400, "Display order must be a non-negative number");
  return clean;
};

export const createWebsiteResource = asyncHandler(async (req, res) => {
  const resource = resourceFor(req.params.resource);
  const item = await resource.model.create(entityPayload(resource, req.body));
  return res.status(201).json(new ApiResponse(201, item, "Website content created"));
});

export const updateWebsiteResource = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid content id");
  const resource = resourceFor(req.params.resource);
  const item = await resource.model.findByIdAndUpdate(req.params.id, { $set: entityPayload(resource, req.body) }, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, "Website content not found");
  return res.status(200).json(new ApiResponse(200, item, "Website content updated"));
});

export const deleteWebsiteResource = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid content id");
  const resource = resourceFor(req.params.resource);
  const item = await resource.model.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, "Website content not found");
  return res.status(200).json(new ApiResponse(200, { id: req.params.id }, "Website content deleted"));
});

export const uploadWebsiteMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Choose an image to upload");
  const folderInput = String(req.body?.folder || "website").toLowerCase();
  const folder = /^[a-z0-9_-]{1,40}$/.test(folderInput) ? folderInput : "website";
  const url = await persistUploadedImage(req.file, `website/${folder}`);
  const asset = await MediaAsset.create({
    originalName: req.file.originalname,
    url,
    mimeType: req.file.mimetype,
    size: req.file.size || req.file.buffer?.length || 0,
    folder,
    altText: String(req.body?.altText || "").slice(0, 240),
    uploadedBy: req.admin?._id || null,
  });
  return res.status(201).json(new ApiResponse(201, { url, asset }, "Image uploaded"));
});

const collectStrings = (value, prefix = "") => {
  if (typeof value === "string") return value ? [{ value, prefix }] : [];
  if (Array.isArray(value)) return value.flatMap((entry, index) => collectStrings(entry, `${prefix}[${index + 1}]`));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => collectStrings(child, prefix ? `${prefix} › ${key}` : key));
};

const getWebsiteMediaUsage = async (urls) => {
  const references = new Map(urls.map((url) => [url, []]));
  const addReference = (url, label) => { if (references.has(url)) references.get(url).push(label); };
  const settings = await WebsiteSettings.findOne({ key: "main" }).select("data").lean();
  for (const { value, prefix } of collectStrings(settings?.data || {})) addReference(value, `Website settings › ${prefix}`);
  for (const [resourceName, { model }] of Object.entries(RESOURCE_MODELS)) {
    const records = await model.find({}).lean();
    records.forEach((record) => {
      const title = record.title || record.name || record.originalName || "Untitled";
      for (const { value } of collectStrings(record)) addReference(value, `${resourceName} › ${title}`);
    });
  }
  return references;
};

export const listWebsiteMedia = asyncHandler(async (req, res) => {
  const assets = await MediaAsset.find({}).sort({ createdAt: -1 }).limit(200).lean();
  const usage = await getWebsiteMediaUsage(assets.map((asset) => asset.url));
  return res.status(200).json(new ApiResponse(200, assets.map((asset) => ({ ...asset, usedIn: usage.get(asset.url) || [] }))));
});

const removeStoredWebsiteImage = async (url) => {
  if (url.startsWith("/uploads/")) {
    const filename = path.basename(url);
    if (!filename || filename !== url.slice("/uploads/".length) || filename.includes("..")) throw new ApiError(400, "This image cannot be safely removed from local storage");
    const uploadRoot = path.resolve(__dirname, "../uploads");
    const filePath = path.resolve(uploadRoot, filename);
    if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) throw new ApiError(400, "This image cannot be safely removed from local storage");
    await fs.unlink(filePath).catch((error) => { if (error.code !== "ENOENT") throw error; });
    return;
  }

  let parsed;
  try { parsed = new URL(url); } catch { throw new ApiError(400, "This media URL is not managed by the website uploader"); }
  if (parsed.hostname !== "res.cloudinary.com" || !isCloudinaryConfigured) {
    throw new ApiError(503, "This image cannot be removed from storage with the current media configuration");
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments[0] !== process.env.CLOUDINARY_CLOUD_NAME || segments[1] !== "image" || segments[2] !== "upload") {
    throw new ApiError(400, "This Cloudinary image is outside the configured media account");
  }
  const versionIndex = segments.findIndex((part, index) => index >= 3 && /^v\d+$/.test(part));
  const publicIdSegments = segments.slice(versionIndex >= 0 ? versionIndex + 1 : 3);
  if (!publicIdSegments.length) throw new ApiError(400, "Could not verify this Cloudinary image identifier");
  const last = publicIdSegments.pop();
  publicIdSegments.push(last.replace(/\.[^.]+$/, ""));
  const result = await cloudinary.uploader.destroy(publicIdSegments.join("/"), { resource_type: "image" });
  if (result.result !== "ok" && result.result !== "not found") throw new ApiError(502, "The image could not be removed from Cloudinary");
};

export const deleteWebsiteMediaRecord = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid media id");
  const asset = await MediaAsset.findById(req.params.id).lean();
  if (!asset) throw new ApiError(404, "Media record not found");
  const usage = await getWebsiteMediaUsage([asset.url]);
  const usedIn = usage.get(asset.url) || [];
  if (usedIn.length) throw new ApiError(409, `This image is still in use: ${usedIn.slice(0, 5).join(", ")}`);
  await removeStoredWebsiteImage(asset.url);
  await MediaAsset.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, { id: req.params.id }, "Image removed from the media library and storage"));
});
