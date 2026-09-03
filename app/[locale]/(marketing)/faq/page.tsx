"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Container,
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui";
import { FAQSchema } from "@/components/shared";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  faqs: FAQ[];
}

export default function FAQPage() {
  const t = useTranslations("faqPage");

  const categoryKeys = ["aboutCourses", "certification", "enrollment", "access"] as const;

  const faqCategories: FAQCategory[] = categoryKeys.map((key) => ({
    title: t(`categories.${key}.title`),
    faqs: t.raw(`categories.${key}.faqs`) as FAQ[],
  }));

  // Flatten all FAQs for structured data
  const allFaqs = faqCategories.flatMap((category) => category.faqs);

  return (
    <>
      <FAQSchema faqs={allFaqs} />
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
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
        </Container>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto space-y-16">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-heading text-primary mb-6 pb-4 border-b border-primary/10">
                  {category.title}
                </h2>
                <Accordion allowMultiple>
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                    >
                      <AccordionTrigger value={`${categoryIndex}-${faqIndex}`}>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent
                        value={`${categoryIndex}-${faqIndex}`}
                        className="whitespace-pre-line"
                      >
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 md:py-32 bg-cream">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-heading text-primary mb-4">
              {t("stillHaveQuestions.title")}
            </h2>
            <p className="text-primary/60 mb-8">
              {t("stillHaveQuestions.description")}
            </p>
            <Link href="/contact">
              <Button size="lg">{t("stillHaveQuestions.cta")}</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
