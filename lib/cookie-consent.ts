// Cookie consent storage — the banner writes here, and any future
// analytics/marketing scripts must check hasAnalyticsConsent() before loading.

export const COOKIE_CONSENT_KEY = "brendia_cookie_consent";

export type ConsentLevel = "all" | "necessary";

export interface CookieConsent {
  level: ConsentLevel;
  timestamp: string;
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.level !== "all" && parsed.level !== "necessary") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCookieConsent(level: ConsentLevel): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({ level, timestamp: new Date().toISOString() })
  );
}

export function clearCookieConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COOKIE_CONSENT_KEY);
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent()?.level === "all";
}
