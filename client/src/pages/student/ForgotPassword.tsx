import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/common/FormField";
import { forgotPassword } from "@/services/api/studentAuth.service";

const ForgotPassword = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <p className="text-[13.5px] text-[#C6CEEF]">
          <Link to="/login" className="text-white font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      }
    >
      {message ? (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 text-[13.5px] px-4 py-3">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormField
            label="Email Address"
            id="email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email", { required: "Please enter your email address." })}
          />
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;

