import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element enters the viewport (for scroll animations).
 */
export default function useInViewOnce(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: options.rootMargin || "0px 0px -8% 0px", threshold: options.threshold ?? 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, options.rootMargin, options.threshold]);

  return [ref, visible];
}
