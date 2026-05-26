"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Form section icons as SVG components
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconGraduationCap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconAward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const IconCreditCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16.5 9.4 7.55 4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconFileText = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

interface FormData {
  // Basic Info
  fullName: string;
  email: string;
  phone: string;
  cityCountry: string;
  // Business Info
  salonName: string;
  instagram: string;
  website: string;
  // Experience
  yearsInIndustry: string;
  doesHairExtensions: string;
  sewingExperience: string;
  // Education Level
  educationLevel: string;
  // Certificate
  certificateName: string;
  // Payment
  invoiceType: string;
  paymentMethod: string;
  // Shipping
  shippingAddress: string;
  postalCode: string;
  // Masterclass
  masterclassDate: string;
  // Agreements
  termsAccepted: boolean;
  contentConsent: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  cityCountry: "",
  salonName: "",
  instagram: "",
  website: "",
  yearsInIndustry: "",
  doesHairExtensions: "",
  sewingExperience: "",
  educationLevel: "",
  certificateName: "",
  invoiceType: "",
  paymentMethod: "",
  shippingAddress: "",
  postalCode: "",
  masterclassDate: "",
  termsAccepted: false,
  contentConsent: false,
};

export default function OnboardingPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Došlo je do greške. Molimo pokušajte ponovo.");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-nikolina.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
        </div>

        <div className="text-center max-w-lg relative z-10">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl text-white mb-4">
            Hvala ti!
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Tvoja prijava je uspješno zaprimljena. Uskoro ćeš dobiti e-mail s
            daljnjim informacijama o edukaciji.
          </p>
          <p className="text-secondary text-lg font-heading italic">
            Welcome to Brendia Pro® Education.
          </p>
          <div className="mt-12">
            <Image
              src="/images/logo-white.png"
              alt="Brendia Pro"
              width={120}
              height={40}
              className="mx-auto opacity-60"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Header with Background Image */}
      <header className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/courses/foundation.jpg"
            alt="Brendia Pro Education"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
          {/* Decorative gold lines */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 py-16">
          <Link href="/">
            <Image
              src="/images/logo-white.png"
              alt="Brendia Pro"
              width={160}
              height={55}
              className="mx-auto mb-8"
              priority
            />
          </Link>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-20 bg-secondary/60" />
            <span className="text-secondary text-lg">✦</span>
            <div className="h-px w-20 bg-secondary/60" />
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-wide">
            STUDENT ONBOARDING FORM
          </h1>

          <p className="text-secondary text-sm md:text-base tracking-[0.25em] uppercase">
            Welcome to Brendia Pro® Education
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Intro Text */}
      <div className="bg-white border-b border-primary/10">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-primary/70 leading-relaxed text-lg">
            Molimo te ispuniš ovaj kratki onboarding obrazac kako bismo
            pripremili tvoje podatke za edukaciju, certifikat, pristup platformi
            i dostavu welcome boxa.
          </p>
          <p className="text-primary/70 leading-relaxed mt-4 text-lg">
            Hvala ti što si dio prve generacije Brendia Pro® Edukacije.{" "}
            <span className="text-secondary">♥</span>
          </p>
        </div>
      </div>

      {/* Main Content with Side Panel */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sticky Side Panel - Desktop Only */}
          <div className="hidden lg:block lg:w-[380px] flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Main side image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/courses/onboarding.JPG"
                  alt="Brendia Pro® Education"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-heading text-white text-2xl italic">
                    &ldquo;Jedva čekam da te upoznam.&rdquo;
                  </p>
                  <p className="text-white/70 text-sm mt-2">— Nikolina Kljaić</p>
                </div>
              </div>

              {/* Info card */}
              <div className="bg-primary p-6 text-white">
                <h3 className="font-heading text-xl mb-4 text-secondary">
                  Što uključuje edukacija?
                </h3>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-0.5">✦</span>
                    <span>Pristup online platformi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-0.5">✦</span>
                    <span>Certifikat po završetku</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-0.5">✦</span>
                    <span>Welcome box s materijalima</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-0.5">✦</span>
                    <span>Besplatni masterclass (prva generacija)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-0.5">✦</span>
                    <span>Pristup sadržaju 24 mjeseca</span>
                  </li>
                </ul>
              </div>

              {/* Second decorative image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/images/skills-extensions.jpg"
                  alt="Hair Extensions"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-8">
                {/* Section 1: Basic Info */}
                <FormSection number={1} title="BASIC INFO" icon={<IconUser />}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormInput
                      label="Ime i prezime"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                    <FormInput
                      label="E-mail adresa"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <FormInput
                      label="Broj telefona"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    <FormInput
                      label="Grad / država"
                      name="cityCountry"
                      value={formData.cityCountry}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </FormSection>

                {/* Section 2: Business Info */}
                <FormSection number={2} title="BUSINESS INFO" icon={<IconBriefcase />}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormInput
                      label="Naziv salona"
                      name="salonName"
                      value={formData.salonName}
                      onChange={handleInputChange}
                      optional
                    />
                    <FormInput
                      label="Instagram profil"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <FormInput
                      label="Website"
                      name="website"
                      type="text"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="www.example.com"
                      optional
                    />
                  </div>
                </FormSection>

                {/* Section 3: Experience */}
                <FormSection number={3} title="EXPERIENCE" icon={<IconStar />}>
                  <div className="space-y-6">
                    <FormInput
                      label="Koliko dugo radiš u beauty/hair industriji?"
                      name="yearsInIndustry"
                      value={formData.yearsInIndustry}
                      onChange={handleInputChange}
                      required
                    />

                    <div>
                      <p className="text-sm font-medium text-primary mb-3">
                        Radiš li trenutno hair extensions?
                      </p>
                      <div className="flex gap-6">
                        <RadioOption
                          name="doesHairExtensions"
                          value="da"
                          label="Da"
                          checked={formData.doesHairExtensions === "da"}
                          onChange={handleInputChange}
                        />
                        <RadioOption
                          name="doesHairExtensions"
                          value="ne"
                          label="Ne"
                          checked={formData.doesHairExtensions === "ne"}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-primary mb-3">
                        Iskustvo sa sewing metodama:
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <RadioOption
                          name="sewingExperience"
                          value="beginner"
                          label="Beginner"
                          checked={formData.sewingExperience === "beginner"}
                          onChange={handleInputChange}
                        />
                        <RadioOption
                          name="sewingExperience"
                          value="intermediate"
                          label="Intermediate"
                          checked={formData.sewingExperience === "intermediate"}
                          onChange={handleInputChange}
                        />
                        <RadioOption
                          name="sewingExperience"
                          value="advanced"
                          label="Advanced"
                          checked={formData.sewingExperience === "advanced"}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* Decorative Image Break - Mobile Only */}
                <div className="lg:hidden relative h-48 -mx-4 overflow-hidden">
                  <Image
                    src="/images/skills-precision.jpg"
                    alt="Precision work"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent" />
                </div>

                {/* Section 4: Education Level */}
                <FormSection
                  number={4}
                  title="EDUCATION LEVEL"
                  icon={<IconGraduationCap />}
                >
                  <div>
                    <p className="text-sm font-medium text-primary mb-4">
                      Koji Brendia Pro® Education level upisuješ?
                    </p>
                    <div className="space-y-4">
                      <EducationLevelOption
                        name="educationLevel"
                        value="brendia-pro-artist"
                        title="Brendia Pro® Artist"
                        description="Bazna edukacija"
                        price="3.000€ + PDV"
                        checked={formData.educationLevel === "brendia-pro-artist"}
                        onChange={handleInputChange}
                      />
                      <EducationLevelOption
                        name="educationLevel"
                        value="advanced-brendia-pro-artist"
                        title="Advanced Brendia Pro® Artist"
                        description="Napredna edukacija"
                        price="4.000€ + PDV"
                        checked={
                          formData.educationLevel === "advanced-brendia-pro-artist"
                        }
                        onChange={handleInputChange}
                      />
                      <EducationLevelOption
                        name="educationLevel"
                        value="brendia-pro-master"
                        title="Brendia Pro® Master"
                        description="Komplet 2u1 + 1:1 mentorstvo"
                        price="5.000€ + PDV"
                        checked={formData.educationLevel === "brendia-pro-master"}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </FormSection>

                {/* Section 5: Certificate Info */}
                <FormSection number={5} title="CERTIFICATE INFO" icon={<IconAward />}>
                  <FormInput
                    label="Kako želiš da tvoje ime bude napisano na certifikatu?"
                    name="certificateName"
                    value={formData.certificateName}
                    onChange={handleInputChange}
                    required
                  />
                </FormSection>

                {/* Section 6: Payment */}
                <FormSection number={6} title="PAYMENT" icon={<IconCreditCard />}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm font-medium text-primary mb-3">
                        Vrsta računa:
                      </p>
                      <div className="flex gap-6">
                        <RadioOption
                          name="invoiceType"
                          value="fizicka-osoba"
                          label="Fizička osoba"
                          checked={formData.invoiceType === "fizicka-osoba"}
                          onChange={handleInputChange}
                        />
                        <RadioOption
                          name="invoiceType"
                          value="r1"
                          label="R1"
                          checked={formData.invoiceType === "r1"}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-3">
                        Način plaćanja:
                      </p>
                      <div className="flex gap-6">
                        <RadioOption
                          name="paymentMethod"
                          value="jednokratno"
                          label="Jednokratno"
                          checked={formData.paymentMethod === "jednokratno"}
                          onChange={handleInputChange}
                        />
                        <RadioOption
                          name="paymentMethod"
                          value="rate"
                          label="Rate"
                          checked={formData.paymentMethod === "rate"}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* Decorative Image Break - Mobile Only */}
                <div className="lg:hidden relative h-48 -mx-4 overflow-hidden">
                  <Image
                    src="/images/courses/onboarding.JPG"
                    alt="Brendia Pro® Education"
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-heading text-white text-lg italic">
                      &ldquo;Jedva čekam da te upoznam.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Section 7: Shipping Info */}
                <FormSection number={7} title="SHIPPING INFO" icon={<IconPackage />}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormInput
                        label="Adresa za dostavu welcome boxa"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <FormInput
                      label="Poštanski broj"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </FormSection>

                {/* Section 8: Masterclass */}
                <FormSection number={8} title="MASTERCLASS" icon={<IconCalendar />}>
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">
                      Masterclass će biti održan u Zagrebu.
                    </p>
                    <p className="text-sm text-primary/60 mb-4">
                      Koji datum ti odgovara?
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <RadioOption
                        name="masterclassDate"
                        value="16-06"
                        label="16.6."
                        checked={formData.masterclassDate === "16-06"}
                        onChange={handleInputChange}
                      />
                      <RadioOption
                        name="masterclassDate"
                        value="23-06"
                        label="23.6."
                        checked={formData.masterclassDate === "23-06"}
                        onChange={handleInputChange}
                      />
                      <RadioOption
                        name="masterclassDate"
                        value="ne-mogu-doci"
                        label="Ne mogu doći"
                        checked={formData.masterclassDate === "ne-mogu-doci"}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </FormSection>

                {/* Section 9: Agreement */}
                <FormSection number={9} title="AGREEMENT" icon={<IconFileText />}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleInputChange}
                        className="peer sr-only"
                        required
                      />
                      <div
                        className={cn(
                          "w-5 h-5 border-2 border-primary/30 bg-white",
                          "transition-all duration-200",
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2",
                          "peer-checked:bg-secondary peer-checked:border-secondary",
                          "group-hover:border-primary/50"
                        )}
                      >
                        <svg
                          className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <svg
                        className="absolute inset-0 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-primary/70 leading-relaxed select-none">
                      Potvrđujem da sam pročitala i prihvaćam{" "}
                      <Link
                        href="/legal/terms"
                        target="_blank"
                        className="text-secondary hover:underline"
                      >
                        Brendia Pro® Education Terms & Conditions
                      </Link>
                      .
                    </span>
                  </label>
                </FormSection>

                {/* Section 10: Content Consent */}
                <FormSection
                  number={10}
                  title="CONTENT CONSENT"
                  icon={<IconCamera />}
                >
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        name="contentConsent"
                        checked={formData.contentConsent}
                        onChange={handleInputChange}
                        className="peer sr-only"
                      />
                      <div
                        className={cn(
                          "w-5 h-5 border-2 border-primary/30 bg-white",
                          "transition-all duration-200",
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2",
                          "peer-checked:bg-secondary peer-checked:border-secondary",
                          "group-hover:border-primary/50"
                        )}
                      />
                      <svg
                        className="absolute inset-0 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-primary/70 leading-relaxed select-none">
                      Slažem se da fotografije i video sadržaj nastali tijekom
                      masterclassa mogu biti korišteni u promotivne svrhe Brendia Pro®
                      Education.
                    </span>
                  </label>
                </FormSection>
              </div>

              {/* Submit Button */}
              <div className="mt-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-4 bg-secondary text-white font-medium tracking-widest text-sm",
                    "transition-all duration-300",
                    "hover:bg-secondary/90 active:scale-[0.99]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      ŠALJEM...
                    </span>
                  ) : (
                    "SUBMIT"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Image
              src="/images/logo-white.png"
              alt="Brendia Pro"
              width={100}
              height={35}
              className="opacity-60"
            />
            <p className="font-heading text-white/60 italic text-lg">
              Elevate your art.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-secondary text-sm">✦</span>
              <span className="text-white/80 text-sm tracking-[0.2em] uppercase">
                Brendia Pro® Education
              </span>
              <span className="text-secondary text-sm">✦</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component: Form Section Wrapper
function FormSection({
  number,
  title,
  icon,
  children,
}: {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-secondary">{icon}</span>
        <h2 className="text-sm font-semibold tracking-wider text-primary">
          {number}. {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// Component: Form Input
function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  optional,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-primary mb-2">
        {label}
        {optional && (
          <span className="text-primary/40 font-normal ml-1">(optional)</span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full px-4 py-3 bg-cream/50 border border-primary/10 text-primary placeholder:text-primary/30",
          "transition-all duration-200",
          "focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary focus:bg-white"
        )}
      />
    </div>
  );
}

// Component: Radio Option
function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 border-primary/30 bg-white",
            "transition-all duration-200",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2",
            "peer-checked:border-secondary",
            "group-hover:border-primary/50"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-secondary",
            "scale-0 transition-transform duration-200",
            "peer-checked:scale-100"
          )}
        />
      </div>
      <span className="text-sm text-primary/70 select-none">{label}</span>
    </label>
  );
}

// Component: Education Level Option (special radio with price)
function EducationLevelOption({
  name,
  value,
  title,
  description,
  price,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  title: string;
  description: string;
  price: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between p-4 border cursor-pointer transition-all duration-200",
        checked
          ? "border-secondary bg-secondary/5"
          : "border-primary/10 bg-cream/30 hover:border-primary/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
          />
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 bg-white",
              "transition-all duration-200",
              checked ? "border-secondary" : "border-primary/30"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-secondary",
              "scale-0 transition-transform duration-200",
              checked && "scale-100"
            )}
          />
        </div>
        <div>
          <p className="font-medium text-primary">{title}</p>
          <p className="text-sm text-primary/50">{description}</p>
        </div>
      </div>
      <span className="text-secondary font-semibold whitespace-nowrap ml-4">
        {price}
      </span>
    </label>
  );
}
