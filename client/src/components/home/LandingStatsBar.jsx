import useInViewOnce from "../../hooks/useInViewOnce";
import { CounterStat } from "./AnimatedCounter";

/**
 * Shared stats strip (landing + about). Dark indigo gradient to match brand moments.
 */
export default function LandingStatsBar({ className = "" }) {
  const [ref, visible] = useInViewOnce();

  return (
    <section ref={ref} className={`relative overflow-hidden bg-indigo-950 py-14 sm:py-16 ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-purple-500 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500 blur-[110px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 sm:px-6 lg:grid-cols-4 lg:gap-6">
        <CounterStat label="Jobs Posted" end={500} suffix="+" active={visible} />
        <CounterStat label="Students" end={1200} suffix="+" active={visible} />
        <CounterStat label="Recruiters" end={150} suffix="+" active={visible} />
        <CounterStat label="Placement Rate" end={80} suffix="%" active={visible} />
      </div>
    </section>
  );
}
