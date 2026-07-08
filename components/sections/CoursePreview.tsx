"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container, Button } from "@/components/ui";
import { useGSAP } from "@/hooks";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CoursePreview() {
  const t = useTranslations("coursePreview");
  const sectionRef = useRef<HTMLElement>(null);

  const courses = [
    {
      slug: "foundation-certification",
      title: t("foundation.title"),
      subtitle: t("foundation.subtitle"),
      price: t("foundation.price"),
      description: t("foundation.description"),
      features: t.raw("foundation.features") as string[],
      popular: false,
    },
    {
      slug: "master-certification",
      title: t("master.title"),
      subtitle: t("master.subtitle"),
      price: t("master.price"),
      description: t("master.description"),
      features: t.raw("master.features") as string[],
      popular: true,
    },
    {
      slug: "brendia-pro-artist-1v1",
      title: t("artist1v1.title"),
      subtitle: t("artist1v1.subtitle"),
      price: t("artist1v1.price"),
      description: t("artist1v1.description"),
      features: t.raw("artist1v1.features") as string[],
      popular: false,
    },
    {
      slug: "brendia-pro-master-1v1",
      title: t("master1v1.title"),
      subtitle: t("master1v1.subtitle"),
      price: t("master1v1.price"),
      description: t("master1v1.description"),
      features: t.raw("master1v1.features") as string[],
      popular: false,
    },
  ];

  useGSAP(
    () => {
      // Animate heading
      gsap.fromTo(
        "[data-heading]",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );

      // Animate course cards
      gsap.fromTo(
        "[data-course]",
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-courses]",
            start: "top 80%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-cream">
      <Container>
        {/* Section heading */}
        <div data-heading className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
            {t("tagline")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-primary mb-6">
            {t("title")}
          </h2>
          <p className="text-lg text-primary/60 leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Course cards */}
        <div
          data-courses
          className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto"
        >
          {courses.map((course, index) => (
            <div
              key={index}
              data-course
              className={`relative bg-white p-8 lg:p-10 ${
                course.popular ? "ring-2 ring-secondary" : ""
              }`}
            >
              {/* Popular badge */}
              {course.popular && (
                <div className="absolute -top-4 left-8 bg-secondary text-white px-4 py-1 text-xs font-medium tracking-wider uppercase">
                  {t("mostPopular")}
                </div>
              )}

              {/* Course header */}
              <div className="mb-8">
                <p className="text-secondary text-sm font-medium mb-2">
                  {course.subtitle}
                </p>
                <h3 className="text-2xl lg:text-3xl font-heading text-primary mb-4">
                  {course.title}
                </h3>
                <p className="text-primary/60 leading-relaxed mb-6">
                  {course.description}
                </p>
                <p className="text-4xl font-heading text-primary">
                  {course.price}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {course.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5"
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
                    <span className="text-primary/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={`/courses/${course.slug}`} className="block">
                <Button
                  variant={course.popular ? "primary" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {t("learnMore")}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <p
          data-heading
          className="text-center text-primary/50 text-sm mt-12"
        >
          {t("additionalInfo")}
        </p>
      </Container>
    </section>
  );
}
