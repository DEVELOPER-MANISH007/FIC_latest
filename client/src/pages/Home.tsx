import Hero from "@/components/sections/Hero";
import HeroStats from "@/components/sections/HeroStats";
import About from "@/components/sections/About";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Courses from "@/components/sections/Courses";
import IndustryCourses from "@/components/sections/IndustryCourses";
import LearningJourney from "@/components/sections/LearningJourney";
import Scholarship from "@/components/sections/Scholarship";
import DemoClass from "@/components/sections/DemoClass";
import Facilities from "@/components/sections/Facilities";
import Faculty from "@/components/sections/Faculty";
import StudentSuccess from "@/components/sections/StudentSuccess";
import LaptopProgram from "@/components/sections/LaptopProgram";
import Certificate from "@/components/sections/Certificate";
import AdmissionEnquiry from "@/components/sections/AdmissionEnquiry";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import FAQSection from "@/components/sections/FAQSection";
import ContactSection from "@/components/sections/ContactSection";
import FinalCTA from "@/components/sections/FinalCTA";
import { useWebsite } from "@/context/WebsiteContext";
import NoticesPreview from "@/components/sections/NoticesPreview";
import LibraryCallout from "@/components/sections/LibraryCallout";
import { Fragment, type ReactNode } from "react";

/**
 * Home assembles every section in the same order as the original
 * single-page design. Each section is an independent, reusable
 * component under components/sections.
 */
const Home = () => {
  const { settings } = useWebsite();
  const sections = settings.homepage?.sections || {};
  const orderedSections: { key: string; component: ReactNode }[] = [
    { key: "hero", component: <Hero /> }, { key: "stats", component: <HeroStats /> }, { key: "about", component: <About /> },
    { key: "whyChooseUs", component: <WhyChooseUs /> }, { key: "courses", component: <Courses /> }, { key: "industryCourses", component: <IndustryCourses /> },
    { key: "learningJourney", component: <LearningJourney /> }, { key: "scholarship", component: <Scholarship /> }, { key: "demoClass", component: <DemoClass /> },
    { key: "facilities", component: <Facilities /> }, { key: "faculty", component: <Faculty /> }, { key: "studentSuccess", component: <StudentSuccess /> },
    { key: "laptopProgram", component: <LaptopProgram /> }, { key: "certificate", component: <Certificate /> }, { key: "admission", component: <AdmissionEnquiry /> },
    { key: "gallery", component: <Gallery /> }, { key: "testimonials", component: <Testimonials /> }, { key: "faqs", component: <FAQSection /> },
    { key: "notices", component: <NoticesPreview /> }, { key: "library", component: <LibraryCallout /> }, { key: "contact", component: <ContactSection /> }, { key: "finalCta", component: <FinalCTA /> },
  ];
  const ordered = orderedSections
    .map((entry, index) => ({ ...entry, settings: sections[entry.key] || {}, fallbackOrder: index + 1 }))
    .filter((entry) => entry.settings.enabled !== false)
    .sort((a, b) => {
      const orderA = Number(a.settings.order); const orderB = Number(b.settings.order);
      return (Number.isFinite(orderA) ? orderA : a.fallbackOrder) - (Number.isFinite(orderB) ? orderB : b.fallbackOrder);
    });
  return <>
    {ordered.map((entry) => <Fragment key={entry.key}>{entry.component}</Fragment>)}
  </>;
};

export default Home;
