// Podaci o tvrtki — jedini izvor istine za footer i pravne stranice.
// Traženo Monri compliance pregledom (kolovoz 2026).
export const COMPANY = {
  name: "OMEGA-NI d.o.o.",
  street: "Ulica Ladislava Šabana 24",
  city: "10360 Sesvete",
  country: "Hrvatska",
  oib: "24477900978",
  vatId: "HR24477900978",
  mbs: "080887738",
  registryCourt: "Trgovački sud u Zagrebu",
  shareCapital: "2.500,00 EUR (uplaćen u cijelosti)",
  director: "Nikolina Kljaić",
  email: "info@brendiapro.hr",
  phone: "+385 91 554 9624",
  phoneHref: "tel:+385915549624",
} as const;

// Kartice koje prodajno mjesto prihvaća (Monri: navesti samo prihvaćene kartice)
export const ACCEPTED_CARDS =
  "Mastercard, Maestro, Visa, Diners, Discover i American Express";
