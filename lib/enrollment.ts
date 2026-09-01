// Shared enrollment helpers used by the Monri callback and the
// admin confirm-payment route (predračun flow).

// Generate a secure enrollment token
export function generateEnrollmentToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Course ID mapping for display names
export const COURSE_NAMES: Record<string, string> = {
  "foundation-certification": "Brendia Pro® Artist",
  "master-certification": "Advanced Brendia Pro® Artist",
  "brendia-pro-artist-1v1": "Brendia Pro® Artist 1v1",
  "brendia-pro-master-1v1": "Brendia Pro® Master 1v1",
};

export function invoiceLinkHtml(invoicePdfLink: string | null): string {
  if (!invoicePdfLink) return "";
  return `<p style="margin:0;color:#333333;">Racun (PDF): <a href="${invoicePdfLink}" style="color:#B8956A;">preuzmite ovdje</a></p>`;
}

// Upgrade email for existing users buying the Advanced course
export function generateUpgradeEmailHtml(
  name: string,
  orderNumber: string,
  price: string,
  dashboardUrl: string,
  invoicePdfLink: string | null = null
): string {
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
      <h1 style="color:#1A1A1A;font-size:24px;font-weight:600;margin:0 0 20px;">Cestitamo na nadogradnji!</h1>
      <p style="margin:0 0 16px;color:#333333;">Draga ${name},</p>
      <p style="margin:0 0 16px;color:#333333;">Vasa uplata za <strong>Advanced Brendia Pro&reg; Artist</strong> je uspjesno zaprimljena i pristup je vec otkljucan na vasem postojecem racunu.</p>
      <div style="background-color:#FDF8F3;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#333333;"><strong>Detalji narudzbe:</strong></p>
        <p style="margin:0 0 8px;color:#333333;">Broj narudzbe: ${orderNumber}</p>
        <p style="margin:0 0 8px;color:#333333;">Iznos: ${price}</p>
        ${invoiceLinkHtml(invoicePdfLink)}
      </div>
      <p style="margin:0 0 16px;color:#333333;">Nije potrebna nikakva aktivacija - prijavite se svojim postojecim podacima i napredni sadrzaj ce vas cekati cim bude objavljen.</p>
      <p style="text-align:center;">
        <a href="${dashboardUrl}" style="display:inline-block;background-color:#B8956A;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;margin:20px 0;">Otvori platformu</a>
      </p>
      <p style="margin:0 0 16px;color:#333333;">Srdacan pozdrav,<br>Nikolina i Brendia Pro tim</p>
    </div>
    <div style="background-color:#FDF8F3;padding:30px 40px;text-align:center;font-size:14px;color:#666666;">
      <p style="margin:0 0 8px;"><strong>Brendia Pro</strong></p>
      <p style="margin:0;">Premium Hair Extension Education</p>
    </div>
  </div>
</body>
</html>
`;
}

// Generate activation email HTML
export function generateActivationEmailHtml(
  name: string,
  courseName: string,
  activationUrl: string,
  orderNumber: string,
  price: string,
  invoicePdfLink: string | null = null
): string {
  return `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brendia Pro</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1A1A1A;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1A1A1A;
      padding: 30px 40px;
      text-align: center;
    }
    .header img {
      height: 40px;
    }
    .content {
      padding: 40px;
    }
    .footer {
      background-color: #FDF8F3;
      padding: 30px 40px;
      text-align: center;
      font-size: 14px;
      color: #666666;
    }
    h1 {
      color: #1A1A1A;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 20px;
    }
    p {
      margin: 0 0 16px;
      color: #333333;
    }
    .button {
      display: inline-block;
      background-color: #B8956A;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .highlight {
      background-color: #FDF8F3;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://brendiapro.hr/images/logo-white.png" alt="Brendia Pro" />
    </div>
    <div class="content">
      <h1>Hvala na kupnji!</h1>
      <p>Draga ${name},</p>
      <p>Vasa uplata za <strong>${courseName}</strong> je uspjesno zaprimljena.</p>
      <div class="highlight">
        <p><strong>Detalji narudzbe:</strong></p>
        <p>Broj narudzbe: ${orderNumber}</p>
        <p>Program: ${courseName}</p>
        <p>Iznos: ${price}</p>
        ${invoiceLinkHtml(invoicePdfLink)}
      </div>
      <p>Da biste pristupili svom tecaju, potrebno je aktivirati svoj racun. Kliknite na gumb ispod kako biste postavili lozinku i zapoceli s ucenjem.</p>
      <p style="text-align: center;">
        <a href="${activationUrl}" class="button">Aktiviraj racun</a>
      </p>
      <div class="divider"></div>
      <p><strong>Sto ce se dogoditi:</strong></p>
      <ul>
        <li>Postavit cete svoju lozinku</li>
        <li>Automatski cete dobiti pristup svom tecaju</li>
        <li>Mozete odmah poceti s ucenjem</li>
      </ul>
      <p style="font-size: 12px; color: #666;">Link za aktivaciju istjece za 7 dana. Ako link istekne, kontaktirajte nas za novi.</p>
      <div class="divider"></div>
      <p>Srdacan pozdrav,<br>Nikolina i Brendia Pro tim</p>
    </div>
    <div class="footer">
      <p><strong>Brendia Pro</strong></p>
      <p>Premium Hair Extension Education</p>
      <p style="font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} Brendia Pro. Sva prava pridrzana.
      </p>
    </div>
  </div>
</body>
</html>
`;
}
