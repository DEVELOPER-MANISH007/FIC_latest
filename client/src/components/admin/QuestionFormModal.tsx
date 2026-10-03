import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/common/FormField";
import { fetchCategories } from "@/services/api/category.service";
import { createQuestion, updateQuestion } from "@/services/api/adminQuestion.service";
import type { Category, QuestionBankItem } from "@/types";

interface Props {
  question: QuestionBankItem | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  category: string;
  topic: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  explanation: string;
}

const QuestionFormModal = ({ question, onClose, onSaved }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: question
      ? {
          category: typeof question.category === "string" ? question.category : question.category?._id || "",
          topic: question.topic,
          question: question.question,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctAnswer: question.correctAnswer,
          difficulty: question.difficulty,
          marks: question.marks,
          explanation: question.explanation,
        }
      : { difficulty: "Medium", marks: 1 },
  });

  const values = watch();

  useEffect(() => {
    fetchCategories().then((c) => setCategories(c || []));
  }, []);

  const onSubmit = async (data: FormValues) => {
    setError("");
    setLoading(true);
    try {
      if (question) await updateQuestion(question._id, data);
      else await createQuestion(data);
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not save the question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">{question ? "Edit Question" : "Create Question"}</h2>
          <button onClick={onClose} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">✕</button>
        </div>

        {!preview ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField as="select" label="Category" id="category" error={errors.category?.message} defaultValue={question ? undefined : ""} {...register("category", { required: "Category is required" })}>
              <option value="" disabled>Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </FormField>

            <FormField label="Topic" id="topic" placeholder="e.g. Basic Computer" {...register("topic")} />
            <FormField as="textarea" label="Question" id="question" rows={2} error={errors.question?.message} {...register("question", { required: "Question text is required" })} />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Option A" id="optionA" error={errors.optionA?.message} {...register("optionA", { required: "Required" })} />
              <FormField label="Option B" id="optionB" error={errors.optionB?.message} {...register("optionB", { required: "Required" })} />
              <FormField label="Option C" id="optionC" error={errors.optionC?.message} {...register("optionC", { required: "Required" })} />
              <FormField label="Option D" id="optionD" error={errors.optionD?.message} {...register("optionD", { required: "Required" })} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <FormField as="select" label="Correct Answer" id="correctAnswer" {...register("correctAnswer", { required: true })}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </FormField>
              <FormField as="select" label="Difficulty" id="difficulty" {...register("difficulty")}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </FormField>
              <FormField label="Marks" id="marks" type="number" step="0.5" {...register("marks", { valueAsNumber: true })} />
            </div>

            <FormField as="textarea" label="Explanation" id="explanation" optional rows={2} {...register("explanation")} />

            {error && <p className="text-[12.5px] text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setPreview(true)} className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]">
                Preview
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? "Saving..." : question ? "Update Question" : "Create Question"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="card p-6">
              <p className="font-display font-semibold text-lg">{values.question}</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-4 text-[13.5px]">
                {(["A", "B", "C", "D"] as const).map((letter) => (
                  <div key={letter} className={`px-3 py-2 rounded-lg border ${letter === values.correctAnswer ? "border-green-400 bg-green-50" : "border-[var(--line)]"}`}>
                    <span className="font-semibold">{letter}.</span> {values[`option${letter}` as keyof FormValues] as string}
                  </div>
                ))}
              </div>
              <p className="text-[12.5px] text-[var(--ink-soft)] mt-3">Difficulty: {values.difficulty} · Marks: {values.marks}</p>
            </div>
            <button onClick={() => setPreview(false)} className="btn btn-navy w-full mt-5">Back to Edit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionFormModal;

