"use client";

import { useRef } from "react";
import Image from "next/image";
import { Container, Button } from "@/components/ui";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useGSAP } from "@/hooks";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("hero");

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animate image reveal
      tl.fromTo(
        imageRef.current,
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.2 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.4, ease: "power4.inOut" }
      );

      // Animate content elements
      const contentElements = contentRef.current?.querySelectorAll("[data-animate]");
      if (contentElements) {
        tl.fromTo(
          contentElements,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
          "-=0.8"
        );
      }

      // Parallax effect on scroll
      gsap.to(imageRef.current, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-white -z-10" />

      <Container size="xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div ref={contentRef} className="order-2 lg:order-1">
            <p
              data-animate
              className="text-secondary text-sm font-medium tracking-widest uppercase mb-4"
            >
              {t("tagline")}
            </p>

            <h1
              data-animate
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading text-primary leading-[1.1] mb-6"
            >
              {t("title")}{" "}
              <span className="text-secondary">{t("titleHighlight")}</span>
            </h1>

            <p
              data-animate
              className="text-lg text-primary/70 leading-relaxed max-w-lg mb-8"
            >
              {t("description")}
            </p>

            <div data-animate className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses">
                <Button size="lg">{t("exploreCourses")}</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  {t("meetEducator")}
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div data-animate className="flex items-center gap-8 mt-12 pt-8 border-t border-primary/10">
              <div>
                <p className="text-3xl font-heading text-primary">500+</p>
                <p className="text-sm text-primary/60">{t("studentsCertified")}</p>
              </div>
              <div>
                <p className="text-3xl font-heading text-primary">10+</p>
                <p className="text-sm text-primary/60">{t("yearsExperience")}</p>
              </div>
              <div>
                <p className="text-3xl font-heading text-primary">98%</p>
                <p className="text-sm text-primary/60">{t("successRate")}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div
              ref={imageRef}
              className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden"
            >
              <Image
                src="/images/hero-nikolina.jpg"
                alt="Nikolina Kljaić - Brendia Pro® Educator"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-secondary/30" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-cream -z-10" />
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-primary/40 uppercase tracking-widest">{t("scroll")}</span>
          <svg
            className="w-5 h-5 text-primary/40"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
