// Pure template helpers (no Node APIs) — safe for client components.
import { UGOVOR_TEXT } from "./ugovor-text";

export interface ContractParty {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  oib: string;
}

export function fillContractTemplate(
  party: ContractParty,
  signedAtIso: string
): string {
  const address = [
    party.street || "________",
    `${party.postalCode || "_____"} ${party.city || "________"}`,
    party.country || "________",
  ].join(", ");
  const datum = new Date(signedAtIso).toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return UGOVOR_TEXT.replaceAll(
    "{{POLAZNIK_IME}}",
    party.fullName || "____________"
  )
    .replaceAll("{{POLAZNIK_ADRESA}}", address)
    .replaceAll("{{POLAZNIK_OIB}}", party.oib || "____________")
    .replaceAll("{{DATUM}}", datum);
}
