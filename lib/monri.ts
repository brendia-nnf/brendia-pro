import crypto from "crypto";

// Monri Configuration
export const MONRI_CONFIG = {
  // API URLs
  testUrl: "https://ipgtest.monri.com/v2/form",
  productionUrl: "https://ipg.monri.com/v2/form",

  // Get the appropriate URL based on environment
  get formUrl() {
    return process.env.MONRI_ENVIRONMENT === "production"
      ? this.productionUrl
      : this.testUrl;
  },

  // Merchant credentials from environment
  get merchantKey() {
    const key = process.env.MONRI_MERCHANT_KEY;
    if (!key) throw new Error("MONRI_MERCHANT_KEY is not set");
    return key;
  },

  get authenticityToken() {
    const token = process.env.MONRI_AUTHENTICITY_TOKEN;
    if (!token) throw new Error("MONRI_AUTHENTICITY_TOKEN is not set");
    return token;
  },

  get isProduction() {
    return process.env.MONRI_ENVIRONMENT === "production";
  },
};

/**
 * Monri mode: the whole checkout (jednokratno i rate) goes through the
 * Monri v2 form redirect instead of Stripe. Used on the preview deploy
 * (brendia-pro.vercel.app) for the OTP banka site review; production
 * stays on Stripe until the Monri/OTP contract is signed.
 * generateOrderNumber lives in lib/stripe.ts (shared by both flows).
 */
export function isMonriMode(): boolean {
  return process.env.NEXT_PUBLIC_PAYMENT_MODE === "monri";
}

/**
 * Calculate SHA512 digest for Monri form submission
 * Format: SHA512(merchant_key + order_number + amount + currency)
 */
export function calculateFormDigest(
  orderNumber: string,
  amount: number, // in minor units (cents)
  currency: string = "EUR"
): string {
  const data = `${MONRI_CONFIG.merchantKey}${orderNumber}${amount}${currency}`;
  return crypto.createHash("sha512").update(data).digest("hex");
}

/**
 * Calculate SHA512 digest for callback verification
 * Format: SHA512(merchant_key + order_number + response_code + amount + currency)
 */
export function calculateCallbackDigest(
  orderNumber: string,
  responseCode: string,
  amount: number, // in minor units (cents)
  currency: string = "EUR"
): string {
  const data = `${MONRI_CONFIG.merchantKey}${orderNumber}${responseCode}${amount}${currency}`;
  return crypto.createHash("sha512").update(data).digest("hex");
}

/**
 * Verify Monri callback digest
 */
export function verifyCallbackDigest(
  receivedDigest: string,
  orderNumber: string,
  responseCode: string,
  amount: number,
  currency: string = "EUR"
): boolean {
  const expectedDigest = calculateCallbackDigest(
    orderNumber,
    responseCode,
    amount,
    currency
  );
  return receivedDigest === expectedDigest;
}

export interface MonriFormData {
  // Required fields
  authenticity_token: string;
  order_number: string;
  amount: string; // in minor units (cents) as string
  currency: string;
  digest: string;
  transaction_type: "purchase" | "authorize";

  // URLs (Monri only honors the *_override params per transaction;
  // plain success_url/cancel_url are ignored in favor of the merchant
  // dashboard configuration)
  success_url_override: string;
  cancel_url_override: string;
  callback_url: string;

  // Customer info
  ch_full_name: string;
  ch_email: string;
  ch_phone: string;
  ch_address: string;
  ch_city: string;
  ch_zip: string;
  ch_country: string;

  // Optional fields
  language?: string;
  order_info?: string;
  custom_data?: string;
  // Obročno plaćanje (Monri v2 form: raspon 2–12, mora biti omogućeno
  // na merchant profilu kod banke)
  number_of_installments?: string;
}

export interface MonriFormParams {
  orderNumber: string;
  amount: number; // in cents
  currency?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string; // ISO 2-letter code
  orderInfo?: string;
  customData?: string;
  language?: string;
  numberOfInstallments?: number;
}

/**
 * Build form data for Monri payment redirect
 */
export function buildMonriFormData(params: MonriFormParams): MonriFormData {
  const {
    orderNumber,
    amount,
    currency = "EUR",
    customerName,
    email,
    phone,
    address,
    city,
    postalCode,
    country,
    orderInfo,
    customData,
    language = "hr",
    numberOfInstallments,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const digest = calculateFormDigest(orderNumber, amount, currency);

  return {
    authenticity_token: MONRI_CONFIG.authenticityToken,
    order_number: orderNumber,
    amount: amount.toString(),
    currency,
    digest,
    transaction_type: "purchase",

    success_url_override: `${baseUrl}/checkout/success?order_number=${orderNumber}`,
    cancel_url_override: `${baseUrl}/checkout/cancel?order_number=${orderNumber}`,
    callback_url: `${baseUrl}/api/monri/callback`,

    ch_full_name: customerName,
    ch_email: email,
    ch_phone: phone,
    ch_address: address,
    ch_city: city,
    ch_zip: postalCode,
    ch_country: country,

    language,
    order_info: orderInfo,
    custom_data: customData,
    ...(numberOfInstallments && numberOfInstallments >= 2
      ? { number_of_installments: String(numberOfInstallments) }
      : {}),
  };
}

// Response code meanings
export const MONRI_RESPONSE_CODES: Record<string, string> = {
  "0000": "Approved",
  "0001": "Approved with identification",
  "0002": "Partially approved",
  "1001": "Card expired",
  "1002": "Card suspicious",
  "1003": "Card stolen",
  "1004": "Unauthorized",
  "1005": "Insufficient funds",
  "1006": "Card error",
  "1007": "Transaction not permitted",
  "1008": "Amount too high",
  "1009": "Duplicate transaction",
  "1010": "Communication error",
  "2000": "Declined",
  "3000": "Transaction pending",
  "4000": "Transaction cancelled by user",
};

/**
 * Check if response code indicates successful payment
 */
export function isSuccessfulPayment(responseCode: string): boolean {
  return responseCode === "0000" || responseCode === "0001" || responseCode === "0002";
}

/**
 * Get human-readable response message
 */
export function getResponseMessage(responseCode: string): string {
  return MONRI_RESPONSE_CODES[responseCode] || `Unknown response: ${responseCode}`;
}

// Test card numbers for sandbox testing
export const MONRI_TEST_CARDS = {
  visa3ds: "4341792000000044",
  visa: "4058400000000005",
  mastercard: "5464000000000008",
  maestro3ds: "6769064219992611",
};
