import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/common/FormField";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { LoginFormData } from "@/types";

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setLoading(true);
    try {
      await login(data);
      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="admin" title="Admin Portal Login" subtitle="Authorized institute administrators only.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          label="Admin ID / Email"
          id="email"
          type="email"
          placeholder="Enter your admin email"
          error={errors.email?.message}
          {...register("email", { required: "Please enter your email address." })}
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password", { required: "Please enter your password." })}
        />
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] px-4 py-3">
            {serverError}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
