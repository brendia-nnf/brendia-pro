// Podaci o tvrtki — jedini izvor istine za footer i pravne stranice.
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

// Kartice koje prodajno mjesto prihvaća (Stripe jednokratno + Monri/OTP rate).
// OTP pravila: oznaka ® uz Mastercard i Maestro, Maestro odmah iza
// Mastercarda bez druge kartice između.
export const ACCEPTED_CARDS =
  "Visa, Mastercard®, Maestro®, American Express, Diners i Discover";
