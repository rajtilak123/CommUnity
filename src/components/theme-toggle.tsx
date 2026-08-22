"use client";

import { Contrast, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

type ThemeOption = "light" | "dark" | "system";

const options: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Contrast },
];

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-[48px] w-full max-w-md animate-pulse rounded-lg border border-outline-variant/50 bg-surface-container-low",
          className,
        )}
      />
    );
  }

  const activeTheme = (theme ?? "light") as ThemeOption;

  return (
    <div
      className={cn(
        "flex w-full max-w-md items-center gap-1 rounded-lg border border-outline-variant/50 bg-surface-container-low p-1",
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = activeTheme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-label-md font-semibold transition-all cursor-pointer",
              isActive
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
