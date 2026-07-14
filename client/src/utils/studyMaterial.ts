import type { StudyMaterialFileType } from "@/types";

/** Formats a byte count as a human-readable size (e.g. "2.4 MB"). */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const FILE_TYPE_LABEL: Record<StudyMaterialFileType, string> = {
  pdf: "PDF",
  zip: "ZIP",
  docx: "Word",
  ppt: "PowerPoint",
  image: "Image",
  file: "File",
};

/** Tailwind-ish inline classes for a small colored badge per file type. */
export const FILE_TYPE_COLOR: Record<StudyMaterialFileType, string> = {
  pdf: "bg-red-50 text-red-600",
  zip: "bg-amber-50 text-amber-600",
  docx: "bg-blue-50 text-blue-600",
  ppt: "bg-orange-50 text-orange-600",
  image: "bg-purple-50 text-purple-600",
  file: "bg-[var(--bg-soft)] text-[var(--ink-soft)]",
};
