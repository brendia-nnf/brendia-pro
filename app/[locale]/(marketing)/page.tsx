import {
  Hero,
  ValueProposition,
  VideoIntro,
  Stats,
  CoursePreview,
  AboutFounder,
  Testimonials,
  CTA,
} from "@/components/sections";
import { OrganizationSchema, WebsiteSchema } from "@/components/shared";

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <Hero />
      <ValueProposition />
      <VideoIntro />
      <Stats />
      <CoursePreview />
      <AboutFounder />
      <Testimonials />
      <CTA />
    </>
  );
}
