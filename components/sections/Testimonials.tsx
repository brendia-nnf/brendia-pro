"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui";
import { useGSAP } from "@/hooks";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export function Testimonials() {
  const t = useTranslations("testimonials");
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = t.raw("items") as Testimonial[];
  const testimonialImages = [
    "/images/testimonials/sarah.jpg",
    "/images/testimonials/emma.jpg",
    "/images/testimonials/jessica.jpg",
  ];

  useGSAP(
    () => {
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

      gsap.fromTo(
        "[data-testimonial]",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-testimonial]",
            start: "top 80%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-cream">
      <Container>
        {/* Section heading */}
        <div data-heading className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
            {t("tagline")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-primary">
            {t("title")}
          </h2>
        </div>

        {/* Testimonial carousel */}
        <div data-testimonial className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 lg:p-16 relative">
            {/* Quote icon */}
            <svg
              className="absolute top-8 left-8 w-12 h-12 text-secondary/20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            {/* Testimonial content */}
            <div className="relative">
              <blockquote className="text-xl md:text-2xl font-heading text-primary leading-relaxed mb-8 pl-8 md:pl-12">
                &ldquo;{testimonials[activeIndex].quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4 pl-8 md:pl-12">
                <div className="w-14 h-14 rounded-full bg-cream overflow-hidden relative">
                  <Image
                    src={testimonialImages[activeIndex]}
                    alt={testimonials[activeIndex].author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {testimonials[activeIndex].author}
                  </p>
                  <p className="text-sm text-primary/60">
                    {testimonials[activeIndex].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-primary/10">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === activeIndex ? "bg-secondary" : "bg-primary/20"
                    }`}
                    aria-label={t("goToTestimonial", { number: index + 1 })}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prevTestimonial}
                  className="w-12 h-12 flex items-center justify-center border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label={t("prevTestimonial")}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-12 h-12 flex items-center justify-center border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label={t("nextTestimonial")}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
