import WebsiteSettings from "../models/WebsiteSettings.js";
import HeroBanner from "../models/HeroBanner.js";
import Notice from "../models/Notice.js";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Gallery from "../models/Gallery.js";
import Testimonial from "../models/Testimonial.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { defaultWebsiteContent, mergeWebsiteDefaults } from "../constants/defaultWebsiteContent.js";

// Website edits should appear on the next public request instead of waiting for
// a shared CDN cache window to expire.
const publicCache = (res) => res.set("Cache-Control", "no-store, max-age=0");

const findSettings = async () => {
  const record = await WebsiteSettings.findOne({ key: "main" }).lean();
  return mergeWebsiteDefaults(defaultWebsiteContent, record?.data);
};

const getScheduledBanners = async (now) => HeroBanner.find({
  isActive: true,
  $and: [
    { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
    { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
  ],
}).sort({ order: 1, createdAt: 1 }).lean();

export const getPublicWebsite = asyncHandler(async (req, res) => {
  const now = new Date();
  const [settings, banners, notices, courses, faculty, gallery, testimonials] = await Promise.all([
    findSettings(),
    getScheduledBanners(now),
    Notice.find({ isActive: true, publishAt: { $lte: now }, $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] })
      .sort({ pinned: -1, publishAt: -1, order: 1 }).limit(30).lean(),
    Course.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
    Faculty.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
    Gallery.find({ isActive: true }).sort({ isFeatured: -1, order: 1, createdAt: 1 }).limit(60).lean(),
    Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).limit(30).lean(),
  ]);

  publicCache(res);
  return res.status(200).json(new ApiResponse(200, { settings, banners, notices, courses, faculty, gallery, testimonials }));
});

export const getPublicNotices = asyncHandler(async (req, res) => {
  const now = new Date();
  const notices = await Notice.find({ isActive: true, publishAt: { $lte: now }, $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] })
    .sort({ pinned: -1, publishAt: -1, order: 1 }).limit(100).lean();
  publicCache(res);
  return res.status(200).json(new ApiResponse(200, notices));
});
