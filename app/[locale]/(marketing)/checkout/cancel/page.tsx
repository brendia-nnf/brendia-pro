"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Container, Button } from "@/components/ui";

function CheckoutCancelContent() {
  const t = useTranslations("checkout.cancel");
  const searchParams = useSearchParams();

  // Support both Monri (order_number) and legacy Stripe (course) params
  const orderNumber = searchParams.get("order_number");
  const course = searchParams.get("course");

  // For retry link, we need the course slug
  // Order number format is BP-YYMMDD-XXXX, doesn't contain course info
  // So we still rely on the course param for retry functionality
  const retryLink = course ? `/checkout/${course}` : "/courses";

  return (
    <section className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-primary/10">
        <Container>
          <div className="py-6 flex items-center justify-center">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Brendia Pro"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-16 md:py-24">
          <div className="max-w-xl mx-auto">
            {/* Cancel Card */}
            <div className="bg-white p-8 md:p-12 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 text-primary/60 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl font-heading text-primary mb-4">
                {t("title")}
              </h1>

              <p className="text-lg text-primary/70 leading-relaxed mb-4">
                {t("description")}
              </p>

              <p className="text-primary/60 mb-8">
                {t("helpText")}
              </p>

              {/* Order Reference (if available) */}
              {orderNumber && (
                <div className="bg-cream p-4 mb-8">
                  <p className="text-xs text-primary/50 mb-1">Order Reference</p>
                  <p className="text-sm font-mono text-primary/70">
                    {orderNumber}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={retryLink}>
                  <Button size="lg">
                    {course ? t("tryAgain") : t("viewCourses")}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    {t("contactSupport")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Help Links */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-sm text-primary/50">
                {t("faqLink")}{" "}
                <Link href="/faq" className="text-secondary hover:underline">
                  {t("checkFaq")}
                </Link>
              </p>
              <p className="text-sm text-primary/50">
                {t("paymentPlans")}{" "}
                <Link href="/contact" className="text-secondary hover:underline">
                  {t("contactUs")}
                </Link>{" "}
                {t("toDiscuss")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <CheckoutCancelContent />
    </Suspense>
  );
}
