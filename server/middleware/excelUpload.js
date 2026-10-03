import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv",
    "application/csv",
  ];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
    return cb(null, true);
  }
  cb(new Error("Only .xlsx, .xls, or .csv files are allowed"));
};

/**
 * In-memory upload for Excel/CSV question bank imports — the buffer
 * is parsed immediately and never written to disk.
 */
const excelUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, fieldArrayIndexLimit: 20 },
});

export default excelUpload;
