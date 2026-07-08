"use client";

import { useRef } from "react";
import { Container, Button } from "@/components/ui";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useGSAP } from "@/hooks";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations("cta");

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-animate]",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 bg-primary text-white relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p
            data-animate
            className="text-secondary text-sm font-medium tracking-widest uppercase mb-4"
          >
            {t("tagline")}
          </p>

          <h2
            data-animate
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading mb-6"
          >
            {t("title")}
          </h2>

          <p
            data-animate
            className="text-lg text-white/70 leading-relaxed mb-10"
          >
            {t("description")}
          </p>

          <div
            data-animate
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/courses">
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[200px]"
              >
                {t("viewCourses")}
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 min-w-[200px]"
              >
                {t("contactUs")}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            data-animate
            className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-sm text-white/50"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("lifetimeAccess")}
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("officialCertification")}
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("paymentPlans")}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
