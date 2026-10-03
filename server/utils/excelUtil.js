import XLSX from "xlsx";

/**
 * Parses an uploaded Excel/CSV buffer into an array of plain objects,
 * keyed by the header row. Used by the question bank bulk-import flow.
 */
export const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
};

/**
 * Builds an .xlsx buffer from an array of plain objects — used for
 * both Question Bank export and Result export.
 */
export const buildExcelBuffer = (rows, sheetName = "Sheet1") => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
};

