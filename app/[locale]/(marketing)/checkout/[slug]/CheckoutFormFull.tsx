"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, Input, Select, Checkbox } from "@/components/ui";
import { PaymentLogos } from "@/components/ui/PaymentLogos";
import { ContractSection } from "@/components/checkout/ContractSection";
import { countryOptions, getCountryName } from "@/lib/countries";
import { formatPrice } from "@/lib/constants/courses";

interface Pricing {
  subtotal: number;
  vat: number;
  total: number;
  vatRate: number;
  vatPercentage: number;
}

interface CheckoutFormFullProps {
  courseId: string;
  courseName: string;
  pricing: Pricing;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Billing Address
  street: string;
  city: string;
  postalCode: string;
  country: string;
  // OIB (required for the contract; personal identification number)
  oib: string;
  // Company Details (optional)
  companyName: string;
  vatNumber: string;
  // Marketing
  hearAboutUs: string;
  // Terms
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  oib?: string;
  acceptTerms?: string;
  acceptContract?: string;
  signature?: string;
  submit?: string;
}

interface MonriFormData {
  authenticity_token: string;
  order_number: string;
  amount: string;
  currency: string;
  digest: string;
  transaction_type: string;
  success_url_override: string;
  cancel_url_override: string;
  callback_url: string;
  ch_full_name: string;
  ch_email: string;
  ch_phone: string;
  ch_address: string;
  ch_city: string;
  ch_zip: string;
  ch_country: string;
  language?: string;
  order_info?: string;
  custom_data?: string;
}

// While Monri production approval is pending, checkout runs in predračun
// (bank-transfer) mode. Flip NEXT_PUBLIC_PAYMENT_MODE back to "card" (or
// remove it) + redeploy to restore the Monri card flow.
const IS_PREDRACUN = process.env.NEXT_PUBLIC_PAYMENT_MODE === "predracun";

export function CheckoutFormFull({
  courseId,
  courseName,
  pricing,
}: CheckoutFormFullProps) {
  const t = useTranslations("checkout.form");
  const monriFormRef = useRef<HTMLFormElement>(null);

  const hearAboutUsOptions = [
    { value: "instagram", label: t("hearAboutUs.options.instagram") },
    { value: "facebook", label: t("hearAboutUs.options.facebook") },
    { value: "google", label: t("hearAboutUs.options.google") },
    { value: "youtube", label: t("hearAboutUs.options.youtube") },
    { value: "friend", label: t("hearAboutUs.options.friend") },
    { value: "salon", label: t("hearAboutUs.options.salon") },
    { value: "event", label: t("hearAboutUs.options.event") },
    { value: "other", label: t("hearAboutUs.options.other") },
  ];

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    oib: "",
    companyName: "",
    vatNumber: "",
    hearAboutUs: "",
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [monriData, setMonriData] = useState<{
    formUrl: string;
    formData: MonriFormData;
  } | null>(null);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = t("validation.firstName");
    }

    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = t("validation.lastName");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = t("validation.email");
    }

    if (!formData.phone) {
      newErrors.phone = t("validation.phone");
    }

    if (!formData.street) {
      newErrors.street = t("validation.street");
    }

    if (!formData.city) {
      newErrors.city = t("validation.city");
    }

    if (!formData.postalCode) {
      newErrors.postalCode = t("validation.postalCode");
    }

    if (!formData.country) {
      newErrors.country = t("validation.country");
    }

    // OIB: required for Croatian buyers (11 digits), optional otherwise
    if (formData.country === "HR") {
      if (!/^\d{11}$/.test(formData.oib)) {
        newErrors.oib = t("validation.oib");
      }
    } else if (formData.oib && !/^[0-9A-Za-z-]{4,20}$/.test(formData.oib)) {
      newErrors.oib = t("validation.oib");
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t("validation.acceptTerms");
    }

    if (!contractAccepted) {
      newErrors.acceptContract = t("validation.acceptContract");
    }

    if (!signatureDataUrl) {
      newErrors.signature = t("validation.signature");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          oib: formData.oib || undefined,
          companyName: formData.companyName || undefined,
          vatNumber: formData.vatNumber || undefined,
          hearAboutUs: formData.hearAboutUs || undefined,
          acceptTerms: formData.acceptTerms,
          acceptMarketing: formData.acceptMarketing,
          contractAccepted,
          signatureDataUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Predračun mode: no card redirect — the customer got payment
      // instructions by email, show the confirmation page.
      if (data.predracun) {
        window.location.href = `/checkout/success?order_number=${data.orderNumber}&predracun=1`;
        return;
      }

      // Set Monri form data and submit form
      if (data.formUrl && data.formData) {
        setMonriData({
          formUrl: data.formUrl,
          formData: data.formData,
        });

        // Wait for state update, then submit the hidden form
        setTimeout(() => {
          monriFormRef.current?.submit();
        }, 100);
      }
    } catch (error) {
      setIsSubmitting(false);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
    // Note: Don't set isSubmitting to false on success - form is being submitted
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-secondary text-white text-sm flex items-center justify-center">
              1
            </span>
            {t("personalInfo.title")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label={t("personalInfo.firstName")}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("personalInfo.firstNamePlaceholder")}
              error={errors.firstName}
              required
            />
            <Input
              label={t("personalInfo.lastName")}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t("personalInfo.lastNamePlaceholder")}
              error={errors.lastName}
              required
            />
            <Input
              label={t("personalInfo.email")}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("personalInfo.emailPlaceholder")}
              error={errors.email}
              required
            />
            <Input
              label={t("personalInfo.phone")}
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("personalInfo.phonePlaceholder")}
              error={errors.phone}
              required
            />
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-secondary text-white text-sm flex items-center justify-center">
              2
            </span>
            {t("billingAddress.title")}
          </h3>
          <div className="space-y-4">
            <Input
              label={t("billingAddress.street")}
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder={t("billingAddress.streetPlaceholder")}
              error={errors.street}
              required
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label={t("billingAddress.city")}
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t("billingAddress.cityPlaceholder")}
                error={errors.city}
                required
              />
              <Input
                label={t("billingAddress.postalCode")}
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder={t("billingAddress.postalCodePlaceholder")}
                error={errors.postalCode}
                required
              />
              <Select
                label={t("billingAddress.country")}
                name="country"
                value={formData.country}
                onChange={handleChange}
                options={countryOptions}
                placeholder={t("billingAddress.countryPlaceholder")}
                error={errors.country}
                required
              />
            </div>
            <Input
              label={t("billingAddress.oib")}
              name="oib"
              value={formData.oib}
              onChange={handleChange}
              placeholder={t("billingAddress.oibPlaceholder")}
              helperText={t("billingAddress.oibHelperText")}
              error={errors.oib}
              required={formData.country === "HR"}
            />
          </div>
        </div>

        {/* Company Details (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading text-primary flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/20 text-primary text-sm flex items-center justify-center">
                3
              </span>
              {t("companyDetails.title")}
              <span className="text-sm font-normal text-primary/50">{t("companyDetails.optional")}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowCompanyFields(!showCompanyFields)}
              className="text-sm text-secondary hover:underline"
            >
              {showCompanyFields ? t("companyDetails.hide") : t("companyDetails.show")}
            </button>
          </div>

          {showCompanyFields && (
            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-cream">
              <Input
                label={t("companyDetails.companyName")}
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder={t("companyDetails.companyNamePlaceholder")}
              />
              <Input
                label={t("companyDetails.vatNumber")}
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                placeholder={t("companyDetails.vatNumberPlaceholder")}
                helperText={t("companyDetails.vatHelperText")}
              />
            </div>
          )}
        </div>

        {/* How Did You Hear About Us */}
        <div>
          <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary/20 text-primary text-sm flex items-center justify-center">
              4
            </span>
            {t("hearAboutUs.title")}
            <span className="text-sm font-normal text-primary/50">{t("hearAboutUs.optional")}</span>
          </h3>
          <Select
            name="hearAboutUs"
            value={formData.hearAboutUs}
            onChange={handleChange}
            options={hearAboutUsOptions}
            placeholder={t("hearAboutUs.placeholder")}
          />
        </div>

        {/* Contract (ugovor) — read, accept, sign */}
        <div className="pt-4 border-t border-primary/10">
          <ContractSection
            party={{
              fullName: `${formData.firstName} ${formData.lastName}`.trim(),
              street: formData.street,
              city: formData.city,
              postalCode: formData.postalCode,
              country: getCountryName(formData.country),
              oib: formData.oib,
            }}
            accepted={contractAccepted}
            onAcceptedChange={(accepted) => {
              setContractAccepted(accepted);
              if (errors.acceptContract) {
                setErrors((prev) => ({ ...prev, acceptContract: undefined }));
              }
            }}
            onSignatureChange={(dataUrl) => {
              setSignatureDataUrl(dataUrl);
              if (errors.signature) {
                setErrors((prev) => ({ ...prev, signature: undefined }));
              }
            }}
            acceptError={errors.acceptContract}
            signatureError={errors.signature}
          />
        </div>

        {/* Terms & Conditions */}
        <div className="pt-4 border-t border-primary/10">
          <div className="space-y-4">
            <Checkbox
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              error={errors.acceptTerms}
              label={
                <>
                  {t("terms.accept")}{" "}
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    className="text-secondary hover:underline"
                  >
                    {t("terms.termsOfService")}
                  </Link>{" "}
                  {t("terms.and")}{" "}
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    className="text-secondary hover:underline"
                  >
                    {t("terms.privacyPolicy")}
                  </Link>
                  {t("terms.digitalProduct")}
                </>
              }
            />
            <Checkbox
              name="acceptMarketing"
              checked={formData.acceptMarketing}
              onChange={handleChange}
              label={t("terms.marketing")}
            />
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full h-16 text-base"
            isLoading={isSubmitting}
          >
            {IS_PREDRACUN
              ? t("submit.predracunButton", { price: formatPrice(pricing.total) })
              : t("submit.button", { price: formatPrice(pricing.total) })}
          </Button>
          <p className="text-xs text-center text-primary/50 mt-4">
            {IS_PREDRACUN ? (
              t("submit.predracunNote")
            ) : (
              <>
                {t("submit.redirectNote")}
                <br />
                {t("submit.securityNote")}
              </>
            )}
          </p>
          <div className="mt-4 p-3 bg-secondary/10 border border-secondary/20 text-sm text-primary/70 text-center">
            {IS_PREDRACUN ? t("submit.predracunEmailNote") : t("submit.emailNote")}
          </div>
        </div>

        {/* Payment Logos */}
        <div className="pt-6 border-t border-primary/10">
          {IS_PREDRACUN ? (
            <p className="text-sm text-center text-primary/60">
              {t("submit.cardsComingSoon")}
              <br />
              {t("submit.installmentsComingSoon")}
            </p>
          ) : (
            <PaymentLogos variant="light" showSecurityLogos={true} />
          )}
        </div>
      </form>

      {/* Hidden Monri Form - submits to Monri payment page */}
      {monriData && (
        <form
          ref={monriFormRef}
          method="POST"
          action={monriData.formUrl}
          style={{ display: "none" }}
        >
          <input type="hidden" name="authenticity_token" value={monriData.formData.authenticity_token} />
          <input type="hidden" name="order_number" value={monriData.formData.order_number} />
          <input type="hidden" name="amount" value={monriData.formData.amount} />
          <input type="hidden" name="currency" value={monriData.formData.currency} />
          <input type="hidden" name="digest" value={monriData.formData.digest} />
          <input type="hidden" name="transaction_type" value={monriData.formData.transaction_type} />
          <input type="hidden" name="success_url_override" value={monriData.formData.success_url_override} />
          <input type="hidden" name="cancel_url_override" value={monriData.formData.cancel_url_override} />
          <input type="hidden" name="callback_url" value={monriData.formData.callback_url} />
          <input type="hidden" name="ch_full_name" value={monriData.formData.ch_full_name} />
          <input type="hidden" name="ch_email" value={monriData.formData.ch_email} />
          <input type="hidden" name="ch_phone" value={monriData.formData.ch_phone} />
          <input type="hidden" name="ch_address" value={monriData.formData.ch_address} />
          <input type="hidden" name="ch_city" value={monriData.formData.ch_city} />
          <input type="hidden" name="ch_zip" value={monriData.formData.ch_zip} />
          <input type="hidden" name="ch_country" value={monriData.formData.ch_country} />
          {monriData.formData.language && (
            <input type="hidden" name="language" value={monriData.formData.language} />
          )}
          {monriData.formData.order_info && (
            <input type="hidden" name="order_info" value={monriData.formData.order_info} />
          )}
          {monriData.formData.custom_data && (
            <input type="hidden" name="custom_data" value={monriData.formData.custom_data} />
          )}
        </form>
      )}
    </>
  );
}
