"use client";

import Image from "next/image";

interface PaymentLogosProps {
  variant?: "light" | "dark";
  showSecurityLogos?: boolean;
  className?: string;
}

export function PaymentLogos({
  variant = "light",
  showSecurityLogos = true,
  className = "",
}: PaymentLogosProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Acceptance Marks */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <a
          href="https://www.visa.com"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <Image
            src="/images/payments/visa.jpg"
            alt="Visa"
            width={60}
            height={38}
            className="h-8 w-auto object-contain"
          />
        </a>
        <a
          href="https://www.mastercard.com"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <Image
            src="/images/payments/mastercard.png"
            alt="Mastercard"
            width={50}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </a>
        <a
          href="https://www.mastercard.com/maestro"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <Image
            src="/images/payments/maestro.png"
            alt="Maestro"
            width={50}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </a>
      </div>

      {/* Security Logos */}
      {showSecurityLogos && (
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Image
            src="/images/payments/visa-secure.jpg"
            alt="Visa Secure"
            width={50}
            height={30}
            className="h-6 w-auto object-contain"
          />
          <Image
            src="/images/payments/mc-identity-check.png"
            alt="Mastercard Identity Check"
            width={50}
            height={30}
            className="h-6 w-auto object-contain"
          />
        </div>
      )}

      {/* Monri Badge */}
      <div className="flex items-center justify-center">
        <a
          href="https://www.monri.com"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <Image
            src="/images/payments/monri.png"
            alt="Powered by Monri"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </a>
      </div>

      {/* Security Text */}
      <p className={`text-xs text-center ${variant === "dark" ? "text-white/60" : "text-primary/50"}`}>
        Sigurno plaćanje osigurava Monri WSPay. Vaši podaci su zaštićeni SSL enkripcijom.
      </p>
    </div>
  );
}
