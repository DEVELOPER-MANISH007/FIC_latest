import XLSX from "xlsx";

const stripBom = (value) => String(value ?? "").replace(/^\uFEFF/, "");

const normalizeHeaderKey = (key) => stripBom(String(key).trim()).toLowerCase().replace(/[\s_]+/g, "");

/** Required columns for question CSV/Excel import (Category is optional). */
export const REQUIRED_IMPORT_HEADERS = [
  { field: "question", label: "Question", aliases: ["question"] },
  { field: "optionA", label: "Option A", aliases: ["optiona"] },
  { field: "optionB", label: "Option B", aliases: ["optionb"] },
  { field: "optionC", label: "Option C", aliases: ["optionc"] },
  { field: "optionD", label: "Option D", aliases: ["optiond"] },
  { field: "correctAnswer", label: "Correct Answer", aliases: ["correctanswer"] },
];

const stripBomBuffer = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.subarray(3);
  }
  return buffer;
};

const isRowEmpty = (row) => Object.values(row).every((value) => stripBom(String(value ?? "")).trim() === "");

/**
 * Validates that the parsed sheet contains the minimum required headers.
 * Header matching is case-insensitive and ignores spaces/underscores.
 */
export const validateQuestionHeaders = (sampleRow = {}) => {
  const normalizedKeys = Object.keys(sampleRow).map(normalizeHeaderKey);
  const missing = REQUIRED_IMPORT_HEADERS.filter(
    ({ aliases }) => !aliases.some((alias) => normalizedKeys.includes(alias))
  ).map(({ label }) => label);

  return {
    valid: missing.length === 0,
    missing,
    foundHeaders: Object.keys(sampleRow).map((header) => stripBom(header.trim())),
  };
};

/**
 * Parses an uploaded .xlsx/.csv buffer into an array of plain row
 * objects keyed by the header row. Supports UTF-8, optional BOM,
 * LF/CRLF line endings, and skips blank rows.
 */
export const parseExcelBuffer = (buffer, { filename = "", mimetype = "" } = {}) => {
  if (!buffer?.length) {
    throw new Error("Uploaded file is empty");
  }

  const data = stripBomBuffer(buffer);

  let workbook;
  try {
    workbook = XLSX.read(data, {
      type: "buffer",
      codepage: 65001,
    });
  } catch (err) {
    throw new Error(`Could not read file as spreadsheet/CSV: ${err.message}`);
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The uploaded file contains no worksheets");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", blankrows: false }).filter((row) => !isRowEmpty(row));

  if (rows.length) {
    const headerCheck = validateQuestionHeaders(rows[0]);
    console.log("[CSV Import] Parsed headers:", headerCheck.foundHeaders);
    console.log("[CSV Import] First data row:", rows[0]);
    if (!headerCheck.valid) {
      throw new Error(
        `Missing required column(s): ${headerCheck.missing.join(", ")}. Found: ${headerCheck.foundHeaders.join(", ") || "(none)"}`
      );
    }
  }

  return rows;
};

/**
 * Builds an .xlsx file buffer from an array of plain row objects.
 * Used by the Question Bank Excel Export feature.
 */
export const buildExcelBuffer = (rows, sheetName = "Questions") => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
};

/**
 * Normalizes a variety of likely header spellings from admin-uploaded
 * sheets (e.g. "Option A" vs "optionA" vs "OPTION_A") into the fields
 * our Question model expects.
 */
export const normalizeQuestionRow = (row) => {
  const get = (...keys) => {
    for (const key of keys) {
      const found = Object.keys(row).find((rawKey) => normalizeHeaderKey(rawKey) === key.replace(/[\s_]+/g, ""));
      if (found) {
        const value = stripBom(String(row[found])).trim();
        if (value !== "") return value;
      }
    }
    return "";
  };

  const difficulty = get("difficulty") || "Medium";
  const normalizedDifficulty = ["easy", "medium", "hard"].includes(difficulty.toLowerCase())
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
    : difficulty;

  const correctAnswer = get("correctanswer", "correct answer").toUpperCase();

  return {
    category: get("category"),
    topic: get("topic"),
    question: get("question"),
    optionA: get("optiona", "option a"),
    optionB: get("optionb", "option b"),
    optionC: get("optionc", "option c"),
    optionD: get("optiond", "option d"),
    correctAnswer,
    difficulty: normalizedDifficulty,
    marks: Number(get("marks")) || 1,
    language: get("language") || "English",
    explanation: get("explanation"),
  };
};
