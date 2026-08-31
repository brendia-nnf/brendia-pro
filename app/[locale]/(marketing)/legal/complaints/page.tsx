"use client";

import { Container } from "@/components/ui";
import { COMPANY } from "@/lib/constants/company";

export default function ComplaintsPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-heading text-primary mb-6">
              Reklamacije i prigovori
            </h1>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
            <h2>1. Pravo na prigovor</h2>
            <p>
              Sukladno članku 10. Zakona o zaštiti potrošača (NN 19/22, 56/23),
              kupac ima pravo podnijeti pisani prigovor na kupljenu uslugu ili
              na rad prodajnog mjesta. Na prigovor ćemo odgovoriti u pisanom
              obliku najkasnije u roku od <strong>15 dana</strong> od dana
              zaprimanja prigovora, jasno se izjašnjavajući prihvaćamo li
              osnovanost prigovora.
            </p>

            <h2>2. Kako podnijeti prigovor ili reklamaciju</h2>
            <p>Prigovor ili reklamaciju možete podnijeti:</p>
            <ul>
              <li>
                <strong>e-poštom</strong> na adresu:{" "}
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </li>
              <li>
                <strong>poštom</strong> na adresu: {COMPANY.name},{" "}
                {COMPANY.street}, {COMPANY.city}, {COMPANY.country}
              </li>
              <li>
                <strong>telefonom</strong> na broj:{" "}
                <a href={COMPANY.phoneHref}>{COMPANY.phone}</a> (za informacije
                o statusu prigovora; radi dokazivosti preporučujemo pisani
                oblik)
              </li>
            </ul>
            <p>Kako bismo prigovor mogli obraditi što brže, molimo navedite:</p>
            <ul>
              <li>ime i prezime te kontakt podatke</li>
              <li>
                broj narudžbe (npr. BP-XXXXXX-XXXX) ili broj računa i datum
                kupnje
              </li>
              <li>jasan opis razloga prigovora ili reklamacije</li>
            </ul>
            <p>
              Po zaprimanju prigovora poslat ćemo Vam pisanu potvrdu o primitku.
              Evidenciju prigovora vodimo najmanje godinu dana od dana primitka.
            </p>

            <h2>3. Reklamacije na pruženu uslugu</h2>
            <p>
              Ako smatrate da usluga (edukacija, pristup platformi, digitalni
              sadržaj ili proizvod iz webshopa) nije pružena u skladu s
              ugovorom, odnosno da ima materijalni nedostatak, imate prava koja
              proizlaze iz odredaba o odgovornosti za materijalne nedostatke
              Zakona o obveznim odnosima. Ovisno o naravi nedostatka, možete
              zahtijevati uklanjanje nedostatka, ponovno pružanje usluge,
              sniženje cijene ili raskid ugovora uz povrat plaćenog iznosa.
            </p>

            <h2>4. Pravo na jednostrani raskid ugovora</h2>
            <p>
              Za ugovore sklopljene na daljinu kupac ima pravo, ne navodeći
              razloge, jednostrano raskinuti ugovor u roku od{" "}
              <strong>14 dana</strong> od dana sklapanja ugovora o uslugama,
              odnosno od dana preuzimanja proizvoda kod kupnje robe. Obavijest o
              raskidu možete poslati e-poštom ili poštom na gore navedene
              adrese, uz nedvosmislenu izjavu o raskidu (ime i prezime, adresa,
              broj narudžbe).
            </p>
            <p>
              <strong>Iznimka za digitalni sadržaj:</strong> pravo na
              jednostrani raskid prestaje ako je ispunjenje ugovora (aktivacija
              pristupa online edukaciji, odnosno isporuka digitalnog sadržaja)
              započelo uz Vaš izričit prethodni pristanak i potvrdu da ste
              upoznati s činjenicom da time gubite pravo na jednostrani raskid,
              sukladno članku 86. Zakona o zaštiti potrošača.
            </p>

            <h2>5. Povrat sredstava</h2>
            <p>
              U slučaju osnovane reklamacije ili raskida ugovora, povrat
              sredstava izvršit ćemo najkasnije u roku od 14 dana od dana
              prihvaćanja reklamacije, odnosno zaprimanja obavijesti o raskidu.
              Povrat plaćenog izvršit ćemo na isti način na koji je plaćanje
              izvršeno; u slučaju plaćanja karticom, povrat se vrši putem Monri
              platnog sustava na karticu kojom je plaćanje izvršeno.
            </p>

            <h2>6. Rješavanje sporova</h2>
            <p>
              Eventualne sporove nastojat ćemo riješiti mirnim putem. U slučaju
              spora koji nije moguće riješiti dogovorno, kupac može podnijeti
              prijedlog za alternativno rješavanje potrošačkih sporova
              nadležnom tijelu za alternativno rješavanje potrošačkih sporova
              (npr. Sud časti Hrvatske gospodarske komore ili Centar za
              mirenje pri Hrvatskoj gospodarskoj komori), ili pokrenuti
              postupak pred stvarno nadležnim sudom u Zagrebu.
            </p>

            <h2>7. Kontakt</h2>
            <p>
              <strong>{COMPANY.name}</strong>
              <br />
              {COMPANY.street}, {COMPANY.city}, {COMPANY.country}
              <br />
              OIB: {COMPANY.oib}
              <br />
              Tel: <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
              <br />
              E-mail: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
