"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { use } from "react";
import {
  Container,
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui";
import { CourseSchema, BreadcrumbSchema } from "@/components/shared";

interface CurriculumModule {
  module: string;
  lessons: string[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CoursePage({ params }: PageProps) {
  const { slug } = use(params);
  const t = useTranslations("courseDetail");
  const tNav = useTranslations("navigation");

  const validSlugs = ["foundation-certification", "master-certification"];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const courseKey = slug === "foundation-certification" ? "foundation" : "master";
  const isPopular = courseKey === "master";
  const requiresCertification = courseKey === "master";

  const course = {
    title: t(`${courseKey}.title`),
    subtitle: t(`${courseKey}.subtitle`),
    price: t(`${courseKey}.price`),
    duration: t(`${courseKey}.duration`),
    description: t(`${courseKey}.description`),
    longDescription: t(`${courseKey}.longDescription`),
    image: `/images/courses/${courseKey === "foundation" ? "foundation" : "master"}.jpg`,
    features: t.raw(`${courseKey}.features`) as string[],
    curriculum: t.raw(`${courseKey}.curriculum`) as CurriculumModule[],
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brendiapro.hr";

  return (
    <>
      <CourseSchema
        name={course.title}
        description={course.description}
        price={course.price}
        url={`${baseUrl}/courses/${slug}`}
        duration={course.duration}
      />
      <BreadcrumbSchema
        items={[
          { name: tNav("home"), url: baseUrl },
          { name: tNav("courses"), url: `${baseUrl}/courses` },
          { name: course.title, url: `${baseUrl}/courses/${slug}` },
        ]}
      />
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-primary/60 hover:text-primary mb-6 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {t("backToCourses")}
              </Link>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isPopular && (
                  <span className="inline-block bg-secondary text-white px-4 py-1 text-xs font-medium tracking-wider uppercase">
                    {t("mostPopular")}
                  </span>
                )}
                {requiresCertification && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/90 text-white px-4 py-1 text-xs font-medium tracking-wider uppercase">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    {t("prerequisiteBadge")}
                  </span>
                )}
              </div>

              <p className="text-secondary text-sm font-medium mb-2">
                {course.subtitle}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-primary mb-6">
                {course.title}
              </h1>
              <p className="text-lg text-primary/70 leading-relaxed mb-4">
                {course.longDescription}
              </p>
              <p className="text-sm text-primary/50 mb-8">{course.duration}</p>

              <div className="flex items-end gap-6 mb-2">
                <p className="text-5xl font-heading text-primary">{course.price}</p>
                <p className="text-primary/50 pb-2">{t("exclVat")}</p>
              </div>
              <p className="text-sm text-primary/40 mb-8">
                {t("vatNote")}
              </p>

              {requiresCertification && (
                <div className="flex items-start gap-3 mb-6 p-4 bg-secondary/5 border border-secondary/20 max-w-xl">
                  <svg className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-sm text-primary/70 leading-relaxed">
                    {t("prerequisiteNote")}
                  </p>
                </div>
              )}

              <Link href={`/checkout/${slug}`}>
                <Button size="lg" className="min-w-[200px]">
                  {t("enrollNow")}
                </Button>
              </Link>
            </div>

            <div className="relative aspect-[4/3] lg:aspect-square">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading text-primary mb-8 text-center">
              {t("whatsIncluded")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {course.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-cream"
                >
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
                  <span className="text-primary/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Curriculum */}
      <section className="py-20 md:py-32 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading text-primary mb-4 text-center">
              {t("curriculum.title")}
            </h2>
            <p className="text-primary/60 text-center mb-12">
              {t("curriculum.description")}
            </p>

            <Accordion allowMultiple defaultOpen={["0"]}>
              {course.curriculum.map((module, index) => (
                <AccordionItem key={index} value={String(index)}>
                  <AccordionTrigger value={String(index)}>
                    <span className="text-lg font-heading">{module.module}</span>
                  </AccordionTrigger>
                  <AccordionContent value={String(index)}>
                    <ul className="space-y-2 pl-4">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <li
                          key={lessonIndex}
                          className="flex items-center gap-3"
                        >
                          <svg
                            className="w-4 h-4 text-secondary flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-primary text-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-white/70 mb-8">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/checkout/${slug}`}>
                <Button variant="secondary" size="lg">
                  {t("cta.enrollIn", { course: course.title })}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10"
                >
                  {t("cta.haveQuestions")}
                </Button>
              </Link>
            </div>
            <p className="text-white/40 text-sm mt-8">
              {t("cta.paymentPlans")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
