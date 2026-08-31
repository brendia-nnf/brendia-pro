"use client";

import Image from "next/image";
import { Container } from "@/components/ui";
import { ACCEPTED_CARDS } from "@/lib/constants/company";

export default function PaymentSecurityPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-heading text-primary mb-6">
              Sigurnost plaćanja
            </h1>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
            <h2>Načini plaćanja</h2>
            <p>
              Plaćanje se vrši kreditnim i debitnim karticama {ACCEPTED_CARDS}.
            </p>

            <h2>Sigurnost plaćanja kreditnim karticama</h2>
            <p>
              Tajnost Vaših podataka je zaštićena i osigurana korištenjem
              posljednje verzije TLS enkripcije. Stranice za naplatu putem
              interneta osigurane su korištenjem Secure Socket Layer (SSL)
              protokola sa 128-bitnom enkripcijom podataka. SSL enkripcija je
              postupak šifriranja podataka radi sprječavanja neovlaštenog
              pristupa prilikom njihovog prijenosa.
            </p>
            <p>
              Time je omogućen siguran prijenos informacija te onemogućen
              nedozvoljen pristup podacima prilikom komunikacije između
              korisnikovog računala i WebPay servisa, te obratno.
            </p>
            <p>
              WebPay servis i financijske ustanove razmjenjuju podatke uporabom
              virtualne privatne mreže (VPN), koja je zaštićena od
              neautoriziranog pristupa.
            </p>
            <p>
              Monri Payment Gateway je certificiran prema PCI DSS Level 1
              sigurnosnom standardu propisanom Visa i Mastercard pravilima.
            </p>
            <p>
              Trgovac ne pohranjuje brojeve kreditnih kartica i brojevi nisu
              dostupni neovlaštenim osobama.
            </p>
            <p>
              Webshop koristi 3D Secure sigurnosni protokol koji omogućuje
              dodatnu autentifikaciju korisnika prilikom online plaćanja
              karticama, čime se osigurava viša razina zaštite i sigurnosti
              transakcija putem sustava vaše banke.
            </p>

            <div className="not-prose mt-12 flex flex-wrap items-center gap-4">
              <span className="bg-white rounded-md px-3 py-2 border border-primary/10 shadow-sm">
                <Image
                  src="/images/payments/visa-secure.jpg"
                  alt="Visa Secure"
                  width={60}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
              </span>
              <span className="bg-white rounded-md px-3 py-2 border border-primary/10 shadow-sm">
                <Image
                  src="/images/payments/mc-identity-check.png"
                  alt="Mastercard Identity Check"
                  width={60}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
              </span>
              <a
                href="https://monri.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-md px-3 py-2 border border-primary/10 shadow-sm hover:shadow transition-shadow"
                aria-label="Monri"
              >
                <Image
                  src="/images/payments/monri.png"
                  alt="Monri"
                  width={100}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
