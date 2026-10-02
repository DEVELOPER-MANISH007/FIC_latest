import { useState } from "react";
import { useForm } from "react-hook-form";
import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import FormField from "@/components/common/FormField";
import { SITE } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { submitContact } from "@/services/api/contact.service";
import type { ContactFormData, SubmitStatus } from "@/types";
import { useWebsite } from "@/context/WebsiteContext";

const MapPinIcon = getIcon("mapPin");
const PhoneIcon = getIcon("phone");
const MailIcon = getIcon("mail");

const ContactSection = () => {
  const { settings, cmsAvailable } = useWebsite();
  const contact = settings.contact || {};
  const brand = settings.brand || {};
  const address = contact.address || (cmsAvailable ? {} : SITE.address);
  const phones = cmsAvailable
    ? (Array.isArray(contact.phones) ? contact.phones : [])
    : (contact.phones?.length ? contact.phones : SITE.phones);
  const email = contact.email || (cmsAvailable ? "" : SITE.email);
  const locationName = brand.locationName || (cmsAvailable ? "" : SITE.locationName);
  const mapUrl = contact.mapUrl || (cmsAvailable ? "" : SITE.mapUrl);
  const mapEmbedUrl = contact.mapEmbedUrl || (cmsAvailable ? "" : SITE.mapEmbedUrl);
  const addressLine = [address.line1, address.city, address.state, address.pincode].filter(Boolean).join(", ");
  const addressText = addressLine || (cmsAvailable ? "" : `${SITE.address.city}, ${SITE.address.state} – ${SITE.address.pincode}`);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({ mode: "onBlur" });

  const onSubmit = async (values: ContactFormData) => {
    setStatus("submitting");
    setServerMessage("");
    try {
      const res = await submitContact(values);
      setStatus("success");
      setServerMessage(res.message);
      reset();
    } catch (err: any) {
      setStatus("error");
      setServerMessage(err?.response?.data?.message || "Something went wrong. Please call us directly.");
    }
  };

  return (
    <section id="contact" className="py-16 lg:py-24 bg-[var(--bg-soft)]">
      <div className="container-x">
        <SectionHeading eyebrow="Contact" title="Visit or reach out anytime" sectionKey="contact" />

        <div className="grid lg:grid-cols-2 gap-8 mt-14">
          <Reveal className="space-y-5">
            {(locationName || addressText) && (
              <div className="card p-6 flex items-start gap-4">
                <div className="icon-wrap shrink-0"><MapPinIcon size={20} /></div>
                <div>
                  {locationName && <h3 className="font-display font-semibold text-[15px]">{locationName}</h3>}
                  {addressText && <p className="text-[13.5px] text-[var(--ink-soft)] mt-1 leading-relaxed">{addressText}</p>}
                </div>
              </div>
            )}
            {phones.length > 0 && <div className="card p-6 flex items-start gap-4">
              <div className="icon-wrap shrink-0">
                <PhoneIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-[15px]">Phone</h3>
                <p className="text-[13.5px] text-[var(--ink-soft)] mt-1">{phones.join(" · ")}</p>
              </div>
            </div>}
            {contact.openingHours && <div className="card p-6 flex items-start gap-4">
              <div className="icon-wrap shrink-0"><span aria-hidden="true">◷</span></div>
              <div><h3 className="font-display font-semibold text-[15px]">Opening hours</h3><p className="text-[13.5px] text-[var(--ink-soft)] mt-1">{contact.openingHours}</p></div>
            </div>}
            {email && <div className="card p-6 flex items-start gap-4">
              <div className="icon-wrap shrink-0">
                <MailIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-[15px]">Email</h3>
                <p className="text-[13.5px] text-[var(--ink-soft)] mt-1">{email}</p>
              </div>
            </div>}
            <div className="flex flex-wrap gap-3 pt-2">
              {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-navy btn-sm">
                Get Directions
              </a>}
              {phones[0] && <a
                href={`tel:+91${phones[0]}`}
                className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]"
              >
                Call Now
              </a>}
              {(contact.whatsapp || phones[0]) && <a
                href={`https://wa.me/91${contact.whatsapp || phones[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                WhatsApp
              </a>}
            </div>
          </Reveal>

          {mapEmbedUrl && <Reveal delay={0.1} className="w-full rounded-xl overflow-hidden shadow-lg">
            <iframe
              title="FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER location map"
              src={mapEmbedUrl}
              className="w-full h-[420px] border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>}
        </div>

        <Reveal delay={0.15} className="card p-8 lg:p-10 rounded-[var(--radius-lg)] mt-8">
          <h3 className="font-display font-semibold text-xl">Send us a quick message</h3>
          <p className="text-[13.5px] text-[var(--ink-soft)] mt-1">
            For general questions — for course enquiries, use the admission form above.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid sm:grid-cols-2 gap-5 mt-6">
            <FormField
              label="Name"
              id="contact-name"
              placeholder="Your name"
              error={errors.name?.message}
              {...register("name", { required: "Please enter your name." })}
            />
            <FormField
              label="Phone"
              id="contact-phone"
              type="tel"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...register("phone", {
                required: "Please enter a valid 10-digit mobile number.",
                pattern: { value: /^[6-9]\d{9}$/, message: "Please enter a valid 10-digit mobile number." },
              })}
            />
            <div className="sm:col-span-2">
              <FormField
                label="Email"
                optional
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email", {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email address." },
                })}
              />
            </div>
            <div className="sm:col-span-2">
              <FormField
                as="textarea"
                label="Message"
                id="contact-message"
                rows={3}
                placeholder="How can we help?"
                error={errors.message?.message}
                {...register("message", { required: "Please enter a message." })}
              />
            </div>

            {status === "success" && (
              <div className="sm:col-span-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[13.5px] px-4 py-3">
                {serverMessage}
              </div>
            )}
            {status === "error" && (
              <div className="sm:col-span-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] px-4 py-3">
                {serverMessage}
              </div>
            )}

            <div className="sm:col-span-2">
              <button type="submit" disabled={status === "submitting"} className="btn btn-primary">
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
