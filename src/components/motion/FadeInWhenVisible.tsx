"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function FadeInWhenVisible({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    // Safety net: if the scroll-trigger never fires for any reason —
    // an unusual mobile browser, an in-app browser wrapper, a viewport
    // quirk — force the content visible after a short delay so it can
    // never be permanently stuck invisible.
    const timeout = setTimeout(() => setForceShow(true), 1200);
    return () => clearTimeout(timeout);
  }, []);

  const visible = isInView || forceShow || shouldReduceMotion;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: shouldReduceMotion ? 0 : y }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}