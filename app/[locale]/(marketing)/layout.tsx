import { Header, Footer } from "@/components/layout";
import { LenisProvider, GSAPProvider } from "@/providers";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <GSAPProvider>
        <Header />
        <main>{children}</main>
        <Footer />
      </GSAPProvider>
    </LenisProvider>
  );
}
