import Counter from "@/components/common/Counter";
import { HERO_STATS } from "@/constants/siteData";
import { useWebsite } from "@/context/WebsiteContext";

const HeroStats = () => {
  const { settings } = useWebsite();
  const cmsStats = settings.homepage?.stats;
  const stats = Array.isArray(cmsStats) ? cmsStats.filter((stat: any) => stat.visible !== false).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((stat: any) => ({ target: Number(stat.value), suffix: stat.suffix || "", label: stat.label })) : HERO_STATS;
  if (!stats.length) return null;
  return (
  <section className="relative -mt-1">
    <div className="container-x">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 -translate-y-16 relative z-20">
        {stats.map((stat: any) => (
          <div key={stat.label} className="card p-6 lg:p-8 text-center rounded-[var(--radius-md)]">
            <p className="text-3xl lg:text-4xl text-[var(--royal)]">
              <Counter target={stat.target} suffix={stat.suffix} />
            </p>
            <p className="text-[13px] text-[var(--ink-soft)] mt-2 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default HeroStats;
