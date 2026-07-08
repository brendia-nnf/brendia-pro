"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface GSAPProviderProps {
  children: ReactNode;
}

export function GSAPProvider({ children }: GSAPProviderProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Set default GSAP config
    gsap.config({
      nullTargetWarn: false,
    });

    // Set default ScrollTrigger config
    ScrollTrigger.defaults({
      markers: process.env.NODE_ENV === "development" ? false : false,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
