"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container, Button } from "@/components/ui";
import { useGSAP } from "@/hooks";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CoursesPage() {
  const t = useTranslations("coursesPage");
  const heroRef = useRef<HTMLElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const courses = [
    {
      slug: "foundation-certification",
      title: t("courses.foundation.title"),
      subtitle: t("courses.foundation.subtitle"),
      price: t("courses.foundation.price"),
      duration: t("courses.foundation.duration"),
      image: "/images/courses/foundation.jpg",
      description: t("courses.foundation.description"),
      features: t.raw("courses.foundation.features") as string[],
      popular: false,
      requiresCertification: false,
    },
    {
      slug: "master-certification",
      title: t("courses.master.title"),
      subtitle: t("courses.master.subtitle"),
      price: t("courses.master.price"),
      duration: t("courses.master.duration"),
      image: "/images/courses/master.jpg",
      description: t("courses.master.description"),
      features: t.raw("courses.master.features") as string[],
      popular: true,
      requiresCertification: true,
    },
    {
      slug: "brendia-pro-artist-1v1",
      title: t("courses.artist1v1.title"),
      subtitle: t("courses.artist1v1.subtitle"),
      price: t("courses.artist1v1.price"),
      duration: t("courses.artist1v1.duration"),
      image: "/images/courses/foundation.jpg",
      description: t("courses.artist1v1.description"),
      features: t.raw("courses.artist1v1.features") as string[],
      popular: false,
      requiresCertification: false,
    },
    {
      slug: "brendia-pro-master-1v1",
      title: t("courses.master1v1.title"),
      subtitle: t("courses.master1v1.subtitle"),
      price: t("courses.master1v1.price"),
      duration: t("courses.master1v1.duration"),
      image: "/images/courses/master.jpg",
      description: t("courses.master1v1.description"),
      features: t.raw("courses.master1v1.features") as string[],
      popular: false,
      requiresCertification: false,
    },
  ];

  const skills = [
    {
      key: "installation",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
    {
      key: "colorMatching",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
        </svg>
      ),
    },
    {
      key: "consultation",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
    },
    {
      key: "maintenance",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
    },
    {
      key: "business",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    {
      key: "certification",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
  ];

  const comparisonRows = [
    "videoLessons",
    "installation",
    "colorMatching",
    "business",
    "community",
    "mentorship",
    "certification",
    "updates",
  ] as const;

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-animate]",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: heroRef }
  );

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p data-animate className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
              {t("hero.tagline")}
            </p>
            <h1 data-animate className="text-4xl sm:text-5xl lg:text-6xl font-heading text-primary mb-6">
              {t("hero.title")}
            </h1>
            <p data-animate className="text-lg text-primary/70 leading-relaxed mb-8">
              {t("hero.description")}
            </p>
            <div data-animate className="flex items-center justify-center gap-6 text-sm text-primary/50">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t("hero.selfPaced")}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t("hero.lifetimeAccess")}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t("hero.officialCertification")}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Video Introduction */}
      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading text-primary mb-4">
                {t("video.title")}
              </h2>
              <p className="text-primary/60">
                {t("video.description")}
              </p>
            </div>

            <div className="relative aspect-video bg-primary/5 overflow-hidden group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="/images/video-poster.jpg"
                playsInline
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
              >
                <source src="/videos/courses-intro.mp4" type="video/mp4" />
              </video>

              <button
                onClick={handleVideoPlay}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  isVideoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                }`}
                aria-label={isVideoPlaying ? t("video.pause") : t("video.play")}
              >
                <div className="w-20 h-20 bg-white/95 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {isVideoPlaying ? (
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* What You'll Master */}
      <section className="py-20 md:py-32 bg-cream">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-4">
              {t("skills.title")}
            </h2>
            <p className="text-primary/60 max-w-2xl mx-auto">
              {t("skills.description")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill) => (
              <div key={skill.key} className="bg-white p-8 group hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 flex items-center justify-center bg-secondary/10 text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                  {skill.icon}
                </div>
                <h3 className="text-xl font-heading text-primary mb-2">
                  {t(`skills.items.${skill.key}.title`)}
                </h3>
                <p className="text-primary/60">
                  {t(`skills.items.${skill.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Course Cards */}
      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-4">
              {t("courses.title")}
            </h2>
            <p className="text-primary/60">
              {t("courses.description")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {courses.map((course) => (
              <div
                key={course.slug}
                className={`relative bg-cream overflow-hidden ${
                  course.popular ? "ring-2 ring-secondary" : ""
                }`}
              >
                {course.popular && (
                  <div className="absolute top-0 right-0 bg-secondary text-white px-4 py-1 text-xs font-medium tracking-wider uppercase z-10">
                    {t("courses.mostPopular")}
                  </div>
                )}

                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  {course.requiresCertification && (
                    <div className="absolute top-0 left-0 bg-primary/90 text-white px-3 py-1 text-xs font-medium tracking-wider uppercase z-10 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      {t("courses.prerequisiteBadge")}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-6">
                    <p className="text-white/80 text-sm">{course.subtitle}</p>
                    <h3 className="text-2xl font-heading text-white">{course.title}</h3>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-primary/70 mb-6">{course.description}</p>

                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-4xl font-heading text-primary">{course.price}</p>
                      <p className="text-sm text-primary/50">{course.duration}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {course.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-primary/70 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {course.requiresCertification && (
                    <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-secondary/5 border border-secondary/20">
                      <svg className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <p className="text-xs text-primary/70 leading-relaxed">{t("courses.prerequisiteNote")}</p>
                    </div>
                  )}

                  <Link href={`/courses/${course.slug}`} className="block">
                    <Button
                      variant={course.popular ? "primary" : "outline"}
                      className="w-full"
                      size="lg"
                    >
                      {t("courses.viewCurriculum")}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="py-20 md:py-32 bg-cream">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-4">
              {t("comparison.title")}
            </h2>
            <p className="text-primary/60">
              {t("comparison.description")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left p-4 font-heading text-primary">{t("comparison.feature")}</th>
                  <th className="text-center p-4 font-heading text-primary">{t("comparison.foundation")}</th>
                  <th className="text-center p-4 font-heading text-primary bg-secondary/5">
                    {t("comparison.master")}
                    <span className="block text-xs font-normal text-secondary">{t("comparison.recommended")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr key={index} className="border-b border-primary/5">
                    <td className="p-4 text-primary/70">{t(`comparison.rows.${row}.feature`)}</td>
                    <td className="p-4 text-center text-primary/70">{t(`comparison.rows.${row}.foundation`)}</td>
                    <td className="p-4 text-center text-primary bg-secondary/5 font-medium">{t(`comparison.rows.${row}.master`)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="p-4"></td>
                  <td className="p-4 text-center">
                    <p className="text-2xl font-heading text-primary mb-2">€3,000</p>
                    <Link href="/courses/foundation-certification">
                      <Button variant="outline" size="sm">{t("comparison.select")}</Button>
                    </Link>
                  </td>
                  <td className="p-4 text-center bg-secondary/5">
                    <p className="text-2xl font-heading text-primary mb-2">€4,000</p>
                    <Link href="/courses/master-certification">
                      <Button size="sm">{t("comparison.select")}</Button>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Meet Your Instructor */}
      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/instructor.jpg"
                alt={t("instructor.imageAlt")}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
                {t("instructor.tagline")}
              </p>
              <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-6">
                {t("instructor.title")}
              </h2>
              <p className="text-primary/70 leading-relaxed mb-6">
                {t("instructor.description")}
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-3xl font-heading text-secondary">10+</p>
                  <p className="text-sm text-primary/50">{t("instructor.yearsExperience")}</p>
                </div>
                <div>
                  <p className="text-3xl font-heading text-secondary">500+</p>
                  <p className="text-sm text-primary/50">{t("instructor.studentsTrained")}</p>
                </div>
                <div>
                  <p className="text-3xl font-heading text-secondary">30+</p>
                  <p className="text-sm text-primary/50">{t("instructor.countries")}</p>
                </div>
              </div>
              <Link href="/about">
                <Button variant="outline">{t("instructor.learnMore")}</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust & Guarantee */}
      <section className="py-20 md:py-32 bg-primary text-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-heading mb-4">
                {t("trust.title")}
              </h2>
              <p className="text-white/60">
                {t("trust.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading mb-2">{t("trust.guarantee.title")}</h3>
                <p className="text-white/50 text-sm">
                  {t("trust.guarantee.description")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading mb-2">{t("trust.lifetime.title")}</h3>
                <p className="text-white/50 text-sm">
                  {t("trust.lifetime.description")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading mb-2">{t("trust.payment.title")}</h3>
                <p className="text-white/50 text-sm">
                  {t("trust.payment.description")}
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  {t("trust.cta")}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 md:py-32 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-heading text-primary mb-6">
              {t("faqPreview.title")}
            </h2>
            <p className="text-primary/70 mb-8">
              {t("faqPreview.description")}
            </p>
            <Link href="/faq">
              <Button variant="outline">{t("faqPreview.cta")}</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
