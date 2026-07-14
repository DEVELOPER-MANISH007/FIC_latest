import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { getIcon } from "@/constants/iconMap";
import {
  fetchAdminStudyCourses,
  createStudyCourse,
  updateStudyCourse,
  deleteStudyCourse,
  addStudySubject,
  updateStudySubject,
  deleteStudySubject,
} from "@/services/api/adminStudyCourse.service";
import type { StudyCourseItem } from "@/types";

const ChevronIcon = getIcon("chevronUp");
const TrashIcon = getIcon("trash");
const EditIcon = getIcon("edit");
const PlusIcon = getIcon("plus");
const ArrowIcon = getIcon("arrowRight");

/**
 * Dynamic Course & Subject Management for the Study Material module.
 * Admin can add unlimited courses, each with unlimited subjects, with no
 * code changes — these feed the Course -> Subject dropdowns used when
 * uploading material and the Course -> Subject browser students see.
 */
const AdminStudyCourses = () => {
  const [courses, setCourses] = useState<StudyCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [courseError, setCourseError] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseName, setEditCourseName] = useState("");

  const [subjectDraft, setSubjectDraft] = useState<Record<string, string>>({});
  const [editingSubject, setEditingSubject] = useState<{ courseId: string; subjectId: string; name: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetchAdminStudyCourses()
      .then((c) => setCourses(c || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseError("");
    if (!newCourseName.trim()) return;
    setSavingCourse(true);
    try {
      await createStudyCourse({ name: newCourseName.trim(), description: newCourseDesc.trim() });
      setNewCourseName("");
      setNewCourseDesc("");
      load();
    } catch (err: any) {
      setCourseError(err?.response?.data?.message || "Could not create course");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleToggleCourseActive = async (course: StudyCourseItem) => {
    await updateStudyCourse(course._id, { isActive: !course.isActive });
    load();
  };

  const handleRenameCourse = async (id: string) => {
    if (!editCourseName.trim()) return;
    try {
      await updateStudyCourse(id, { name: editCourseName.trim() });
      setEditingCourseId(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not rename course");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Delete this course? This only works if no study materials use it.")) return;
    try {
      await deleteStudyCourse(id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not delete course");
    }
  };

  const handleAddSubject = async (courseId: string) => {
    const name = subjectDraft[courseId]?.trim();
    if (!name) return;
    try {
      await addStudySubject(courseId, name);
      setSubjectDraft((prev) => ({ ...prev, [courseId]: "" }));
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not add subject");
    }
  };

  const handleRenameSubject = async () => {
    if (!editingSubject || !editingSubject.name.trim()) return;
    try {
      await updateStudySubject(editingSubject.courseId, editingSubject.subjectId, { name: editingSubject.name.trim() });
      setEditingSubject(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not rename subject");
    }
  };

  const handleToggleSubjectActive = async (courseId: string, subjectId: string, isActive: boolean) => {
    await updateStudySubject(courseId, subjectId, { isActive: !isActive });
    load();
  };

  const handleDeleteSubject = async (courseId: string, subjectId: string) => {
    if (!confirm("Delete this subject? This only works if no study materials use it.")) return;
    try {
      await deleteStudySubject(courseId, subjectId);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not delete subject");
    }
  };

  return (
    <AdminLayout title="Course & Subject Management">
      <div className="flex justify-between items-center mb-6">
        <Link to="/admin/study-materials" className="text-[13.5px] font-medium text-[var(--royal)] flex items-center gap-1.5 hover:underline">
          <ArrowIcon size={14} className="rotate-180" /> Back to Study Materials
        </Link>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <form onSubmit={handleCreateCourse} className="card p-6 h-fit space-y-4">
          <h2 className="font-display font-semibold text-lg">Add Course</h2>
          <div>
            <label className="f-label">Course Name</label>
            <input className="field" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} placeholder="e.g. Data Science" />
          </div>
          <div>
            <label className="f-label">Description (optional)</label>
            <textarea className="field" rows={2} value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} />
          </div>
          {courseError && <p className="text-[12.5px] text-red-500">{courseError}</p>}
          <button type="submit" disabled={savingCourse} className="btn btn-primary w-full">
            {savingCourse ? "Adding..." : "Add Course"}
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="card p-6 h-20 ph" />)
          ) : courses.length === 0 ? (
            <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
              No courses yet. Add your first course to get started.
            </div>
          ) : (
            courses.map((course) => {
              const isOpen = expanded.has(course._id);
              return (
                <div key={course._id} className="card p-0 overflow-hidden">
                  <div className="flex items-center gap-3 p-5">
                    <button onClick={() => toggleExpand(course._id)} className="text-[var(--ink-soft)] shrink-0">
                      <ChevronIcon size={16} className={isOpen ? "" : "rotate-180"} />
                    </button>

                    <div className="min-w-0 flex-1">
                      {editingCourseId === course._id ? (
                        <input
                          autoFocus
                          className="field !py-2"
                          value={editCourseName}
                          onChange={(e) => setEditCourseName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameCourse(course._id)}
                          onBlur={() => handleRenameCourse(course._id)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-display font-semibold text-[15px] truncate">{course.name}</p>
                          {!course.isActive && (
                            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-soft)] text-[var(--ink-soft)] shrink-0">Inactive</span>
                          )}
                        </div>
                      )}
                      <p className="text-[12px] text-[var(--ink-soft)]">{course.subjects.length} subject(s)</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingCourseId(course._id);
                        setEditCourseName(course.name);
                      }}
                      className="text-[var(--ink-soft)] hover:text-[var(--royal)] shrink-0"
                      title="Rename course"
                    >
                      <EditIcon size={15} />
                    </button>
                    <button
                      onClick={() => handleToggleCourseActive(course)}
                      className="text-[11.5px] font-medium px-3 py-1.5 rounded-full bg-[var(--bg-soft)] text-[var(--ink-soft)] shrink-0"
                    >
                      {course.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDeleteCourse(course._id)} className="text-red-500 hover:text-red-600 shrink-0" title="Delete course">
                      <TrashIcon size={15} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-[var(--line)] bg-[var(--bg-soft)] p-5 space-y-3">
                      {course.subjects.length === 0 && (
                        <p className="text-[12.5px] text-[var(--ink-soft)]">No subjects yet — add one below.</p>
                      )}
                      {course.subjects.map((subject) => (
                        <div key={subject._id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5">
                          {editingSubject?.subjectId === subject._id ? (
                            <input
                              autoFocus
                              className="field !py-1.5 flex-1"
                              value={editingSubject.name}
                              onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                              onKeyDown={(e) => e.key === "Enter" && handleRenameSubject()}
                              onBlur={handleRenameSubject}
                            />
                          ) : (
                            <span className="flex-1 text-[13.5px] font-medium truncate">
                              {subject.name}
                              {!subject.isActive && <span className="ml-2 text-[10.5px] text-[var(--ink-soft)]">(inactive)</span>}
                            </span>
                          )}
                          <button
                            onClick={() => setEditingSubject({ courseId: course._id, subjectId: subject._id, name: subject.name })}
                            className="text-[var(--ink-soft)] hover:text-[var(--royal)] shrink-0"
                          >
                            <EditIcon size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleSubjectActive(course._id, subject._id, !!subject.isActive)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--bg-soft)] text-[var(--ink-soft)] shrink-0"
                          >
                            {subject.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => handleDeleteSubject(course._id, subject._id)} className="text-red-500 hover:text-red-600 shrink-0">
                            <TrashIcon size={13} />
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          className="field !py-2 flex-1"
                          placeholder="New subject name..."
                          value={subjectDraft[course._id] || ""}
                          onChange={(e) => setSubjectDraft((prev) => ({ ...prev, [course._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAddSubject(course._id)}
                        />
                        <button onClick={() => handleAddSubject(course._id)} className="btn btn-navy btn-sm shrink-0">
                          <PlusIcon size={13} /> Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudyCourses;
