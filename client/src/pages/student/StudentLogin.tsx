import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/common/FormField";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/images/logo.png";
import type { LoginFormData } from "@/types";

interface StudentLoginProps {
  modal?: boolean;
  onClose?: () => void;
}

const StudentLogin = ({ modal = false, onClose }: StudentLoginProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: Location } };
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  useEffect(() => {
    if (!modal) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current?.();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [modal]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setLoading(true);
    try {
      await login(data);
      const redirectTo = modal ? "/dashboard" : (location.state?.from as any)?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
      onClose?.();
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Invalid email/username or password");
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField label="Email or Username" id={modal ? "student-modal-email" : "email"} type="text" placeholder="you@example.com or your username" error={errors.email?.message} {...register("email", { required: "Please enter your email or username." })} />
      <FormField label="Password" id={modal ? "student-modal-password" : "password"} type="password" placeholder="Your password" error={errors.password?.message} {...register("password", { required: "Please enter your password." })} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/forgot-password" onClick={onClose} className="text-[13px] text-[var(--royal)] font-medium hover:underline">Forgot password?</Link>
      </div>
      {serverError && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13.5px] px-4 py-3">{serverError}</div>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? "Logging in..." : "Log In"}</button>
    </form>
  );

  const footer = <p className="text-[13.5px] text-[#C6CEEF]">Trouble logging in? Contact the institute — student accounts are created by the institute.</p>;
  if (!modal) return <AuthLayout title="Student Login" subtitle="Log in to access your dashboard, tests and results." footer={footer}>{form}</AuthLayout>;

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[var(--navy)]/65 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="student-login-title" aria-describedby="student-login-description" tabIndex={-1} className="relative my-auto w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-5 shadow-2xl sm:p-8">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close student login" className="absolute right-4 top-4 rounded-md p-2 text-[var(--ink-soft)] hover:bg-[var(--bg-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--royal)]"><FiX size={20} /></button>
        <div className="mb-6 flex items-center gap-3 pr-10">
          <img src={logo} alt="Future IT College logo" className="h-11 w-11 rounded-lg border border-[var(--line)] object-cover" />
          <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--royal)]">Future IT College</p><h2 id="student-login-title" className="font-display text-xl font-bold text-[var(--ink)]">Student Login</h2></div>
        </div>
        <p id="student-login-description" className="mb-5 text-sm text-[var(--ink-soft)]">Access your student dashboard, tests and results.</p>
        {form}
        <p className="mt-5 text-center text-xs text-[var(--ink-soft)]">Trouble logging in? Contact the institute to confirm your account details.</p>
      </div>
    </div>, document.body
  );
};

export default StudentLogin;
