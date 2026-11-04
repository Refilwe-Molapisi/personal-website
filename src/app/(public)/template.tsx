"use client";

/**
 * Route-level transition: every navigation inside the public site remounts
 * this template, so pages softly fade-rise in. Kept very short and disabled
 * under prefers-reduced-motion for comfort and accessibility.
 */
import { useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return <div className={reduce ? undefined : "anim-page"}>{children}</div>;
}
