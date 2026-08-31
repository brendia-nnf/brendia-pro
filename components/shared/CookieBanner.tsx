"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  getCookieConsent,
  setCookieConsent,
  type ConsentLevel,
} from "@/lib/cookie-consent";

export function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show when no choice has been stored yet
    if (!getCookieConsent()) {
      setIsVisible(true);
    }

    // Allow the cookie policy page to re-open the banner
    const reopen = () => setIsVisible(true);
    window.addEventListener("brendia:open-cookie-banner", reopen);
    return () =>
      window.removeEventListener("brendia:open-cookie-banner", reopen);
  }, []);

  const choose = (level: ConsentLevel) => {
    setCookieConsent(level);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-6"
    >
      <div className="max-w-3xl mx-auto bg-white border border-primary/10 shadow-2xl rounded-xl p-5 sm:p-6">
        <p className="font-medium text-primary mb-1">{t("title")}</p>
        <p className="text-sm text-primary/70 leading-relaxed">
          {t("description")}{" "}
          <Link
            href="/legal/cookies"
            className="underline hover:text-primary transition-colors"
          >
            {t("policyLink")}
          </Link>
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => choose("all")}
            className="bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t("acceptAll")}
          </button>
          <button
            onClick={() => choose("necessary")}
            className="border border-primary/20 text-primary px-6 py-2.5 text-sm font-medium hover:bg-primary/5 transition-colors"
          >
            {t("necessaryOnly")}
          </button>
        </div>
      </div>
    </div>
  );
}
