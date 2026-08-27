interface OrganizationSchemaProps {
  url?: string;
}

export function OrganizationSchema({ url = "https://brendiapro.hr" }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Brendia Pro®",
    url: url,
    logo: `${url}/images/logo.png`,
    description:
      "Premium weft extensions education and certification courses by Nikolina Kljaić.",
    founder: {
      "@type": "Person",
      name: "Nikolina Kljaić",
      jobTitle: "Founder & Lead Educator",
    },
    sameAs: [
      "https://www.instagram.com/brendia.pro/",
      "https://facebook.com/brendiapro",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@brendiapro.hr",
      contactType: "customer service",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CourseSchemaProps {
  name: string;
  description: string;
  price: string;
  currency?: string;
  url: string;
  provider?: string;
  duration?: string;
}

export function CourseSchema({
  name,
  description,
  price,
  currency = "EUR",
  url,
  provider = "Brendia Pro®",
  duration,
}: CourseSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: name,
    description: description,
    provider: {
      "@type": "EducationalOrganization",
      name: provider,
      url: "https://brendiapro.hr",
    },
    offers: {
      "@type": "Offer",
      price: price.replace(/[^0-9]/g, ""),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url: url,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: duration || "Self-paced",
    },
    educationalCredentialAwarded: "Brendia Pro® Certification",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: Array<{ question: string; answer: string }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  url?: string;
}

export function WebsiteSchema({ url = "https://brendiapro.hr" }: WebsiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Brendia Pro®",
    url: url,
    description:
      "Premium weft extensions education and certification courses.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
