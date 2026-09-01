"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui";
import { fillContractTemplate, type ContractParty } from "@/lib/contract/template";
import { PRILOG1_TEXT } from "@/lib/contract/ugovor-text";
import { SignatureCanvas } from "./SignatureCanvas";

interface ContractSectionProps {
  party: ContractParty;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onSignatureChange: (dataUrl: string | null) => void;
  acceptError?: string;
  signatureError?: string;
}

export function ContractSection({
  party,
  accepted,
  onAcceptedChange,
  onSignatureChange,
  acceptError,
  signatureError,
}: ContractSectionProps) {
  const t = useTranslations("checkout.form.contract");
  const [signedAtIso] = useState(() => new Date().toISOString());

  const contractText = useMemo(
    () => fillContractTemplate(party, signedAtIso),
    [party, signedAtIso]
  );

  return (
    <div>
      <h3 className="text-lg font-heading text-primary mb-2 flex items-center gap-2">
        <span className="w-6 h-6 bg-secondary text-white text-sm flex items-center justify-center">
          §
        </span>
        {t("title")}
      </h3>
      <p className="text-sm text-primary/60 mb-4">{t("intro")}</p>

      <div className="border border-primary/20 bg-white">
        <div className="max-h-80 overflow-y-auto p-4 text-xs leading-relaxed text-primary/80 whitespace-pre-wrap font-mono">
          {contractText}
          {"\n\n\n"}
          {PRILOG1_TEXT}
        </div>
      </div>
      <p className="text-xs text-primary/40 mt-1 mb-4">{t("scrollNote")}</p>

      <div className="space-y-4">
        <Checkbox
          name="acceptContract"
          checked={accepted}
          onChange={(e) => onAcceptedChange(e.target.checked)}
          error={acceptError}
          label={t("acceptLabel")}
        />

        <div>
          <p className="text-sm font-medium text-primary mb-2">
            {t("signatureLabel")}
          </p>
          <SignatureCanvas
            onChange={onSignatureChange}
            clearLabel={t("clearSignature")}
            placeholder={t("signaturePlaceholder")}
          />
          {signatureError && (
            <p className="text-sm text-red-600 mt-1">{signatureError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
