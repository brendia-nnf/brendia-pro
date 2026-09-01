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

    // Positions can be stale after a locale-switch remount — recompute them.
    ScrollTrigger.refresh();

    // No kill-all cleanup here: on locale change this layout remounts, and
    // React runs this (passive) cleanup AFTER the new sections' layout
    // effects have already created their ScrollTriggers — a kill-all would
    // destroy the fresh triggers and leave every [data-animate] element
    // stuck at opacity 0. Each section reverts its own gsap.context.
  }, []);

  return <>{children}</>;
}
