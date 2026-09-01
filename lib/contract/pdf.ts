// Generates the signed contract PDF (ugovor + Prilog 1 + signature page).
// Uses DejaVu Sans (bundled TTF) because pdf-lib's standard fonts lack
// Croatian glyphs (č, ć, đ).
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PRILOG1_TEXT, CONTRACT_VERSION } from "./ugovor-text";
import { fillContractTemplate as fillTemplate } from "./template";

export interface ContractData {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  oib: string;
  email: string;
  orderNumber: string;
  courseName: string;
  ipAddress: string;
  signedAtIso: string;
  // PNG data URL from the signature canvas
  signatureDataUrl: string;
}

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const FONT_SIZE = 9.5;
const LINE_HEIGHT = 13.5;

function fillContractTemplate(data: ContractData): string {
  return fillTemplate(
    {
      fullName: data.fullName,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      oib: data.oib,
    },
    data.signedAtIso
  );
}

function wrapLine(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  if (!text.trim()) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // Extremely long single word: hard-split
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateContractPdf(
  data: ContractData
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontDir = path.join(process.cwd(), "assets", "fonts");
  const [regularBytes, boldBytes] = await Promise.all([
    readFile(path.join(fontDir, "DejaVuSans.ttf")),
    readFile(path.join(fontDir, "DejaVuSans-Bold.ttf")),
  ]);
  const font = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });

  doc.setTitle(`Ugovor ${data.orderNumber} — Brendia Pro`);
  doc.setSubject(`Ugovor o edukaciji (verzija ${CONTRACT_VERSION})`);
  doc.setAuthor("OMEGA-NI d.o.o.");

  let page: PDFPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  const maxWidth = PAGE_WIDTH - 2 * MARGIN;

  const newPageIfNeeded = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawParagraph = (
    text: string,
    opts: { bold?: boolean; size?: number; spacing?: number } = {}
  ) => {
    const size = opts.size ?? FONT_SIZE;
    const f = opts.bold ? bold : font;
    const lineH = size * 1.42;
    for (const rawLine of text.split("\n")) {
      const wrapped = wrapLine(rawLine, f, size, maxWidth);
      for (const line of wrapped) {
        newPageIfNeeded(lineH);
        if (line) {
          page.drawText(line, { x: MARGIN, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
        }
        y -= lineH;
      }
    }
    y -= opts.spacing ?? 4;
  };

  const isHeading = (line: string) =>
    /^(UGOVOR|PRILOG|Članak \d+\.)\s*$/.test(line.trim());

  const drawDocument = (text: string) => {
    // Group blank-line-separated paragraphs to keep spacing tidy
    for (const block of text.split(/\n{2,}/)) {
      const trimmed = block.replace(/\s+$/g, "");
      if (!trimmed.trim()) continue;
      drawParagraph(trimmed, {
        bold: isHeading(trimmed),
        size: isHeading(trimmed) ? 12 : FONT_SIZE,
        spacing: 7,
      });
    }
  };

  // Contract body with filled-in data
  drawDocument(fillContractTemplate(data));

  // Prilog 1
  page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - MARGIN;
  drawDocument(PRILOG1_TEXT);

  // Signature / acceptance record page
  page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - MARGIN;
  drawParagraph("POTVRDA ELEKTRONIČKOG SKLAPANJA UGOVORA", { bold: true, size: 13, spacing: 10 });
  drawParagraph(
    "Ugovor je sklopljen elektroničkim putem prihvatom putem Platforme, sukladno završnim odredbama Ugovora. Polaznik je potvrdio da je pročitao Ugovor, Program edukacije (Prilog 1) i sve priloge te ih prihvaća, što je zabilježeno sljedećim podacima:",
    { spacing: 10 }
  );
  const rows: Array<[string, string]> = [
    ["Polaznik", data.fullName],
    ["Adresa", `${data.street}, ${data.postalCode} ${data.city}, ${data.country}`],
    ["OIB", data.oib || "—"],
    ["Email", data.email],
    ["Program", data.courseName],
    ["Broj narudžbe", data.orderNumber],
    ["Vrijeme prihvata", new Date(data.signedAtIso).toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" }) + " (Europe/Zagreb)"],
    ["IP adresa", data.ipAddress],
    ["Verzija ugovora", CONTRACT_VERSION],
  ];
  for (const [label, value] of rows) {
    newPageIfNeeded(LINE_HEIGHT);
    page.drawText(`${label}:`, { x: MARGIN, y, size: FONT_SIZE, font: bold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(value, { x: MARGIN + 130, y, size: FONT_SIZE, font, color: rgb(0.1, 0.1, 0.1) });
    y -= LINE_HEIGHT;
  }
  y -= 20;

  // Embedded hand-drawn signature
  const base64 = data.signatureDataUrl.replace(/^data:image\/png;base64,/, "");
  const signaturePng = await doc.embedPng(Buffer.from(base64, "base64"));
  const sigMaxW = 220;
  const scale = Math.min(sigMaxW / signaturePng.width, 90 / signaturePng.height);
  const sigW = signaturePng.width * scale;
  const sigH = signaturePng.height * scale;
  newPageIfNeeded(sigH + 3 * LINE_HEIGHT + 30);
  page.drawText("Vlastoručni potpis Polaznika (elektronički):", {
    x: MARGIN, y, size: FONT_SIZE, font: bold, color: rgb(0.1, 0.1, 0.1),
  });
  y -= sigH + 10;
  page.drawImage(signaturePng, { x: MARGIN, y, width: sigW, height: sigH });
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + sigMaxW, y },
    thickness: 0.7,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= LINE_HEIGHT;
  page.drawText(data.fullName, { x: MARGIN, y, size: FONT_SIZE, font, color: rgb(0.1, 0.1, 0.1) });

  return doc.save();
}
