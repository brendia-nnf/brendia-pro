"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Container, Button } from "@/components/ui";

function CheckoutSuccessContent() {
  const t = useTranslations("checkout.success");
  const searchParams = useSearchParams();

  // Monri returns order_number instead of session_id
  const orderNumber = searchParams.get("order_number");
  // Legacy support for Stripe session_id (can be removed after full migration)
  const sessionId = searchParams.get("session_id");

  // Display reference - prefer order_number, fallback to session_id
  const displayReference = orderNumber || (sessionId ? sessionId.slice(0, 20) + "..." : null);
  // Predračun (bank-transfer) orders get different copy: the customer has
  // NOT paid yet — they received payment instructions by email.
  const isPredracun = searchParams.get("predracun") === "1";

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
          <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <div className="bg-white p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-8 bg-secondary text-white rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10"
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
              </div>

              <h1 className="text-3xl sm:text-4xl font-heading text-primary mb-4">
                {isPredracun ? t("predracun.title") : t("title")}
              </h1>

              <p className="text-lg text-primary/70 leading-relaxed mb-8">
                {isPredracun ? t("predracun.description") : t("description")}
              </p>

              {/* Divider */}
              <div className="w-16 h-px bg-secondary mx-auto mb-8" />

              {/* What's Next */}
              <div className="text-left mb-8">
                <h2 className="text-xl font-heading text-primary mb-6 text-center">
                  {t("whatHappensNext")}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary text-white text-sm flex items-center justify-center font-medium">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-primary mb-1">
                        {isPredracun
                          ? t("predracun.steps.payInvoice.title")
                          : t("steps.checkEmail.title")}
                      </p>
                      <p className="text-sm text-primary/60">
                        {isPredracun
                          ? t("predracun.steps.payInvoice.description")
                          : t("steps.checkEmail.description")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary text-white text-sm flex items-center justify-center font-medium">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-primary mb-1">
                        {isPredracun
                          ? t("predracun.steps.activation.title")
                          : t("steps.accessCourse.title")}
                      </p>
                      <p className="text-sm text-primary/60">
                        {isPredracun
                          ? t("predracun.steps.activation.description")
                          : t("steps.accessCourse.description")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary text-white text-sm flex items-center justify-center font-medium">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-primary mb-1">
                        {t("steps.joinCommunity.title")}
                      </p>
                      <p className="text-sm text-primary/60">
                        {t("steps.joinCommunity.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Reference */}
              {displayReference && (
                <div className="bg-cream p-4 mb-8">
                  <p className="text-xs text-primary/50 mb-1">{t("orderReference")}</p>
                  <p className="text-sm font-mono text-primary/70">
                    {displayReference}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/">
                  <Button size="lg">{t("returnHome")}</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    {t("needHelp")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Support Note */}
            <p className="text-center text-sm text-primary/50 mt-8">
              {t("supportNote")}{" "}
              <a
                href="mailto:info@brendiapro.hr"
                className="text-secondary hover:underline"
              >
                info@brendiapro.hr
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
