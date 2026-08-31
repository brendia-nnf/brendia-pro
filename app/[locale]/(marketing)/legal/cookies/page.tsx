"use client";

import { Container } from "@/components/ui";
import { COMPANY } from "@/lib/constants/company";
import { clearCookieConsent } from "@/lib/cookie-consent";

export default function CookiePolicyPage() {
  const reopenBanner = () => {
    clearCookieConsent();
    window.dispatchEvent(new Event("brendia:open-cookie-banner"));
  };

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-heading text-primary mb-6">
              Politika kolačića
            </h1>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
            <h2>1. Što su kolačići</h2>
            <p>
              Kolačići (cookies) su male tekstualne datoteke koje web-stranica
              pohranjuje na vaš uređaj prilikom posjeta. Koriste se kako bi
              stranica ispravno radila, zapamtila vaše postavke i, uz vašu
              privolu, za analitiku i marketing. Uz kolačiće, stranica može
              koristiti i sličnu tehnologiju lokalne pohrane (localStorage).
            </p>

            <h2>2. Kolačići koje koristimo</h2>
            <p>
              Ova web-stranica trenutno koristi samo <strong>strogo nužne</strong>{" "}
              kolačiće i lokalnu pohranu, koji su potrebni za osnovno
              funkcioniranje stranice i za koje privola nije potrebna:
            </p>
            <div className="not-prose overflow-x-auto">
              <table className="w-full text-sm border border-primary/10">
                <thead className="bg-cream">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Naziv</th>
                    <th className="text-left px-4 py-3 font-medium">Vrsta</th>
                    <th className="text-left px-4 py-3 font-medium">Svrha</th>
                    <th className="text-left px-4 py-3 font-medium">Trajanje</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-primary/10">
                    <td className="px-4 py-3 font-mono text-xs">NEXT_LOCALE</td>
                    <td className="px-4 py-3">Nužni kolačić</td>
                    <td className="px-4 py-3">
                      Pamti odabrani jezik stranice (hrvatski/engleski)
                    </td>
                    <td className="px-4 py-3">1 godina</td>
                  </tr>
                  <tr className="border-t border-primary/10">
                    <td className="px-4 py-3 font-mono text-xs">
                      brendia_cookie_consent
                    </td>
                    <td className="px-4 py-3">Lokalna pohrana</td>
                    <td className="px-4 py-3">
                      Pamti vaš odabir u vezi s privolom za kolačiće
                    </td>
                    <td className="px-4 py-3">Do brisanja</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>3. Kolačići trećih strana</h2>
            <p>
              Prilikom plaćanja preusmjeravate se na sigurnu stranicu za naplatu
              Monri platnog sustava, koja može koristiti vlastite nužne
              kolačiće potrebne za sigurnu obradu plaćanja (uključujući 3D
              Secure provjeru). Više o sigurnosti plaćanja pročitajte na
              stranici Sigurnost plaćanja.
            </p>

            <h2>4. Analitički i marketinški kolačići</h2>
            <p>
              Analitičke i marketinške kolačiće trenutno{" "}
              <strong>ne koristimo</strong>. Ako ih u budućnosti uvedemo,
              koristit će se isključivo uz vašu prethodnu privolu koju možete
              dati ili uskratiti putem obavijesti o kolačićima, a ova Politika
              bit će ažurirana.
            </p>

            <h2>5. Upravljanje kolačićima</h2>
            <p>
              Svoj odabir možete promijeniti u bilo kojem trenutku klikom na
              gumb ispod. Kolačiće možete obrisati i blokirati i u postavkama
              svog preglednika, no blokiranje nužnih kolačića može utjecati na
              rad stranice.
            </p>
            <p>
              <button
                onClick={reopenBanner}
                className="bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Promijeni postavke kolačića
              </button>
            </p>

            <h2>6. Kontakt</h2>
            <p>
              <strong>{COMPANY.name}</strong>
              <br />
              {COMPANY.street}, {COMPANY.city}, {COMPANY.country}
              <br />
              OIB: {COMPANY.oib}
              <br />
              E-mail: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              <br />
              Tel: <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
