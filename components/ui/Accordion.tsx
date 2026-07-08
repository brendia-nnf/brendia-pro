"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within Accordion");
  }
  return context;
}

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  children,
  defaultOpen = [],
  allowMultiple = false,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (value: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    } else {
      setOpenItems((prev) => (prev.includes(value) ? [] : [value]));
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className={cn("divide-y divide-primary/10", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { openItems } = useAccordion();
  const isOpen = openItems.includes(value);

  return (
    <div className={cn("", className)} data-state={isOpen ? "open" : "closed"}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({
  value,
  children,
  className,
}: AccordionTriggerProps) {
  const { openItems, toggleItem } = useAccordion();
  const isOpen = openItems.includes(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between py-5 text-left font-medium text-primary transition-colors hover:text-secondary",
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      <svg
        className={cn(
          "h-5 w-5 text-primary/40 transition-transform duration-300",
          isOpen && "rotate-180"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

interface AccordionContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionContent({
  value,
  children,
  className,
}: AccordionContentProps) {
  const { openItems } = useAccordion();
  const isOpen = openItems.includes(value);

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <div className={cn("pb-5 text-primary/70 leading-relaxed", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
