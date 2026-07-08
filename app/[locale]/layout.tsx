import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages();
  const metadata = messages.metadata as Record<string, string>;

  const isHr = locale === "hr";

  return {
    title: {
      default: metadata?.title || "Brendia Pro® | Premium Weft Extensions Education",
      template: metadata?.titleTemplate || "%s | Brendia Pro®",
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/favicon-32x32.png",
    },
    description: metadata?.description || "",
    keywords: isHr
      ? [
          "weft ekstenzije",
          "ekstenzije kose",
          "edukacija za kosu",
          "certifikacijski tečajevi",
          "Nikolina Kljaić",
          "Brendia Pro®",
          "profesionalna edukacija za frizerstvo",
        ]
      : [
          "weft extensions",
          "hair extensions",
          "hair education",
          "certification courses",
          "Nikolina Kljaić",
          "Brendia Pro®",
          "professional hair training",
        ],
    authors: [{ name: "Nikolina Kljaić" }],
    creator: "Brendia Pro®",
    openGraph: {
      type: "website",
      locale: isHr ? "hr_HR" : "en_US",
      url: "https://brendiapro.hr",
      siteName: "Brendia Pro®",
      title: metadata?.title || "Brendia Pro® | Premium Weft Extensions Education",
      description: metadata?.description || "",
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Brendia Pro® - Premium Weft Extensions Education",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata?.title || "Brendia Pro® | Premium Weft Extensions Education",
      description: metadata?.description || "",
      images: ["/images/og-image.jpg"],
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://brendiapro.hr"
    ),
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        hr: "/hr",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as "hr" | "en")) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
