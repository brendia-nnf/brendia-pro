"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container, Button } from "@/components/ui";
import { useGSAP } from "@/hooks";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AboutFounder() {
  const t = useTranslations("aboutFounder");
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Animate image reveal
      gsap.fromTo(
        imageRef.current,
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power4.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

      // Animate content
      gsap.fromTo(
        "[data-content] > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-white overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div ref={imageRef} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/nikolina-about.jpg"
                alt={t("imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border border-secondary/20 -z-10" />
          </div>

          {/* Content */}
          <div data-content>
            <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
              {t("tagline")}
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-primary mb-6">
              {t("name")}
            </h2>

            <p className="text-lg text-primary/70 leading-relaxed mb-6">
              {t("bio1")}
            </p>

            <p className="text-primary/70 leading-relaxed mb-8">
              &ldquo;{t("quote")}&rdquo;
            </p>

            {/* Credentials */}
            <div className="grid grid-cols-2 gap-6 mb-8 py-6 border-y border-primary/10">
              <div>
                <p className="text-2xl font-heading text-secondary">10+</p>
                <p className="text-sm text-primary/60">{t("yearsInIndustry")}</p>
              </div>
              <div>
                <p className="text-2xl font-heading text-secondary">500+</p>
                <p className="text-sm text-primary/60">{t("studentsTrained")}</p>
              </div>
            </div>

            <Link href="/about">
              <Button variant="outline" size="lg">
                {t("readFullStory")}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
