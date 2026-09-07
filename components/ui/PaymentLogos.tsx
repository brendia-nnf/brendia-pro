"use client";

import Image from "next/image";
import { ACCEPTED_CARDS } from "@/lib/constants/company";

interface PaymentLogosProps {
  variant?: "light" | "dark";
  showSecurityLogos?: boolean;
  showAcceptedCardsText?: boolean;
  className?: string;
}

// Poveznice na kartične sheme (samo kartice koje Stripe Checkout prihvaća)
const CARD_LOGOS = [
  {
    name: "Mastercard",
    href: "https://www.mastercard.com",
    src: "/images/payments/mastercard.png",
    width: 50,
    height: 40,
  },
  {
    name: "Visa",
    href: "https://www.visaeurope.com",
    src: "/images/payments/visa.jpg",
    width: 60,
    height: 38,
  },
  {
    name: "Diners",
    href: "https://www.dinersclub.com",
    src: "/images/payments/diners.gif",
    width: 92,
    height: 24,
  },
  {
    name: "Discover",
    href: "https://www.discover.com/",
    src: "/images/payments/discover.png",
    width: 50,
    height: 32,
  },
  {
    name: "American Express",
    href: "https://www.americanexpress.com/",
    src: "/images/payments/amex.jpg",
    width: 40,
    height: 32,
  },
];

export function PaymentLogos({
  variant = "light",
  showSecurityLogos = true,
  showAcceptedCardsText = true,
  className = "",
}: PaymentLogosProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Acceptance Marks — na bijeloj podlozi radi vidljivosti */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {CARD_LOGOS.map((card) => (
          <a
            key={card.name}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-md px-2.5 py-1.5 border border-primary/10 shadow-sm hover:shadow transition-shadow"
            aria-label={card.name}
          >
            <Image
              src={card.src}
              alt={card.name}
              width={card.width}
              height={card.height}
              className="h-6 w-auto object-contain"
            />
          </a>
        ))}
      </div>

      {showAcceptedCardsText && (
        <p
          className={`text-xs text-center ${
            variant === "dark" ? "text-white/60" : "text-primary/60"
          }`}
        >
          Plaćanje se vrši kreditnim i debitnim karticama {ACCEPTED_CARDS}.
        </p>
      )}

      {/* Security Logos */}
      {showSecurityLogos && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="bg-white rounded-md px-2.5 py-1.5 border border-primary/10 shadow-sm">
            <Image
              src="/images/payments/visa-secure.jpg"
              alt="Visa Secure"
              width={50}
              height={30}
              className="h-6 w-auto object-contain"
            />
          </span>
          <span className="bg-white rounded-md px-2.5 py-1.5 border border-primary/10 shadow-sm">
            <Image
              src="/images/payments/mc-identity-check.png"
              alt="Mastercard Identity Check"
              width={50}
              height={30}
              className="h-6 w-auto object-contain"
            />
          </span>
        </div>
      )}

      {/* Stripe Badge */}
      <div className="flex items-center justify-center">
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-md px-3 py-1.5 border border-primary/10 shadow-sm hover:shadow transition-shadow inline-flex items-center gap-1.5"
          aria-label="Stripe"
        >
          <span className="text-xs text-primary/50">Powered by</span>
          <span
            className="font-bold text-base leading-none tracking-tight"
            style={{ color: "#635BFF" }}
          >
            stripe
          </span>
        </a>
      </div>

      {/* Security Text */}
      <p
        className={`text-xs text-center ${
          variant === "dark" ? "text-white/60" : "text-primary/50"
        }`}
      >
        Sigurno plaćanje osigurava Stripe. Vaši podaci su zaštićeni SSL
        enkripcijom i 3D Secure protokolom.
      </p>
    </div>
  );
}
