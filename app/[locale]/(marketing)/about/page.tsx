"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container, Button } from "@/components/ui";

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface Value {
  title: string;
  description: string;
}

export default function AboutPage() {
  const t = useTranslations("aboutPage");

  const milestones = t.raw("journey.milestones") as Milestone[];
  const values = t.raw("values.items") as Value[];
  const bioParagraphs = t.raw("founder.bio") as string[];

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
                {t("hero.tagline")}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-primary mb-6">
                {t("hero.title")}
              </h1>
              <p className="text-lg text-primary/70 leading-relaxed">
                {t("hero.description")}
              </p>
            </div>
            <div className="relative aspect-square">
              <Image
                src="/images/about-hero.jpg"
                alt={t("hero.imageAlt")}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute -bottom-6 -left-6 w-full h-full border border-secondary/20 -z-10" />
            </div>
          </div>
        </Container>
      </section>

      {/* Founder Section */}
      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[3/4] lg:order-2">
              <Image
                src="/images/nikolina-portrait.jpg"
                alt={t("founder.imageAlt")}
                fill
                className="object-cover"
              />
            </div>
            <div className="lg:order-1">
              <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
                {t("founder.tagline")}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-primary mb-6">
                {t("founder.name")}
              </h2>
              <div className="space-y-4 text-primary/70 leading-relaxed">
                {bioParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-32 bg-cream">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-6">
              {t("journey.title")}
            </h2>
            <p className="text-primary/60">
              {t("journey.description")}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="relative pl-8 pb-12 last:pb-0 border-l border-secondary/30"
              >
                <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 bg-secondary rounded-full" />
                <div className="bg-white p-6">
                  <p className="text-secondary font-heading text-2xl mb-1">
                    {milestone.year}
                  </p>
                  <h3 className="text-xl font-heading text-primary mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-primary/60">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-6">
              {t("values.title")}
            </h2>
            <p className="text-primary/60">
              {t("values.description")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-cream flex items-center justify-center">
                  <span className="text-3xl font-heading text-secondary">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-heading text-primary mb-2">
                  {value.title}
                </h3>
                <p className="text-primary/60 text-sm">{value.description}</p>
              </div>
            ))}
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
              <Link href="/courses">
                <Button variant="secondary" size="lg">
                  {t("cta.exploreCourses")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10"
                >
                  {t("cta.getInTouch")}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
