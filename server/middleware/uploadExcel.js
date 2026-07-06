import multer from "multer";
import ApiError from "../utils/ApiError.js";

/**
 * In-memory storage for Excel/CSV uploads — the Question Bank Import
 * feature parses the buffer directly and never needs to persist the
 * original spreadsheet to disk.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/csv",
    "text/plain",
    "application/octet-stream",
  ];
  if (allowed.includes(file.mimetype) || /\.(xlsx|csv)$/i.test(file.originalname)) {
    return cb(null, true);
  }
  cb(new ApiError(400, `Unsupported file type "${file.mimetype}". Upload a .xlsx or .csv file.`));
};

const uploadExcel = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export default uploadExcel;
