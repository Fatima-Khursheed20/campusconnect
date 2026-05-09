import useInViewOnce from "../../hooks/useInViewOnce";

/**
 * Scroll reveal: adds opacity + slide when section enters view.
 */
export default function Reveal({ children, className = "", delayClass = "" }) {
  const [ref, visible] = useInViewOnce();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${delayClass} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
