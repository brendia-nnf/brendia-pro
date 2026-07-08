"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "hr" | "en") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 bg-primary/5 rounded-full p-0.5">
      <button
        onClick={() => switchLocale("hr")}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
          locale === "hr"
            ? "bg-primary text-white"
            : "text-primary/60 hover:text-primary"
        )}
      >
        HR
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
          locale === "en"
            ? "bg-primary text-white"
            : "text-primary/60 hover:text-primary"
        )}
      >
        EN
      </button>
    </div>
  );
}
