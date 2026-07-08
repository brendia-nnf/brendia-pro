"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `checkbox-${generatedId}`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={cn(
            "flex items-start gap-3 cursor-pointer group",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              className={cn(
                "peer sr-only",
                className
              )}
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 border-2 border-primary/30 bg-transparent",
                "transition-all duration-200",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2",
                "peer-checked:bg-secondary peer-checked:border-secondary",
                "group-hover:border-primary/50",
                error && "border-red-500"
              )}
            >
              <svg
                className={cn(
                  "w-full h-full text-white opacity-0 scale-50",
                  "transition-all duration-200",
                  "peer-checked:opacity-100 peer-checked:scale-100"
                )}
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
            {/* Checkmark overlay for checked state */}
            <svg
              className={cn(
                "absolute inset-0 w-5 h-5 text-white pointer-events-none",
                "opacity-0 scale-50 transition-all duration-200",
                "peer-checked:opacity-100 peer-checked:scale-100"
              )}
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
          {label && (
            <span className="text-sm text-primary/70 leading-relaxed select-none">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox, type CheckboxProps };
