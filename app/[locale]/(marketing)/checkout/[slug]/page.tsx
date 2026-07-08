"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui";
import { getCourse, calculatePricing, formatPrice } from "@/lib/constants/courses";
import { CheckoutFormFull } from "./CheckoutFormFull";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CheckoutPage({ params }: PageProps) {
  const { slug } = use(params);
  const t = useTranslations("checkout");
  const course = getCourse(slug);

  if (!course) {
    notFound();
  }

  const pricing = calculatePricing(course.price);

  return (
    <section className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-primary/10">
        <Container>
          <div className="py-6 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Brendia Pro"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <Link
              href={`/courses/${slug}`}
              className="text-sm text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
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
              {t("backToCourse")}
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12 lg:py-16">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading text-primary mb-2">
              {t("pageTitle")}
            </h1>
            <p className="text-primary/60">
              {t("pageSubtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Order Summary - Left Side */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white p-6 lg:p-8 lg:sticky lg:top-8">
                <h2 className="text-xl font-heading text-primary mb-6">
                  {t("orderSummary.title")}
                </h2>

                {/* Course Card */}
                <div className="flex gap-4 pb-6 border-b border-primary/10">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                      {course.subtitle}
                    </p>
                    <h3 className="font-heading text-primary text-lg leading-tight">
                      {course.name}
                    </h3>
                  </div>
                </div>

                {/* What's Included */}
                <div className="py-6 border-b border-primary/10">
                  <h3 className="text-sm font-medium text-primary mb-4">
                    {t("orderSummary.whatsIncluded")}
                  </h3>
                  <ul className="space-y-2">
                    {course.features.slice(0, 6).map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-primary/70"
                      >
                        <svg
                          className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5"
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
                        {feature}
                      </li>
                    ))}
                    {course.features.length > 6 && (
                      <li className="text-sm text-secondary">
                        {t("orderSummary.moreBenefits", { count: course.features.length - 6 })}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Pricing Breakdown */}
                <div className="pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary/70">{t("orderSummary.subtotal")}</span>
                    <span className="text-primary">{formatPrice(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary/70">{t("orderSummary.vat", { percentage: pricing.vatPercentage })}</span>
                    <span className="text-primary">{formatPrice(pricing.vat)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-primary/10">
                    <span className="font-medium text-primary">{t("orderSummary.total")}</span>
                    <span className="text-2xl font-heading text-primary">
                      {formatPrice(pricing.total)}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-3 text-sm text-primary/50">
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
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                    <span>{t("trustBadges.securePayment")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-primary/50 mt-2">
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
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                      />
                    </svg>
                    <span>{t("trustBadges.allCardsAccepted")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form - Right Side */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white p-6 lg:p-8">
                <CheckoutFormFull
                  courseId={course.id}
                  courseName={course.name}
                  pricing={pricing}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
