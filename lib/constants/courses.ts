export interface Course {
  id: string;
  name: string;
  subtitle: string;
  price: number; // in cents, without VAT
  displayPrice: string;
  currency: string;
  features: string[];
  image: string;
}

export const VAT_RATE = 0.25; // 25% Croatian VAT

export const courses: Record<string, Course> = {
  "foundation-certification": {
    id: "foundation-certification",
    name: "Brendia Pro® Artist",
    subtitle: "Master the Fundamentals",
    price: 300000, // €3,000 in cents (without VAT)
    displayPrice: "€3,000",
    currency: "eur",
    image: "/images/courses/foundation.jpg",
    features: [
      "30+ comprehensive video lessons",
      "Step-by-step installation guides",
      "Client consultation techniques",
      "Maintenance and aftercare protocols",
      "Official Brendia Pro® certification",
      "Private community access",
      "12-month course access",
      "Free future updates",
    ],
  },
  "master-certification": {
    id: "master-certification",
    name: "Advanced Brendia Pro® Artist",
    subtitle: "Achieve Excellence",
    price: 400000, // €4,000 in cents (without VAT)
    displayPrice: "€4,000",
    currency: "eur",
    image: "/images/courses/master.jpg",
    features: [
      "Everything in Foundation Certification",
      "50+ advanced video lessons",
      "Complex color matching mastery",
      "Corrective work procedures",
      "Business growth strategies",
      "Marketing templates & guides",
      "1-on-1 mentorship session with Nikolina",
      "Priority community support",
      "Guest educator masterclasses",
    ],
  },
  "brendia-pro-artist-1v1": {
    id: "brendia-pro-artist-1v1",
    name: "Brendia Pro® Artist 1v1",
    subtitle: "Live Edukacija u Salonu",
    price: 200000, // €2,000 in cents (without VAT)
    displayPrice: "€2,000",
    currency: "eur",
    image: "/images/courses/foundation.jpg",
    features: [
      "Live edukacija s mentorom",
      "4 sata hands-on prakse",
      "Personalizirani pristup",
      "Službena Brendia Pro® certifikacija",
      "Pristup platformi (shop, zajednica)",
      "Welcome box s materijalima",
    ],
  },
  "brendia-pro-master-1v1": {
    id: "brendia-pro-master-1v1",
    name: "Brendia Pro® Master 1v1",
    subtitle: "Live Edukacija u Studiju",
    price: 500000, // €5,000 in cents (without VAT)
    displayPrice: "€5,000",
    currency: "eur",
    image: "/images/courses/master.jpg",
    features: [
      "2 dana live edukacije s mentorom",
      "12 sati hands-on prakse (6h/dan)",
      "Foundation + Master sadržaj",
      "Personalizirani pristup",
      "Službena Brendia Pro® certifikacija",
      "Pristup platformi (shop, zajednica)",
      "Welcome box s materijalima",
    ],
  },
};

export function getCourse(courseId: string): Course | undefined {
  return courses[courseId];
}

export function calculatePricing(priceInCents: number) {
  const subtotal = priceInCents;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  return {
    subtotal,
    vat,
    total,
    vatRate: VAT_RATE,
    vatPercentage: Math.round(VAT_RATE * 100),
  };
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
