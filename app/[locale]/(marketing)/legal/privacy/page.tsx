"use client";

import { Container } from "@/components/ui";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-heading text-primary mb-6">
              Politika privatnosti
            </h1>
            <p className="text-primary/60">Zadnje ažuriranje: Srpanj 2025.</p>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
            <h2>1. Voditelj obrade</h2>
            <p>Voditelj obrade osobnih podataka je:</p>
            <p>
              <strong>OMEGA-NI d.o.o.</strong><br />
              Ulica Ladislava Šabana 24, 10360 Sesvete<br />
              OIB: 24477900978
            </p>
            <p>
              Za pitanja u vezi s obradom osobnih podataka i ostvarivanje prava ispitanika možete se obratiti na:<br />
              E-mail: <a href="mailto:info@brendiapro.hr">info@brendiapro.hr</a><br />
              Adresa: OMEGA-NI d.o.o., Ulica Ladislava Šabana 24, 10360 Sesvete
            </p>

            <h2>2. Na koga se odnosi ova Obavijest</h2>
            <p>Ova Obavijest odnosi se na obradu osobnih podataka:</p>
            <ul>
              <li>fizičke osobe koja pohađa Edukaciju</li>
              <li>osobe koja sklapa Ugovor s Organizatorom</li>
              <li>osobe za kontakt</li>
              <li>imenovanog fizičkog korisnika Edukacije ako Ugovor sklapa pravna osoba ili obrt</li>
              <li>osobe ovlaštene za zastupanje Polaznika</li>
              <li>osobe koja komunicira s Organizatorom u vezi s Edukacijom, Platformom, plaćanjem, certifikacijom ili provedbom Ugovora</li>
            </ul>

            <h2>3. Propisi na temelju kojih se osobni podaci obrađuju</h2>
            <p>Organizator obrađuje osobne podatke u skladu s:</p>
            <ul>
              <li>Uredbom (EU) 2016/679 (Opća uredba o zaštiti podataka - GDPR)</li>
              <li>Zakonom o provedbi Opće uredbe o zaštiti podataka</li>
              <li>Zakonom o računovodstvu</li>
              <li>Poreznim propisima</li>
              <li>Zakonom o elektroničkim komunikacijama</li>
              <li>Drugim primjenjivim propisima Republike Hrvatske</li>
            </ul>

            <h2>4. Koje osobne podatke obrađujemo</h2>
            <p>Organizator može obrađivati sljedeće kategorije osobnih podataka:</p>
            <ul>
              <li><strong>Identifikacijski podaci:</strong> ime i prezime, OIB kada je potreban za račun ili drugu propisanu dokumentaciju, adresa, potpis</li>
              <li><strong>Kontaktni podaci:</strong> e-mail adresa, broj telefona, adresa za dostavu</li>
              <li><strong>Ugovorni podaci:</strong> podaci o odabranoj Edukaciji, datum sklapanja Ugovora, trajanje pristupa Edukaciji</li>
              <li><strong>Financijski podaci:</strong> podaci potrebni za izdavanje računa, podaci o plaćanju</li>
              <li><strong>Podaci o korištenju Platforme:</strong> korisnički račun, napredak, zadaci, IP adresa, podaci o uređaju</li>
              <li><strong>Podaci o certifikaciji:</strong> ispunjenje uvjeta, evaluacije, datum izdavanja certifikata</li>
              <li><strong>Komunikacijski podaci:</strong> sadržaj e-mailova, poruka, upita i odgovora</li>
            </ul>
            <p>Organizator ne traži od Polaznika dostavu posebnih kategorija osobnih podataka (podaci o zdravlju, medicinskom stanju i sl.).</p>

            <h2>5. Svrhe obrade i pravne osnove</h2>
            <p>Organizator obrađuje osobne podatke u sljedeće svrhe:</p>
            <ul>
              <li><strong>Izvršenje ugovora:</strong> sklapanje i provedba Ugovora, omogućavanje pristupa Edukaciji, certifikacija</li>
              <li><strong>Zakonska obveza:</strong> izdavanje i čuvanje računa, računovodstvene i porezne obveze</li>
              <li><strong>Legitimni interes:</strong> zaštita Materijala, Branda, Platforme, sprječavanje zlouporaba, informacijska sigurnost</li>
              <li><strong>Privola:</strong> izravni marketing, promotivna objava fotografija i videozapisa, neobvezni kolačići</li>
            </ul>

            <h2>6. Rokovi čuvanja podataka</h2>
            <ul>
              <li>Ugovorni podaci: 5 godina nakon prestanka Ugovora</li>
              <li>Računovodstveni podaci: 11 godina</li>
              <li>Podaci o pristupu Platformi: 12 mjeseci nakon isteka pristupa</li>
              <li>Marketinški podaci: do povlačenja privole</li>
              <li>Sigurnosni logovi: do 24 mjeseca</li>
            </ul>

            <h2>7. Primatelji osobnih podataka</h2>
            <p>Osobni podaci mogu biti dostupni sljedećim kategorijama primatelja:</p>
            <ul>
              <li>Zaposlenici i ovlašteni suradnici Organizatora</li>
              <li>Predavači, mentori i edukatori</li>
              <li>Pružatelji Platforme, hostinga i cloud pohrane</li>
              <li>Pružatelji platnih usluga i banke</li>
              <li>Računovodstveni servis</li>
              <li>IT podrška</li>
              <li>Nadležna tijela kada je to propisano zakonom</li>
            </ul>

            <h2>8. Prijenos podataka izvan EU</h2>
            <p>
              Prijenos osobnih podataka u treće zemlje provodit će se samo ako su ispunjeni uvjeti iz GDPR-a,
              uključujući odluku o primjerenosti, standardne ugovorne klauzule ili drugi odgovarajući mehanizam prijenosa.
            </p>

            <h2>9. Vaša prava</h2>
            <p>Imate sljedeća prava u vezi s obradom vaših osobnih podataka:</p>
            <ul>
              <li>Pravo na pristup osobnim podacima</li>
              <li>Pravo na ispravak netočnih podataka</li>
              <li>Pravo na brisanje podataka</li>
              <li>Pravo na ograničenje obrade</li>
              <li>Pravo na prenosivost podataka</li>
              <li>Pravo na prigovor na obradu</li>
              <li>Pravo na povlačenje privole</li>
              <li>Pravo na podnošenje pritužbe Agenciji za zaštitu osobnih podataka</li>
            </ul>
            <p>
              Zahtjev za ostvarivanje prava možete podnijeti na e-mail: <a href="mailto:info@brendiapro.hr">info@brendiapro.hr</a>
            </p>

            <h2>10. Kolačići</h2>
            <p>Na web-stranici koristimo:</p>
            <ul>
              <li><strong>Strogo nužne kolačiće:</strong> potrebni za funkcioniranje stranice</li>
              <li><strong>Analitički kolačići:</strong> koriste se samo uz vašu privolu</li>
              <li><strong>Marketinški kolačići:</strong> koriste se samo uz vašu privolu</li>
            </ul>

            <h2>11. Sigurnost podataka</h2>
            <p>Primjenjujemo odgovarajuće tehničke i organizacijske mjere zaštite osobnih podataka, uključujući:</p>
            <ul>
              <li>Ograničenje pristupa samo ovlaštenim osobama</li>
              <li>Zaštitu korisničkih računa</li>
              <li>Korištenje sigurnih lozinki</li>
              <li>Sigurnosne kopije</li>
              <li>Postupak za postupanje u slučaju povrede podataka</li>
            </ul>

            <h2>12. Izmjene ove Obavijesti</h2>
            <p>
              Ova Obavijest može biti izmijenjena kada se promijene propisi ili način obrade podataka.
              Važeća verzija bit će dostupna na ovoj stranici.
            </p>

            <h2>13. Kontakt</h2>
            <p>
              <strong>OMEGA-NI d.o.o.</strong><br />
              Ulica Ladislava Šabana 24, 10360 Sesvete<br />
              OIB: 24477900978<br />
              E-mail: <a href="mailto:info@brendiapro.hr">info@brendiapro.hr</a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
