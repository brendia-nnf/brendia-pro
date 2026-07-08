"use client";

import { useEffect, useRef, type RefObject, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

gsap.registerPlugin(ScrollTrigger);

interface UseGSAPOptions {
  scope?: RefObject<HTMLElement | null>;
  dependencies?: unknown[];
}

export function useGSAP(
  callback: () => void,
  options: UseGSAPOptions = {}
) {
  const { scope, dependencies = [] } = options;

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(callback, scope?.current || undefined);

    return () => ctx.revert();
  }, dependencies);
}

interface FadeUpOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  start?: string;
  end?: string;
}

export function useFadeUp(
  ref: RefObject<HTMLElement | null>,
  options: FadeUpOptions = {}
) {
  const {
    y = 60,
    duration = 1,
    delay = 0,
    stagger = 0.1,
    ease = "power3.out",
    start = "top 85%",
    end = "top 20%",
  } = options;

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const elements = ref.current.querySelectorAll("[data-animate]");
    if (elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start,
            end,
            toggleActions: "play none none reverse",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [ref, y, duration, delay, stagger, ease, start, end]);
}

interface ParallaxOptions {
  speed?: number;
  start?: string;
  end?: string;
}

export function useParallax(
  ref: RefObject<HTMLElement | null>,
  options: ParallaxOptions = {}
) {
  const { speed = 0.5, start = "top bottom", end = "bottom top" } = options;

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: -100 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [ref, speed, start, end]);
}

export function useTextSplit(ref: RefObject<HTMLElement | null>) {
  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const text = ref.current.textContent || "";
    const words = text.split(" ");

    ref.current.innerHTML = words
      .map(
        (word) =>
          `<span class="inline-block overflow-hidden"><span class="inline-block" data-word>${word}</span></span>`
      )
      .join(" ");

    const wordSpans = ref.current.querySelectorAll("[data-word]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordSpans,
        { y: "100%" },
        {
          y: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [ref]);
}

interface CounterOptions {
  start?: number;
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function useCounter(
  ref: RefObject<HTMLElement | null>,
  options: CounterOptions
) {
  const { start = 0, end, duration = 2, suffix = "", prefix = "" } = options;

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const obj = { value: start };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: end,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none reset",
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${Math.round(obj.value)}${suffix}`;
          }
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [ref, start, end, duration, suffix, prefix]);
}
