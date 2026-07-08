"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Container } from "@/components/ui";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("navigation");

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("courses"), href: "/courses" },
    { name: t("about"), href: "/about" },
    { name: t("faq"), href: "/faq" },
    { name: t("contact"), href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm py-4"
            : "bg-transparent py-6"
        )}
      >
        <Container>
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative h-10 w-32">
              <Image
                src="/images/logo.png"
                alt="Brendia Pro®"
                fill
                className="object-contain object-left"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-primary/80 hover:text-primary transition-colors duration-200 link-underline"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right side: Language Switcher + CTA */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/courses"
                className="bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
              >
                {t("enrollNow")}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary"
              aria-label={t("toggleMenu")}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[80%] max-w-sm bg-cream shadow-xl transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full p-8 pt-24">
            {/* Language Switcher in mobile */}
            <div className="mb-6">
              <LanguageSwitcher />
            </div>

            <nav className="flex-1">
              <ul className="space-y-6">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-2xl font-heading text-primary hover:text-secondary transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href="/courses"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-primary text-white text-center py-4 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t("enrollNow")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
