import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import { useWebsite } from "@/context/WebsiteContext";
import type { FacultyMember } from "@/types";

import directorFallback from "@/assets/images/director.jpg";
import facultyFallback from "@/assets/images/faculty.jpg";

const FALLBACK: FacultyMember[] = [
  {
    name: "Mr. Dinesh Kumar",
    designation: "Founder & Director",
    qualification: "M.Sc. (Chemistry)",
    bio: "Leads Future IT College with a focus on discipline, experience and genuine student development, guiding the institute's growth since 2016.",
    image: directorFallback,
  },
  {
    name: "Shivani Singh",
    designation: "Faculty",
    qualification: "BCA / B.Sc. (Computer Science)",
    bio: "A passionate instructor focused on practical computer education and building strong programming fundamentals.",
    image: facultyFallback,
  },
];

const Faculty = () => {
  const { faculty: cmsFaculty, cmsAvailable, cmsLoading } = useWebsite();
  const faculty = (cmsAvailable ? cmsFaculty : FALLBACK) as FacultyMember[];

  return (
    <section id="faculty" className="py-16 lg:py-24">
      <div className="container-x">
        <SectionHeading eyebrow="Meet The Team" title="Guided by people who care" sectionKey="faculty" />

        {cmsLoading ? <div className="grid sm:grid-cols-2 gap-8 mt-14 max-w-3xl mx-auto" aria-busy="true" aria-label="Loading faculty profiles">
          {Array.from({ length: 2 }, (_, i) => <div key={i} className="card overflow-hidden rounded-[var(--radius-lg)] animate-pulse motion-reduce:animate-none">
            <div className="aspect-[4/5] bg-[var(--bg-soft)]" />
            <div className="p-6 space-y-3"><div className="h-5 w-2/3 rounded bg-[var(--bg-soft)]" /><div className="h-4 w-1/2 rounded bg-[var(--bg-soft)]" /><div className="h-4 w-3/4 rounded bg-[var(--bg-soft)]" /></div>
          </div>)}
          <span className="sr-only">Loading faculty profiles…</span>
        </div> : faculty.length ? <div className="grid sm:grid-cols-2 gap-8 mt-14 max-w-3xl mx-auto">
          {faculty.map((member, i) => {
            const imgSrc = member.image?.startsWith("/uploads")
              ? resolveImageUrl(member.image)
              : member.image;
            return (
              <Reveal key={member.name} delay={i * 0.1}>
                <div className="card overflow-hidden rounded-[var(--radius-lg)]">
                  <div className="aspect-[4/5]">
                    <img
                      src={imgSrc}
                      alt={`${member.name}, ${member.designation}, Future IT College`}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: i === 1 ? "50% 15%" : "50% 50%" }}
                      loading="lazy"
                      onError={(event) => {
                        const image = event.currentTarget;
                        if (!cmsAvailable && image.dataset.fallback !== "true") {
                          image.dataset.fallback = "true";
                          image.src = i === 0 ? directorFallback : facultyFallback;
                        } else {
                          image.style.visibility = "hidden";
                        }
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-lg">{member.name}</h3>
                    <p className="text-[var(--royal)] text-[13.5px] font-medium mt-0.5">{member.designation}</p>
                    <p className="text-[12.5px] text-[var(--ink-soft)] mt-1">{member.qualification}</p>
                    {member.subject && <p className="text-sm text-[var(--ink-soft)] mt-1">Subject: {member.subject}</p>}
                    {member.experience && <p className="text-sm text-[var(--ink-soft)] mt-1">Experience: {member.experience}</p>}
                    {member.specialization && <p className="text-sm text-[var(--ink-soft)] mt-2">{member.specialization}</p>}
                    {member.bio && (
                      <p className="text-[13.5px] text-[var(--ink-soft)] mt-3 leading-relaxed">{member.bio}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div> : <div className="mt-12 rounded-xl bg-[var(--bg-soft)] px-6 py-10 text-center text-[var(--ink-soft)]">Faculty profiles will be updated soon.</div>}
      </div>
    </section>
  );
};

export default Faculty;
