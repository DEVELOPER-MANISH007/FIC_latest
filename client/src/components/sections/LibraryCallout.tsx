import { Link } from "react-router-dom";
import SectionHeading from "@/components/common/SectionHeading";
import { useWebsite } from "@/context/WebsiteContext";

const LibraryCallout = () => {
  const { settings } = useWebsite();
  const content = settings.homepage?.sections?.library || {};
  return <section className="py-14 lg:py-20 bg-[var(--bg-soft)]">
    <div className="container-x max-w-4xl text-center rounded-2xl border border-[var(--line)] bg-white px-6 py-8 md:px-10 md:py-10">
      <SectionHeading sectionKey="library" eyebrow={content.eyebrow || "Student Resources"} title={content.title || "Study material for your next class"} subtitle={content.subtitle || "Browse class notes and learning material from the student library."} />
      <Link to={content.buttonHref || "/library"} className="inline-flex mt-6 items-center rounded-lg bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--royal)]">{content.buttonText || "Explore the library"}</Link>
    </div>
  </section>;
};

export default LibraryCallout;
