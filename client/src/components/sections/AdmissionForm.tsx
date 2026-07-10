import { useState } from "react";
import { useForm } from "react-hook-form";
import Reveal from "@/components/common/Reveal";
import SectionEyebrow from "@/components/common/SectionEyebrow";
import FormField from "@/components/common/FormField";
import { getIcon } from "@/constants/iconMap";
import { SITE, COURSE_OPTIONS } from "@/constants/siteData";
import { submitAdmission } from "@/services/api/admission.service";
import type { AdmissionFormData, SubmitStatus } from "@/types";
import AdmissionProcess from "./AdmissionProcess";

const PhoneIcon = getIcon("phone");
const MailIcon = getIcon("mail");
const WhatsappIcon = getIcon("whatsapp");

const AdmissionForm = () => {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdmissionFormData>({ mode: "onBlur" });

  const onSubmit = async (values: AdmissionFormData) => {
    setStatus("submitting");
    setServerMessage("");
    try {
      const res = await submitAdmission(values);
      setStatus("success");
      setServerMessage(res.message);
      reset();
    } catch (err: any) {
      setStatus("error");
      setServerMessage(
        err?.response?.data?.message ||
          "Something went wrong sending your enquiry. Please check the highlighted fields, or call us directly."
      );
    }
  };

  return (
    <section id="admission" className="py-16 lg:py-24">
      <div className="container-x">
        <AdmissionProcess />

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-0 mt-20 card rounded-[var(--radius-lg)] overflow-hidden">
          <Reveal className="grad-navy p-10 lg:p-12 text-white flex flex-col justify-between">
            <div>
              <SectionEyebrow variant="dark">Admission Enquiry</SectionEyebrow>
              <h3 className="font-display font-bold text-2xl lg:text-3xl mt-5">Let's get you started</h3>
              <p className="text-[#C6CEEF] mt-4 leading-relaxed">
                Share a few details and our team will reach out to guide you through course selection and demo
                classes.
              </p>
            </div>
            <div className="mt-10 space-y-4">
              <a
                href={`tel:+91${SITE.phones[0]}`}
                className="flex items-center gap-3 text-white hover:text-[var(--orange-soft)] transition"
              >
                <PhoneIcon size={18} />
                <span className="text-[14.5px]">{SITE.phones.join(" / ")}</span>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 text-white hover:text-[var(--orange-soft)] transition"
              >
                <MailIcon size={18} />
                <span className="text-[14.5px]">{SITE.email}</span>
              </a>
              <div className="flex gap-3 pt-2">
                <a href={`tel:+91${SITE.phones[0]}`} className="btn btn-outline btn-sm">
                  Call Now
                </a>
                <a
                  href={`https://wa.me/91${SITE.phones[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <WhatsappIcon size={15} /> WhatsApp
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="p-8 lg:p-12">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  label="Full Name"
                  id="name"
                  placeholder="Your full name"
                  error={errors.name?.message}
                  {...register("name", { required: "Please enter your full name." })}
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
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-5">
                <FormField
                  label="Father's Name"
                  id="fatherName"
                  placeholder="Father's full name"
                  error={errors.fatherName?.message}
                  {...register("fatherName", { required: "Please enter father's name." })}
                />
                <FormField
                  label="Qualification"
                  id="qualification"
                  placeholder="e.g. 12th Pass, Graduate"
                  error={errors.qualification?.message}
                  {...register("qualification", { required: "Please enter your qualification." })}
                />
              </div>

              <div className="mt-5">
                <FormField
                  label="Email Address"
                  optional
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email", {
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email address." },
                  })}
                />
              </div>

              <div className="mt-5">
                <FormField
                  label="Address"
                  id="address"
                  placeholder="Your address"
                  error={errors.address?.message}
                  {...register("address", { required: "Please enter your address." })}
                />
              </div>

              <div className="mt-5">
                <FormField
                  as="select"
                  label="Interested Course"
                  id="course"
                  error={errors.course?.message}
                  defaultValue=""
                  {...register("course", { required: "Please select a course." })}
                >
                  <option value="" disabled>
                    Select a course
                  </option>
                  {COURSE_OPTIONS.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </FormField>
              </div>

              <div className="mt-5">
                <FormField
                  as="textarea"
                  label="Message"
                  id="message"
                  rows={3}
                  placeholder="Any questions or additional details"
                  {...register("message")}
                />
              </div>

              {status === "success" && (
                <div className="mt-5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[13.5px] px-4 py-3">
                  {serverMessage || "Thank you — your enquiry has been received."}
                </div>
              )}
              {status === "error" && (
                <div className="mt-5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] px-4 py-3">
                  {serverMessage}
                </div>
              )}

              <button type="submit" disabled={status === "submitting"} className="btn btn-primary w-full mt-6">
                {status === "submitting" ? "Sending..." : "Submit Enquiry"}
              </button>
              <p className="text-[11.5px] text-[var(--ink-soft)] text-center mt-3">
                Submitting this form sends an enquiry only — it does not confirm admission.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AdmissionForm;
