import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/common/FormField";
import { COURSE_OPTIONS } from "@/constants/siteData";
import type { StudentSignupData } from "@/types/portal";

const StudentSignup = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(
    "Student self-registration is disabled. Please contact your administrator to create your account."
  );
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSignupData>();

  const onSubmit = async (_: StudentSignupData) => {
    setServerError(
      "Student self-registration is disabled. Please contact your administrator to create your account."
    );
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Create Student Account"
      subtitle="Sign up to access tests, track your results and more."
      footer={
        <p className="text-[13.5px] text-[#C6CEEF]">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          label="Full Name"
          id="name"
          placeholder="Your full name"
          error={errors.name?.message}
          {...register("name", { required: "Please enter your full name." })}
        />
        <FormField
          label="Email Address"
          id="email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", { required: "Please enter your email address." })}
        />
        <FormField
          label="Mobile Number"
          id="phone"
          type="tel"
          placeholder="10-digit mobile number"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Please enter a valid 10-digit mobile number.",
            pattern: { value: /^[6-9]\d{9}$/, message: "Please enter a valid 10-digit mobile number." },
          })}
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Please create a password.",
            minLength: { value: 6, message: "Password must be at least 6 characters." },
          })}
        />
        <FormField as="select" label="Course" id="course" defaultValue="" {...register("course")}>
          <option value="" disabled>
            Select your course (optional)
          </option>
          {COURSE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FormField>
        <FormField label="Address" id="address" placeholder="Your address (optional)" {...register("address")} />

        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] px-4 py-3">
            {serverError}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default StudentSignup;
