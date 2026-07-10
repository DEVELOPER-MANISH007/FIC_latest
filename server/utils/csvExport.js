/**
 * Minimal, dependency-free CSV builder used by the Admin Dashboard's
 * "Export CSV" actions (Admission Forms / Enquiry Forms).
 *
 * @param {Array<Object>} rows    Plain objects to serialize.
 * @param {Array<{key: string, label: string}>} columns  Column order + headers.
 * @returns {string} CSV text (CRLF line endings, RFC-4180 style quoting).
 */
export const toCSV = (rows, columns) => {
  const escapeCell = (value) => {
    if (value === undefined || value === null) return "";
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c.key])).join(","))
    .join("\r\n");

  return `${header}\r\n${body}`;
};

export default toCSV;
