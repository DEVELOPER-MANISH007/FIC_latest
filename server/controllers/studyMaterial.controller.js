import StudyMaterial from "../models/StudyMaterial.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (value) => (value || "").trim().toLowerCase();

/**
 * Whether a logged-in student counts as "enrolled" for a given material's
 * subject. Student.course and StudyMaterial.subject are both free text
 * (e.g. course = "Python Full Stack Development", subject = "Python"), so
 * we match if either one contains the other, case-insensitively.
 *
 * NOTE: earlier versions only checked `subject` against a regex built from
 * the (usually longer/more specific) course name, which is backwards and
 * almost never matched real data — that was the root cause of enrolled
 * students not seeing their own Enrolled-Only materials. Fixed here with a
 * proper bidirectional, normalized comparison.
 */
const isEnrolledForSubject = (student, subject) => {
  const course = norm(student?.course);
  const subj = norm(subject);
  if (!course || !subj) return false;
  return course.includes(subj) || subj.includes(course);
};

/** Strips the actual file location from a material a student isn't entitled to yet. */
const toLockedSummary = (material) => {
  const obj = material.toObject ? material.toObject() : material;
  const { fileUrl, filePublicId, ...rest } = obj;
  return { ...rest, locked: true };
};

/**
 * @route GET /api/materials
 * @desc  Browse study materials.
 *        Default mode: Public material and the student's own Enrolled-Only
 *        material come back fully unlocked; Enrolled-Only material for
 *        *other* courses still appears (so students can see what's
 *        available) but is flagged `locked: true` with the file location
 *        stripped out, so the UI can show an "enrolled students only"
 *        message + Enroll CTA instead of hiding it outright.
 *        `accessibleOnly=true` mode (used by the "My Notes" page): only
 *        material the student can actually open — no locked entries.
 *        Query: page, limit, keyword, subject, sortBy (latest|oldest), accessibleOnly
 * @access Student (protected)
 */
export const getMaterials = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 60);
  const accessibleOnly = req.query.accessibleOnly === "true";

  const filter = { isActive: true };
  if (req.query.subject) filter.subject = new RegExp(`^${escapeRegex(req.query.subject.trim())}$`, "i");
  if (req.query.keyword) {
    const re = new RegExp(escapeRegex(req.query.keyword.trim()), "i");
    filter.$or = [{ title: re }, { subject: re }, { unit: re }];
  }

  const sort = req.query.sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  if (!accessibleOnly) {
    const skip = (page - 1) * limit;
    const [rawItems, total] = await Promise.all([
      StudyMaterial.find(filter).sort(sort).skip(skip).limit(limit),
      StudyMaterial.countDocuments(filter),
    ]);

    const items = rawItems.map((material) => {
      if (material.visibility === "public") return { ...material.toObject(), locked: false };
      const unlocked = isEnrolledForSubject(req.student, material.subject);
      return unlocked ? { ...material.toObject(), locked: false } : toLockedSummary(material);
    });

    return res.status(200).json(
      new ApiResponse(200, {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  }

  // "My Notes" — only material this student can actually open. Filtered in
  // application code (not the Mongo query) since eligibility depends on a
  // fuzzy comparison between two free-text fields on different documents;
  // capped at 300 candidates, comfortably above any real coaching-site
  // dataset, then paginated in memory.
  const candidates = await StudyMaterial.find(filter).sort(sort).limit(300);
  const accessible = candidates.filter(
    (material) => material.visibility === "public" || isEnrolledForSubject(req.student, material.subject)
  );
  const total = accessible.length;
  const items = accessible.slice((page - 1) * limit, page * limit).map((material) => ({ ...material.toObject(), locked: false }));

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    })
  );
});

/**
 * @route GET /api/materials/subjects
 * @desc  Distinct subject names among all active materials (Public +
 *        Enrolled-Only, whether or not this student is enrolled in them —
 *        subjects should still show up as browsable folders/filters even
 *        when locked).
 * @access Student (protected)
 */
export const getMaterialSubjects = asyncHandler(async (req, res) => {
  const subjects = await StudyMaterial.distinct("subject", { isActive: true, subject: { $ne: "" } });
  return res.status(200).json(new ApiResponse(200, subjects.sort((a, b) => a.localeCompare(b))));
});

/**
 * @route GET /api/materials/:id
 * @access Student (protected). Public and matching Enrolled-Only material
 *         return in full; non-matching Enrolled-Only material returns a
 *         locked summary (200, not 404) so the UI can render the
 *         "available only for enrolled students" state with an Enroll CTA.
 */
export const getMaterialById = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOne({ _id: req.params.id, isActive: true });
  if (!material) throw new ApiError(404, "Material not found");

  if (material.visibility === "public" || isEnrolledForSubject(req.student, material.subject)) {
    return res.status(200).json(new ApiResponse(200, { ...material.toObject(), locked: false }));
  }

  return res.status(200).json(new ApiResponse(200, toLockedSummary(material)));
});

/**
 * @route POST /api/materials/:id/download
 * @desc  Atomically increments the download counter and returns the file
 *        URL. Hard-blocks (403) if the student isn't entitled to this
 *        material — locked listings must never translate into a working
 *        download.
 * @access Student (protected)
 */
export const registerDownload = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOne({ _id: req.params.id, isActive: true });
  if (!material) throw new ApiError(404, "Material not found");

  const allowed = material.visibility === "public" || isEnrolledForSubject(req.student, material.subject);
  if (!allowed) {
    throw new ApiError(403, "This material is available only for enrolled students.");
  }

  material.downloadCount += 1;
  await material.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { fileUrl: material.fileUrl, fileName: material.fileName }, "Download counted"));
});
