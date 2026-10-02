import mongoose from "mongoose";
import WebsiteSettings from "../models/WebsiteSettings.js";
import HeroBanner from "../models/HeroBanner.js";
import Notice from "../models/Notice.js";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Gallery from "../models/Gallery.js";
import Testimonial from "../models/Testimonial.js";
import MediaAsset from "../models/MediaAsset.js";
import { defaultWebsiteContent, mergeWebsiteDefaults } from "../constants/defaultWebsiteContent.js";
import { persistUploadedImage } from "../utils/imageUpload.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
  return res.status(200).json(new ApiResponse(200, {
    data: mergeWebsiteDefaults(defaultWebsiteContent, record?.data),
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

export const listWebsiteMedia = asyncHandler(async (req, res) => {
  const assets = await MediaAsset.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return res.status(200).json(new ApiResponse(200, assets));
});

export const deleteWebsiteMediaRecord = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid media id");
  const asset = await MediaAsset.findByIdAndDelete(req.params.id);
  if (!asset) throw new ApiError(404, "Media record not found");
  return res.status(200).json(new ApiResponse(200, { id: req.params.id }, "Media record removed"));
});
