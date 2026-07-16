import { useState } from "react";
import FormField from "@/components/common/FormField";
import { getIcon } from "@/constants/iconMap";
import { createMaterial, updateMaterial, uploadMaterialFileDirect } from "@/services/api/adminStudyMaterial.service";
import { formatFileSize } from "@/utils/studyMaterial";
import { useToast } from "@/context/ToastContext";
import type { StudyMaterialItem } from "@/types";

const CloseIcon = getIcon("close");
const UploadIcon = getIcon("uploadCloud");
const FileIcon = getIcon("file");

interface Props {
  material: StudyMaterialItem | null;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Upload / edit a study material. Structure: Subject -> Topic (title) ->
 * Unit, no Course selection required.
 */
const StudyMaterialFormModal = ({ material, onClose, onSaved }: Props) => {
  const toast = useToast();
  const [title, setTitle] = useState(material?.title || "");
  const [subject, setSubject] = useState(material?.subject || "");
  const [unit, setUnit] = useState(material?.unit || "");
  const [description, setDescription] = useState(material?.description || "");
  const [visibility, setVisibility] = useState<"public" | "enrolled">(material?.visibility || "public");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subject.trim()) return setError("Subject name is required");
    if (!title.trim()) return setError("Topic/Notes title is required");
    if (!unit.trim()) return setError("Unit name is required");
    if (!material && !file) return setError("Please choose a file to upload");
    if (file && file.size > 50 * 1024 * 1024) return setError("File is too large — the limit is 50MB");

    const fields = {
      subject: subject.trim(),
      title: title.trim(),
      unit: unit.trim(),
      description: description.trim(),
      visibility,
    };

    setLoading(true);
    try {
      let payload: Record<string, unknown> = fields;

      if (file) {
        // Uploads straight to Cloudinary from the browser — this is what
        // lets large PDFs/images succeed on Vercel, since the file bytes
        // never pass through our serverless function's body-size limit.
        setUploadPercent(0);
        const uploaded = await uploadMaterialFileDirect(file, setUploadPercent);
        payload = { ...fields, ...uploaded };
      }

      if (material) {
        await updateMaterial(material._id, payload);
        toast.success("Study material updated successfully");
      } else {
        await createMaterial(payload);
        toast.success("Study material uploaded successfully");
      }
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not save the study material";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setUploadPercent(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">{material ? "Edit Study Material" : "Upload Study Material"}</h2>
          <button onClick={onClose} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Subject Name"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Python"
            />
            <FormField
              label="Unit Name"
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. Unit 2"
            />
          </div>

          <FormField
            label="Topic / Notes Title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Functions in Python"
          />

          <FormField
            as="textarea"
            label="Description"
            id="description"
            optional
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <FormField
            as="select"
            label="Visibility"
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "public" | "enrolled")}
          >
            <option value="public">Public — visible on the website, no login required</option>
            <option value="enrolled">Enrolled Students Only</option>
          </FormField>

          <div>
            <label className="f-label" htmlFor="file">
              File {!material && <span className="font-normal text-[var(--ink-soft)]">(PDF, ZIP, DOC(X), PPT(X), or image — max 50MB)</span>}
            </label>
            <label
              htmlFor="file"
              className="field flex items-center gap-3 cursor-pointer !bg-white border-dashed hover:border-[var(--royal)] transition"
            >
              <UploadIcon size={18} className="text-[var(--royal)] shrink-0" />
              <span className="text-[13.5px] text-[var(--ink-soft)] truncate">
                {file ? file.name : material ? `Keep current file (${material.fileName || "uploaded file"})` : "Choose a file..."}
              </span>
            </label>
            <input
              id="file"
              type="file"
              className="hidden"
              accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {material && !file && (
              <p className="text-[12px] text-[var(--ink-soft)] mt-1.5 flex items-center gap-1.5">
                <FileIcon size={12} /> Current file: {formatFileSize(material.fileSize)} — upload a new file above to replace it.
              </p>
            )}
          </div>

          {error && <p className="text-[12.5px] text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading
              ? uploadPercent !== null
                ? `Uploading... ${uploadPercent}%`
                : "Saving..."
              : material
              ? "Update Material"
              : "Upload Material"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudyMaterialFormModal;
