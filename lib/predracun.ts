// Predračun (bank-transfer) payment flow — active while card payments
// are pending Monri production approval. Toggled via NEXT_PUBLIC_PAYMENT_MODE.
import { COMPANY } from "@/lib/constants/company";
import { formatPrice } from "@/lib/constants/courses";

export function isPredracunMode(): boolean {
  return process.env.NEXT_PUBLIC_PAYMENT_MODE === "predracun";
}

export function getBankIban(): string {
  return process.env.BANK_IBAN || "";
}

export function getOrderNotificationsEmail(): string {
  return process.env.ORDER_NOTIFICATIONS_EMAIL || "info@brendiapro.hr";
}

interface PredracunOrder {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  companyName?: string | null;
  vatNumber?: string | null;
  courseName: string;
  subtotal: number;
  vat: number;
  total: number;
}

// Customer email: predračun with payment instructions
export function generatePredracunEmailHtml(o: PredracunOrder): string {
  const iban = getBankIban();
  return `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brendia Pro</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#1A1A1A;background-color:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <div style="background-color:#1A1A1A;padding:30px 40px;text-align:center;">
      <img src="https://brendiapro.hr/images/logo-white.png" alt="Brendia Pro" style="height:40px;" />
    </div>
    <div style="padding:40px;">
      <h1 style="color:#1A1A1A;font-size:24px;font-weight:600;margin:0 0 20px;">Hvala na narudzbi!</h1>
      <p style="margin:0 0 16px;color:#333333;">Postovani/a ${o.customerName},</p>
      <p style="margin:0 0 16px;color:#333333;">Zaprimili smo Vasu narudzbu za <strong>${o.courseName}</strong>. U nastavku su podaci za uplatu &mdash; nakon sto uplata bude evidentirana, na ovu email adresu stize racun i link za aktivaciju pristupa.</p>
      <div style="background-color:#FDF8F3;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#333333;"><strong>Narudzba ${o.orderNumber}</strong></p>
        <p style="margin:0 0 4px;color:#333333;">${o.courseName}</p>
        <p style="margin:0 0 4px;color:#333333;">Osnovica: ${formatPrice(o.subtotal)}</p>
        <p style="margin:0 0 4px;color:#333333;">PDV (25%): ${formatPrice(o.vat)}</p>
        <p style="margin:8px 0 0;color:#333333;font-size:18px;"><strong>Za uplatu: ${formatPrice(o.total)}</strong></p>
      </div>
      <div style="background-color:#F5F5F5;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#333333;"><strong>Podaci za placanje:</strong></p>
        <p style="margin:0 0 4px;color:#333333;">Primatelj: ${COMPANY.name}</p>
        <p style="margin:0 0 4px;color:#333333;">${COMPANY.street}, ${COMPANY.city}</p>
        <p style="margin:0 0 4px;color:#333333;">IBAN: <strong>${iban}</strong></p>
        <p style="margin:0 0 4px;color:#333333;">Model: HR00</p>
        <p style="margin:0 0 4px;color:#333333;">Opis placanja: ${o.orderNumber}</p>
        <p style="margin:0 0 4px;color:#333333;">Iznos: ${formatPrice(o.total)}</p>
      </div>
      <p style="margin:0 0 16px;color:#333333;">Molimo da u opisu placanja obavezno navedete broj narudzbe <strong>${o.orderNumber}</strong> kako bismo uplatu mogli povezati s Vasom narudzbom.</p>
      <p style="margin:0 0 16px;color:#333333;">Uplate se obicno evidentiraju unutar jednog radnog dana. Ako imate bilo kakvih pitanja, javite nam se na <a href="mailto:${COMPANY.email}" style="color:#B8956A;">${COMPANY.email}</a> ili ${COMPANY.phone}.</p>
      <p style="margin:0 0 16px;color:#333333;">Srdacan pozdrav,<br>Nikolina i Brendia Pro tim</p>
    </div>
    <div style="background-color:#FDF8F3;padding:30px 40px;text-align:center;font-size:14px;color:#666666;">
      <p style="margin:0 0 8px;"><strong>${COMPANY.name}</strong></p>
      <p style="margin:0 0 4px;">${COMPANY.street}, ${COMPANY.city} &middot; OIB: ${COMPANY.oib}</p>
      <p style="margin:0;">Premium Hair Extension Education</p>
    </div>
  </div>
</body>
</html>
`;
}

// Admin notification: everything needed to issue the invoice + track payment
export function generateOrderNotificationEmailHtml(o: PredracunOrder): string {
  const companyBlock = o.companyName || o.vatNumber
    ? `<p style="margin:0 0 4px;"><strong>Tvrtka (R1):</strong> ${o.companyName || "-"} &middot; OIB/VAT: ${o.vatNumber || "-"}</p>`
    : `<p style="margin:0 0 4px;"><strong>Kupac:</strong> fizicka osoba</p>`;
  return `
<!DOCTYPE html>
<html lang="hr">
<body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#1A1A1A;">
  <h2 style="margin:0 0 16px;">Nova narudzba ${o.orderNumber} (predracun)</h2>
  <p style="margin:0 0 16px;">Kupac je dobio predracun s podacima za uplatu. Kad uplata stigne na racun:</p>
  <ol style="margin:0 0 16px;">
    <li>izdati racun u MER-u (podaci ispod),</li>
    <li>potvrditi uplatu u sustavu da kupac dobije aktivacijski link.</li>
  </ol>
  <div style="background:#FDF8F3;padding:16px;border-radius:8px;margin:0 0 16px;">
    <p style="margin:0 0 4px;"><strong>Narudzba:</strong> ${o.orderNumber}</p>
    <p style="margin:0 0 4px;"><strong>Program:</strong> ${o.courseName}</p>
    <p style="margin:0 0 4px;"><strong>Osnovica:</strong> ${formatPrice(o.subtotal)} &middot; <strong>PDV 25%:</strong> ${formatPrice(o.vat)} &middot; <strong>Ukupno:</strong> ${formatPrice(o.total)}</p>
    <p style="margin:0 0 4px;"><strong>Nacin placanja:</strong> transakcijski racun (predracun/virman)</p>
  </div>
  <div style="background:#F5F5F5;padding:16px;border-radius:8px;">
    <p style="margin:0 0 4px;"><strong>Ime i prezime:</strong> ${o.customerName}</p>
    <p style="margin:0 0 4px;"><strong>Email:</strong> ${o.email} &middot; <strong>Tel:</strong> ${o.phone}</p>
    <p style="margin:0 0 4px;"><strong>Adresa:</strong> ${o.street}, ${o.postalCode} ${o.city}, ${o.country}</p>
    ${companyBlock}
  </div>
</body>
</html>
`;
}
