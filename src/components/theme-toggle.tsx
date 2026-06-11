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
          "h-[42px] w-full max-w-md animate-pulse rounded-lg border border-outline-variant/50 bg-surface-container-low",
          className,
        )}
      />
    );
  }

  const activeTheme = (theme ?? "light") as ThemeOption;

  return (
    <div
      className={cn(
        "flex max-w-md items-center justify-between rounded-lg border border-outline-variant/50 bg-surface-container-low p-1",
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
              "flex flex-1 items-center justify-center gap-sm rounded-md py-2 text-label-md transition-all",
              isActive
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface",
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
