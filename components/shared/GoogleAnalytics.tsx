"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

const GA_MEASUREMENT_ID = "G-3JNDP3XM2J";

// Loads gtag.js only after the user accepts analytics cookies in the
// CookieBanner — either on a previous visit or live via the consent event.
export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (hasAnalyticsConsent()) setEnabled(true);

    const onConsent = () => {
      if (hasAnalyticsConsent()) setEnabled(true);
    };
    window.addEventListener("brendia:cookie-consent", onConsent);
    return () => window.removeEventListener("brendia:cookie-consent", onConsent);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
