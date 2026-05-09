import { useEffect, useState } from "react";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export default function AnimatedCounter({
  end,
  durationMs = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  active,
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    let raf;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      setValue(end * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, durationMs]);

  const display =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  if (!active) {
    return <span className="opacity-30">0{suffix}</span>;
  }

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function CounterStat({ label, end, suffix = "+", prefix = "", decimals = 0, active }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        <AnimatedCounter end={end} suffix={suffix} prefix={prefix} decimals={decimals} active={active} />
      </p>
      <p className="mt-2 text-sm font-medium text-indigo-100/90">{label}</p>
    </div>
  );
}
