// Moj-eRačun (MER) integracija za B2B eRačune — kupci koji su tvrtke
// (unijeli naziv tvrtke/OIB na checkoutu) dobivaju eRačun kroz MER,
// dok fizičke osobe dobivaju fiskalizirani račun kroz Fakturko.
// Docs: https://manual.moj-eracun.hr/hr/documentation/api-specifikacija-2/
import { COMPANY } from "@/lib/constants/company";

export function isMerConfigured(): boolean {
  return !!(
    process.env.MER_API_URL &&
    process.env.MER_USERNAME &&
    process.env.MER_PASSWORD &&
    process.env.MER_SOFTWARE_ID
  );
}

export interface MerInvoiceParams {
  invoiceNumber: string; // fiskalni format: broj/prostor/uređaj, npr. "3/WEB1/2"
  buyer: {
    name: string;
    oib: string; // bez HR prefiksa
    street?: string;
    city?: string;
    zip?: string;
    email?: string;
  };
  line: {
    name: string;
    kpdCode: string;
    netAmount: number; // EUR, bez PDV-a
  };
  vatPercentage: number;
  orderNumber: string; // naša interna referenca (BP-...)
  note?: string;
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n: number) => n.toFixed(2);

/** UBL 2.1 eRačun prema HR CIUS-2025 (predložak: službeni MER primjeri). */
export function buildMerInvoiceXml(p: MerInvoiceParams): string {
  const oibClean = p.buyer.oib.replace(/^HR/i, "").trim();
  const net = p.line.netAmount;
  const vat = Math.round(net * p.vatPercentage) / 100;
  const gross = net + vat;
  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toISOString().slice(11, 19);
  const supplierOib = COMPANY.oib;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
	<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:mfin.gov.hr:cius-2025:1.0#conformant#urn:mfin.gov.hr:ext-2025:1.0</cbc:CustomizationID>
	<cbc:ProfileID>P1</cbc:ProfileID>
	<cbc:ID>${esc(p.invoiceNumber)}</cbc:ID>
	<cbc:CopyIndicator>false</cbc:CopyIndicator>
	<cbc:IssueDate>${today}</cbc:IssueDate>
	<cbc:IssueTime>${time}</cbc:IssueTime>
	<cbc:DueDate>${today}</cbc:DueDate>
	<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
	<cbc:Note>${esc(p.note || `Narudžba ${p.orderNumber} — plaćeno karticom putem Stripe.`)}</cbc:Note>
	<cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
	<cac:OrderReference>
		<cbc:ID>${esc(p.orderNumber)}</cbc:ID>
	</cac:OrderReference>
	<cac:AccountingSupplierParty>
		<cac:Party>
			<cbc:EndpointID schemeID="9934">${supplierOib}</cbc:EndpointID>
			<cac:PartyIdentification>
				<cbc:ID>9934:${supplierOib}</cbc:ID>
			</cac:PartyIdentification>
			<cac:PartyName>
				<cbc:Name>${esc(COMPANY.name)}</cbc:Name>
			</cac:PartyName>
			<cac:PostalAddress>
				<cbc:StreetName>${esc(COMPANY.street)}</cbc:StreetName>
				<cbc:CityName>${esc(COMPANY.city.replace(/^\d+\s*/, ""))}</cbc:CityName>
				<cbc:PostalZone>${esc(COMPANY.city.split(" ")[0])}</cbc:PostalZone>
				<cac:Country>
					<cbc:IdentificationCode>HR</cbc:IdentificationCode>
				</cac:Country>
			</cac:PostalAddress>
			<cac:PartyTaxScheme>
				<cbc:CompanyID>${COMPANY.vatId}</cbc:CompanyID>
				<cac:TaxScheme>
					<cbc:ID>VAT</cbc:ID>
				</cac:TaxScheme>
			</cac:PartyTaxScheme>
			<cac:PartyLegalEntity>
				<cbc:RegistrationName>${esc(COMPANY.name)}</cbc:RegistrationName>
				<cbc:CompanyID>${supplierOib}</cbc:CompanyID>
			</cac:PartyLegalEntity>
			<cac:Contact>
				<cbc:Telephone>${esc(COMPANY.phone)}</cbc:Telephone>
				<cbc:ElectronicMail>${esc(COMPANY.email)}</cbc:ElectronicMail>
			</cac:Contact>
		</cac:Party>
		<cac:SellerContact>
			<cbc:ID>${supplierOib}</cbc:ID>
			<cbc:Name>${esc(COMPANY.director)}</cbc:Name>
		</cac:SellerContact>
	</cac:AccountingSupplierParty>
	<cac:AccountingCustomerParty>
		<cac:Party>
			<cbc:EndpointID schemeID="9934">${oibClean}</cbc:EndpointID>
			<cac:PartyIdentification>
				<cbc:ID>9934:${oibClean}</cbc:ID>
			</cac:PartyIdentification>
			<cac:PartyName>
				<cbc:Name>${esc(p.buyer.name)}</cbc:Name>
			</cac:PartyName>
			<cac:PostalAddress>
				<cbc:StreetName>${esc(p.buyer.street || "")}</cbc:StreetName>
				<cbc:CityName>${esc(p.buyer.city || "")}</cbc:CityName>
				<cbc:PostalZone>${esc(p.buyer.zip || "")}</cbc:PostalZone>
				<cac:Country>
					<cbc:IdentificationCode>HR</cbc:IdentificationCode>
				</cac:Country>
			</cac:PostalAddress>
			<cac:PartyTaxScheme>
				<cbc:CompanyID>HR${oibClean}</cbc:CompanyID>
				<cac:TaxScheme>
					<cbc:ID>VAT</cbc:ID>
				</cac:TaxScheme>
			</cac:PartyTaxScheme>
			<cac:PartyLegalEntity>
				<cbc:RegistrationName>${esc(p.buyer.name)}</cbc:RegistrationName>
				<cbc:CompanyID>${oibClean}</cbc:CompanyID>
			</cac:PartyLegalEntity>
		</cac:Party>${
      p.buyer.email
        ? `
		<cac:AccountingContact>
			<cbc:ElectronicMail>${esc(p.buyer.email)}</cbc:ElectronicMail>
		</cac:AccountingContact>`
        : ""
    }
	</cac:AccountingCustomerParty>
	<cac:PaymentMeans>
		<cbc:PaymentMeansCode>48</cbc:PaymentMeansCode>
		<cbc:InstructionNote>Plaćeno karticom (Stripe)</cbc:InstructionNote>
	</cac:PaymentMeans>
	<cac:TaxTotal>
		<cbc:TaxAmount currencyID="EUR">${money(vat)}</cbc:TaxAmount>
		<cac:TaxSubtotal>
			<cbc:TaxableAmount currencyID="EUR">${money(net)}</cbc:TaxableAmount>
			<cbc:TaxAmount currencyID="EUR">${money(vat)}</cbc:TaxAmount>
			<cac:TaxCategory>
				<cbc:ID>S</cbc:ID>
				<cbc:Percent>${p.vatPercentage}</cbc:Percent>
				<cac:TaxScheme>
					<cbc:ID>VAT</cbc:ID>
				</cac:TaxScheme>
			</cac:TaxCategory>
		</cac:TaxSubtotal>
	</cac:TaxTotal>
	<cac:LegalMonetaryTotal>
		<cbc:LineExtensionAmount currencyID="EUR">${money(net)}</cbc:LineExtensionAmount>
		<cbc:TaxExclusiveAmount currencyID="EUR">${money(net)}</cbc:TaxExclusiveAmount>
		<cbc:TaxInclusiveAmount currencyID="EUR">${money(gross)}</cbc:TaxInclusiveAmount>
		<cbc:PrepaidAmount currencyID="EUR">${money(gross)}</cbc:PrepaidAmount>
		<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>
	</cac:LegalMonetaryTotal>
	<cac:InvoiceLine>
		<cbc:ID>1</cbc:ID>
		<cbc:InvoicedQuantity unitCode="H87">1.000</cbc:InvoicedQuantity>
		<cbc:LineExtensionAmount currencyID="EUR">${money(net)}</cbc:LineExtensionAmount>
		<cac:Item>
			<cbc:Name>${esc(p.line.name)}</cbc:Name>
			<cac:CommodityClassification>
				<cbc:ItemClassificationCode listID="CG">${esc(p.line.kpdCode)}</cbc:ItemClassificationCode>
			</cac:CommodityClassification>
			<cac:ClassifiedTaxCategory>
				<cbc:ID>S</cbc:ID>
				<cbc:Name>HR:PDV${p.vatPercentage}</cbc:Name>
				<cbc:Percent>${p.vatPercentage}</cbc:Percent>
				<cac:TaxScheme>
					<cbc:ID>VAT</cbc:ID>
				</cac:TaxScheme>
			</cac:ClassifiedTaxCategory>
		</cac:Item>
		<cac:Price>
			<cbc:PriceAmount currencyID="EUR">${net.toFixed(6)}</cbc:PriceAmount>
			<cbc:BaseQuantity unitCode="H87">1.000</cbc:BaseQuantity>
		</cac:Price>
	</cac:InvoiceLine>
</Invoice>`;
}

export interface MerSendResult {
  ok: boolean;
  electronicId?: string;
  error?: string;
}

async function merPost(
  path: "send" | "validate",
  xml: string
): Promise<MerSendResult> {
  const res = await fetch(`${process.env.MER_API_URL}/apis/v2/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Username: process.env.MER_USERNAME,
      Password: process.env.MER_PASSWORD,
      CompanyId: process.env.MER_COMPANY_ID || COMPANY.oib,
      SoftwareId: process.env.MER_SOFTWARE_ID,
      File: xml,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 500)}` };
  }
  try {
    const data = JSON.parse(text);
    return { ok: true, electronicId: String(data.ElectronicId ?? "") };
  } catch {
    return { ok: true, electronicId: text.slice(0, 100) };
  }
}

/** Provjera XML-a na MER validatoru bez slanja primatelju. */
export function validateMerInvoice(xml: string): Promise<MerSendResult> {
  return merPost("validate", xml);
}

/** Slanje eRačuna primatelju kroz MER. */
export function sendMerInvoice(xml: string): Promise<MerSendResult> {
  return merPost("send", xml);
}
