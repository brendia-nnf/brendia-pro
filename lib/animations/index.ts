import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Animation presets for consistent animations across the site
export const animationPresets = {
  fadeUp: {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    duration: 1,
    ease: "power3.out",
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    duration: 0.8,
    ease: "power2.out",
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    duration: 0.8,
    ease: "power2.out",
  },
  slideLeft: {
    initial: { x: 60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    duration: 1,
    ease: "power3.out",
  },
  slideRight: {
    initial: { x: -60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    duration: 1,
    ease: "power3.out",
  },
  clipReveal: {
    initial: { clipPath: "inset(100% 0% 0% 0%)" },
    animate: { clipPath: "inset(0% 0% 0% 0%)" },
    duration: 1.2,
    ease: "power4.inOut",
  },
};

// Creates a scroll-triggered animation
export function createScrollAnimation(
  element: Element | string,
  animationType: keyof typeof animationPresets,
  triggerOptions: ScrollTrigger.Vars = {}
) {
  const preset = animationPresets[animationType];

  return gsap.fromTo(element, preset.initial, {
    ...preset.animate,
    duration: preset.duration,
    ease: preset.ease,
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      end: "top 20%",
      toggleActions: "play none none reverse",
      ...triggerOptions,
    },
  });
}

// Creates staggered animations for multiple elements
export function createStaggerAnimation(
  elements: Element[] | NodeListOf<Element> | string,
  animationType: keyof typeof animationPresets,
  stagger: number = 0.1,
  triggerElement?: Element | string
) {
  const preset = animationPresets[animationType];

  return gsap.fromTo(elements, preset.initial, {
    ...preset.animate,
    duration: preset.duration,
    ease: preset.ease,
    stagger,
    scrollTrigger: {
      trigger: triggerElement || elements,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  });
}

// Hero text animation with split words
export function animateHeroText(element: Element) {
  const text = element.textContent || "";
  const words = text.split(" ");

  element.innerHTML = words
    .map(
      (word) =>
        `<span class="inline-block overflow-hidden"><span class="inline-block transform translate-y-full" data-word>${word}</span></span>`
    )
    .join(" ");

  const wordSpans = element.querySelectorAll("[data-word]");

  return gsap.to(wordSpans, {
    y: 0,
    duration: 1,
    stagger: 0.05,
    ease: "power4.out",
    delay: 0.3,
  });
}

// Counter animation for stats
export function animateCounter(
  element: Element,
  endValue: number,
  duration: number = 2,
  suffix: string = ""
) {
  const obj = { value: 0 };

  return gsap.to(obj, {
    value: endValue,
    duration,
    ease: "power2.out",
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    onUpdate: () => {
      element.textContent = `${Math.round(obj.value)}${suffix}`;
    },
  });
}

// Image reveal animation with clip-path
export function animateImageReveal(element: Element) {
  return gsap.fromTo(
    element,
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.4,
      ease: "power4.inOut",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    }
  );
}

// Parallax effect for images
export function createParallaxEffect(
  element: Element,
  speed: number = 0.3
) {
  return gsap.to(element, {
    yPercent: -100 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}
